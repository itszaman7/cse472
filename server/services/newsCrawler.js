const axios = require("axios");
const cheerio = require("cheerio");
const translate = require("@vitalets/google-translate-api");
const crypto = require("crypto");
// Simple in-file concurrency limiter to avoid ESM interop issues
function createLimiter(maxConcurrent) {
  let activeCount = 0;
  const queue = [];
  const next = () => {
    if (queue.length === 0 || activeCount >= maxConcurrent) return;
    const { fn, resolve, reject } = queue.shift();
    activeCount += 1;
    Promise.resolve()
      .then(fn)
      .then((value) => resolve(value))
      .catch((err) => reject(err))
      .finally(() => {
        activeCount -= 1;
        next();
      });
  };
  return (fn) =>
    new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
}
const {
  analyzeMediaBatch,
  analyzeTextDescription,
} = require("./geminiService");
const { detectDeepfakeFromUrl } = require("./deepfakeService");
const {
  analyzeTextForAI,
  getAIDetectionSummary,
} = require("./aiDetectionService");

// --- Crawl control (supports graceful stop) ---
const crawlControl = {
  isRunning: false,
  stopRequested: false,
  startedAt: null,
  source: null,
  builtCount: 0,
  extractedCount: 0,
  insertedCount: 0,
  skippedCount: 0,
  lastError: null,
};

function requestStopCrawl() {
  crawlControl.stopRequested = true;
}

function getCrawlStatus() {
  return { ...crawlControl };
}

function resetCrawlStatus({ source } = {}) {
  crawlControl.isRunning = true;
  crawlControl.stopRequested = false;
  crawlControl.startedAt = new Date().toISOString();
  crawlControl.source = source || null;
  crawlControl.builtCount = 0;
  crawlControl.extractedCount = 0;
  crawlControl.insertedCount = 0;
  crawlControl.skippedCount = 0;
  crawlControl.lastError = null;
}

// Crawl pacing and limits to respect API quotas
const CRAWL_CONFIG = {
  maxArticlesPerSource: 3, // per source per run
  maxTotalPosts: 6, // total per run
  buildConcurrency: 1, // serialize builds
  aiDelayMs: 12000, // delay between AI calls (12s)
};

const BD_NEWS_SOURCES = [
  { name: "Prothom Alo", url: "https://www.prothomalo.com/crime", lang: "bn" },
  {
    name: "BDNews24 Bangla",
    url: "https://bangla.bdnews24.com/crime/",
    lang: "bn",
  },
  {
    name: "Kaler Kantho",
    url: "https://www.kalerkantho.com/online/country-news/crime",
    lang: "bn",
  },
  { name: "Jugantor", url: "https://www.jugantor.com/crime-news", lang: "bn" },
  { name: "Samakal", url: "https://samakal.com/list/crime", lang: "bn" },
  { name: "Ittefaq", url: "https://www.ittefaq.com.bd/crime", lang: "bn" },
  {
    name: "The Daily Star",
    url: "https://www.thedailystar.net/crime",
    lang: "en",
  },
  {
    name: "Dhaka Tribune",
    url: "https://www.dhakatribune.com/articles/crime",
    lang: "en",
  },
  {
    name: "The Business Standard",
    url: "https://www.tbsnews.net/crime",
    lang: "en",
  },
  { name: "New Age", url: "https://www.newagebd.net/tags/crime", lang: "en" },
];

function hashString(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function safeTranslateIfBangla(text, lang) {
  try {
    if (!text) return text;
    if (lang !== "bn") return text;
    const result = await translate(text, { to: "en" });
    return result && result.text ? result.text : text;
  } catch {
    return text;
  }
}

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,bn-BD;q=0.8",
  Referer: "https://www.google.com/",
};

async function fetchHtml(url) {
  const res = await axios.get(url, {
    timeout: 20000,
    headers: DEFAULT_HEADERS,
  });
  return res.data;
}

function extractArticles(source, html) {
  const $ = cheerio.load(html);
  const articles = [];
  // Generic extraction fallbacks. For production, add per-site selectors for better accuracy
  $("a").each((_, el) => {
    const title = ($(el).attr("title") || $(el).text() || "").trim();
    const href = $(el).attr("href") || "";
    if (!title || title.length < 10) return;
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

    const absoluteUrl = href.startsWith("http")
      ? href
      : new URL(href, source.url).toString();
    // Heuristics: same host as source and clearly crime-related
    try {
      const srcHost = new URL(source.url).hostname.replace(/^www\./, "");
      const linkHost = new URL(absoluteUrl).hostname.replace(/^www\./, "");
      if (srcHost !== linkHost) return;
      const path = new URL(absoluteUrl).pathname || "";
      // Exclude index/category/tag listing pages
      const excludedPaths = [
        /^\/?$/,
        /\/tags\//i,
        /\/tag\//i,
        /\/category\//i,
        /\/list\//i,
        /\/newsletter/i,
        /\/photo\//i,
        /\/video\//i,
        /\/sports\//i,
        /\/lifestyle\//i,
      ];
      if (excludedPaths.some((re) => re.test(path))) return;
      // Require crime signal in URL or title
      if (!/crime/i.test(absoluteUrl) && !/crime/i.test(title)) return;
      // Prefer article-like URLs: have date or long slug or numeric id
      const looksLikeArticle =
        /(\d{4})\/(\d{1,2})\/(\d{1,2})/.test(path) ||
        /\d{6,}/.test(path) ||
        path.split("/").pop().replace(/[-_]/g, "").length > 16;
      if (!looksLikeArticle) return;
    } catch {}

    articles.push({
      source: source.name,
      sourceUrl: source.url,
      url: absoluteUrl,
      title,
      lang: source.lang,
    });
  });
  // Deduplicate by URL
  const seen = new Set();
  return articles.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
}

// Build a lightweight preview (no AI calls)
async function buildPreviewFromArticle(article) {
  const details = await fetchArticleDetails(article);
  const translatedTitle = await safeTranslateIfBangla(
    details.title || article.title,
    article.lang
  );
  const translatedText = await safeTranslateIfBangla(
    details.contentText,
    article.lang
  );
  const images = (details.images || []).slice(0, 3);
  return {
    title: translatedTitle,
    originalTitle: details.title || article.title,
    contentText: translatedText || details.description || translatedTitle,
    images,
    source: article.source,
    sourceUrl: article.url,
    lang: article.lang,
  };
}

// Collect previews across sources without DB insert
async function collectPreviewFromSources(
  onlySourceName = null,
  limitPerSource = 3
) {
  const items = [];
  const debugReport = [];
  const sources = onlySourceName
    ? BD_NEWS_SOURCES.filter(
        (s) => s.name.toLowerCase() === onlySourceName.toLowerCase()
      )
    : BD_NEWS_SOURCES;

  for (const source of sources) {
    const entry = {
      source: source.name,
      url: source.url,
      extracted: 0,
      built: 0,
      sampleUrls: [],
      error: null,
    };
    try {
      const html = await fetchHtml(source.url);
      const articles = extractArticles(source, html).slice(0, limitPerSource);
      entry.extracted = articles.length;
      entry.sampleUrls = articles.slice(0, 5).map((a) => a.url);
      const limit = createLimiter(1);
      for (const a of articles) {
        const preview = await limit(() => buildPreviewFromArticle(a));
        items.push(preview);
        entry.built += 1;
      }
    } catch (e) {
      entry.error = (e && e.message) || String(e);
    } finally {
      debugReport.push(entry);
    }
  }
  return { items, debugReport };
}

async function fetchArticleDetails(article) {
  const html = await fetchHtml(article.url);
  const $ = cheerio.load(html);

  const ogTitle = $('meta[property="og:title"]').attr("content") || "";
  const ogDescription =
    $('meta[property="og:description"]').attr("content") || "";
  const ogImage = $('meta[property="og:image"]').attr("content") || "";
  const twImage =
    $('meta[name="twitter:image"], meta[property="twitter:image"]').attr(
      "content"
    ) || "";
  const canonical = $('link[rel="canonical"]').attr("href") || "";

  let mainText = "";
  const textCandidates = [];
  [
    "article",
    "main",
    "section",
    ".article",
    ".content",
    ".post-content",
    "#content",
  ].forEach((sel) => {
    $(sel)
      .find("p")
      .each((_, p) => {
        const t = $(p).text().trim();
        if (t && t.length > 40) textCandidates.push(t);
      });
  });
  if (textCandidates.length === 0) {
    $("p").each((_, p) => {
      const t = $(p).text().trim();
      if (t && t.length > 40) textCandidates.push(t);
    });
  }
  mainText = textCandidates.slice(0, 12).join("\n\n");

  const imageUrls = new Set();
  function shouldIncludeImage(url) {
    if (!url) return false;
    const absolute = url.startsWith("http")
      ? url
      : new URL(url, article.url).toString();
    if (!/(\.jpg|\.jpeg|\.png|\.webp)(\?|$)/i.test(absolute)) return false;
    const lower = absolute.toLowerCase();
    const badHints = [
      "logo",
      "icon",
      "sprite",
      "placeholder",
      "avatar",
      "app-store",
      "play-store",
      "google-play",
      "banner",
      "ads",
      "/ad-",
      "promo",
      "sponsor",
      "/themes/",
      "/sloth/images/",
      "/assets/",
    ];
    if (badHints.some((h) => lower.includes(h))) return false;
    return true;
  }

  if (shouldIncludeImage(ogImage)) imageUrls.add(ogImage);
  if (shouldIncludeImage(twImage)) imageUrls.add(twImage);
  // try typical article content containers first
  const containers = [
    "article",
    ".article",
    ".article-body",
    ".post-content",
    ".entry-content",
    ".content",
    "#content",
  ];
  let imgFound = false;
  for (const sel of containers) {
    $(sel)
      .find("figure img, img")
      .each((_, img) => {
        const src = $(img).attr("src") || $(img).attr("data-src") || "";
        if (!src) return;
        const absolute = src.startsWith("http")
          ? src
          : new URL(src, article.url).toString();
        if (shouldIncludeImage(absolute)) {
          imageUrls.add(absolute);
          imgFound = true;
        }
      });
    if (imgFound) break;
  }
  if (!imgFound) {
    $("figure img, img").each((_, img) => {
      const src = $(img).attr("src") || $(img).attr("data-src") || "";
      if (!src) return;
      const absolute = src.startsWith("http")
        ? src
        : new URL(src, article.url).toString();
      if (shouldIncludeImage(absolute)) {
        imageUrls.add(absolute);
      }
    });
  }

  return {
    title: ogTitle || article.title,
    description: ogDescription,
    contentText: mainText,
    images: Array.from(imageUrls).slice(0, 4),
  };
}

function consolidateThreatLevel(mediaLevel, textLevel) {
  const order = ["Low", "Medium", "High", "Critical"];
  const a = order.indexOf(mediaLevel || "Low");
  const b = order.indexOf(textLevel || "Low");
  return order[Math.max(a, b)] || "Low";
}

async function buildPostFromArticle(article, enableAI = true) {
  const details = await fetchArticleDetails(article);
  const translatedTitle = await safeTranslateIfBangla(
    details.title || article.title,
    article.lang
  );
  const translatedText = await safeTranslateIfBangla(
    details.contentText,
    article.lang
  );

  const attachments = (details.images || []).slice(0, 1).map((url) => ({
    url,
    public_id: null,
    file_type: "image",
  }));

  const aiResults = {
    mediaAnalysis: null,
    textAnalysis: null,
    overallCertainty: 0,
    aiGeneratedBadges: [],
    aiThreatLevel: "Low",
    deepfake: { anyFlagged: false, items: [] },
    aiDetection: {
      hasAIGeneratedContent: false,
      flaggedFields: [],
      overallConfidence: 0,
    },
  };

  // Only perform AI analysis if enabled
  if (enableAI) {
    if (attachments.length > 0) {
      try {
        const mediaToAnalyze = attachments.map((att) => ({
          url: att.url,
          fileType: "image",
        }));
        const batch = await analyzeMediaBatch(mediaToAnalyze);
        if (batch.success) {
          aiResults.mediaAnalysis = batch.analysis;
          aiResults.aiGeneratedBadges = batch.analysis.crimeBadges || [];
          aiResults.overallCertainty = batch.analysis.certaintyPercentage || 0;
          aiResults.aiThreatLevel = batch.analysis.threatLevel || "Low";
        }

        // Deepfake detection for crawled images
        for (const att of attachments) {
          if (att.file_type === "image") {
            try {
              console.log(`Checking crawled image for deepfake: ${att.url}`);
              const df = await detectDeepfakeFromUrl(att.url);
              if (df.success) {
                aiResults.deepfake.items.push({
                  url: att.url,
                  label: df.label,
                  score: df.score,
                  confidence: df.confidence,
                });
                if (
                  df.label?.toLowerCase().includes("deepfake") &&
                  df.confidence >= 0.7
                ) {
                  aiResults.deepfake.anyFlagged = true;
                }
              }
            } catch (e) {
              console.error(
                "Deepfake detection error for crawled image:",
                e.message
              );
              // non-blocking
            }
          }
        }
      } catch {}
    }

    if (translatedText) {
      try {
        const txt = await analyzeTextDescription(translatedText);
        if (txt.success) {
          aiResults.textAnalysis = txt.analysis;
          if (txt.analysis.additionalBadges) {
            aiResults.aiGeneratedBadges.push(...txt.analysis.additionalBadges);
          }
          if (txt.analysis.riskAssessment) {
            aiResults.overallCertainty = Math.max(
              aiResults.overallCertainty,
              txt.analysis.riskAssessment.certaintyPercentage || 0
            );
          }
        }
      } catch {}

      // AI Text Detection for crawled content
      try {
        console.log("Checking crawled content for AI generation...");
        const textFields = {};
        if (translatedTitle) textFields.title = translatedTitle;
        if (translatedText) textFields.description = translatedText;

        const aiTextResults = await analyzeTextForAI(textFields);
        const aiSummary = getAIDetectionSummary(aiTextResults);

        aiResults.aiDetection = aiSummary;
        aiResults.textAnalysis = {
          ...aiResults.textAnalysis,
          aiDetection: aiTextResults,
        };

        console.log(
          "AI text detection completed for crawled content:",
          aiSummary
        );
      } catch (error) {
        console.error("AI text detection failed for crawled content:", error);
        // non-blocking
      }
    }

    if (aiResults.textAnalysis?.riskAssessment?.threatLevel) {
      aiResults.aiThreatLevel = consolidateThreatLevel(
        aiResults.aiThreatLevel,
        aiResults.textAnalysis.riskAssessment.threatLevel
      );
    }
    aiResults.aiGeneratedBadges = [...new Set(aiResults.aiGeneratedBadges)];
  }

  return {
    externalId: hashString(article.url),
    title: translatedTitle,
    originalTitle: details.title || article.title,
    description: translatedText || details.description || translatedTitle,
    category: "News",
    threatLevel: aiResults.aiThreatLevel,
    location: "Bangladesh",
    city: "Dhaka", // Add city field for compatibility
    userEmail: "newsbot@system",
    source: article.source,
    sourceUrl: article.url,
    createdAt: new Date(),
    updatedAt: new Date(),
    attachments,
    attachmentCount: attachments.length,
    comments: [],
    reactions: [],
    authenticityLevel: 0,
    authenticityVotes: [],
    verified: false,
    anonymous: true,
    sentiment: {
      overall: "neutral",
      positiveCount: 0,
      negativeCount: 0,
      neutralCount: 0,
    },
    aiAnalysis: aiResults,
    importMeta: {
      fromCrawler: true,
      lang: article.lang,
      aiEnabled: enableAI,
    },
  };
}

async function collectFromSources(
  onlySourceName = null,
  debug = false,
  enableAI = true
) {
  const results = [];
  const debugReport = [];
  const sources = onlySourceName
    ? BD_NEWS_SOURCES.filter(
        (s) => s.name.toLowerCase() === onlySourceName.toLowerCase()
      )
    : BD_NEWS_SOURCES;

  for (const source of sources) {
    const entry = {
      source: source.name,
      url: source.url,
      extracted: 0,
      built: 0,
      sampleUrls: [],
      error: null,
    };
    try {
      const html = await fetchHtml(source.url);
      const articles = extractArticles(source, html).slice(
        0,
        CRAWL_CONFIG.maxArticlesPerSource
      );
      entry.extracted = articles.length;
      entry.sampleUrls = articles.slice(0, 5).map((a) => a.url);
      const limit = createLimiter(CRAWL_CONFIG.buildConcurrency);
      for (const a of articles) {
        if (crawlControl.stopRequested) break;
        if (results.length >= CRAWL_CONFIG.maxTotalPosts) break;
        const built = await limit(() => buildPostFromArticle(a, enableAI));
        results.push(built);
        entry.built += 1;
        crawlControl.builtCount += 1;
        // pace AI calls only if AI is enabled
        if (enableAI) {
          await new Promise((r) => setTimeout(r, CRAWL_CONFIG.aiDelayMs));
        }
      }
    } catch (e) {
      entry.error = (e && e.message) || String(e);
    } finally {
      if (debug) debugReport.push(entry);
    }
    if (crawlControl.stopRequested) break;
    if (results.length >= CRAWL_CONFIG.maxTotalPosts) break;
  }
  return debug ? { results, debugReport } : { results };
}

async function upsertArticlesIntoDb(reportsCollection, items) {
  if (!items || items.length === 0)
    return { inserted: 0, skipped: 0, insertedPosts: [] };
  let inserted = 0;
  let skipped = 0;
  const insertedPosts = [];
  for (const item of items) {
    try {
      const exists = await reportsCollection.findOne({
        externalId: item.externalId,
      });
      if (exists) {
        skipped += 1;
        continue;
      }
      const result = await reportsCollection.insertOne(item);
      inserted += 1;
      const insertedId = result?.insertedId?.toString();
      const frontendUrl = insertedId
        ? `http://localhost:5174/post/${insertedId}`
        : null;
      const record = {
        _id: insertedId,
        title: item.title,
        source: item.source,
        sourceUrl: item.sourceUrl,
        frontendUrl,
      };
      insertedPosts.push(record);
      if (insertedId) {
        console.log(`[CRAWLER] Inserted post: ${item.title} → ${frontendUrl}`);
      } else {
        console.log(`[CRAWLER] Inserted post: ${item.title}`);
      }
    } catch (e) {
      skipped += 1;
      console.log(
        `[CRAWLER] Failed to insert post: ${item?.title || "(no title)"} – ${
          e?.message || e
        }`
      );
    }
  }
  return { inserted, skipped, insertedPosts };
}

async function crawlAndStore(reportsCollection, opts = {}) {
  const { source = null, debug = false, limit, ai = true } = opts;
  // adapt limits dynamically if provided
  if (limit) {
    const n = Number(limit);
    if (!Number.isNaN(n) && n > 0) {
      CRAWL_CONFIG.maxArticlesPerSource = Math.max(1, Math.min(n, 10));
      CRAWL_CONFIG.maxTotalPosts = Math.max(1, Math.min(n, 20));
    }
  }
  resetCrawlStatus({ source });
  const collected = await collectFromSources(source, debug, ai);
  const items = debug ? collected.results : collected.results;
  const upsert = await upsertArticlesIntoDb(reportsCollection, items);
  crawlControl.insertedCount += upsert.inserted;
  crawlControl.skippedCount += upsert.skipped;
  crawlControl.isRunning = false;
  return debug ? { ...upsert, debugReport: collected.debugReport } : upsert;
}

module.exports = {
  crawlAndStore,
  collectFromSources,
  collectPreviewFromSources,
  requestStopCrawl,
  getCrawlStatus,
};
