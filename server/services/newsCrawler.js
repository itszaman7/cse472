const axios = require("axios");
const cheerio = require("cheerio");
const translate = require("@vitalets/google-translate-api");
const crypto = require("crypto");

const BD_NEWS_SOURCES = [
  { name: "Prothom Alo", url: "https://www.prothomalo.com/crime", lang: "bn" },
  { name: "BDNews24 Bangla", url: "https://bangla.bdnews24.com/crime/", lang: "bn" },
  { name: "Kaler Kantho", url: "https://www.kalerkantho.com/online/country-news/crime", lang: "bn" },
  { name: "Jugantor", url: "https://www.jugantor.com/crime-news", lang: "bn" },
  { name: "Samakal", url: "https://samakal.com/list/crime", lang: "bn" },
  { name: "Ittefaq", url: "https://www.ittefaq.com.bd/crime", lang: "bn" },
  { name: "The Daily Star", url: "https://www.thedailystar.net/crime", lang: "en" },
  { name: "Dhaka Tribune", url: "https://www.dhakatribune.com/articles/crime", lang: "en" },
  { name: "The Business Standard", url: "https://www.tbsnews.net/crime", lang: "en" },
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

async function fetchHtml(url) {
  const res = await axios.get(url, { timeout: 20000, headers: { "User-Agent": "cse372-crawler/1.0" } });
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

    const absoluteUrl = href.startsWith("http") ? href : new URL(href, source.url).toString();
    // Heuristic: only keep likely news article links
    if (!/crime|news|article|story|report/i.test(absoluteUrl)) return;

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

async function normalizeArticle(article) {
  const translatedTitle = await safeTranslateIfBangla(article.title, article.lang);
  return {
    externalId: hashString(article.url),
    title: translatedTitle,
    originalTitle: article.title,
    description: `${translatedTitle} (Imported from ${article.source})`,
    category: "News",
    threatLevel: "Low",
    location: "Bangladesh",
    userEmail: "newsbot@system",
    source: article.source,
    sourceUrl: article.url,
    createdAt: new Date(),
    updatedAt: new Date(),
    attachments: [],
    attachmentCount: 0,
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
    aiAnalysis: null,
    importMeta: {
      fromCrawler: true,
      lang: article.lang,
    },
  };
}

async function collectFromSources() {
  const results = [];
  for (const source of BD_NEWS_SOURCES) {
    try {
      const html = await fetchHtml(source.url);
      const articles = extractArticles(source, html);
      for (const a of articles) {
        results.push(await normalizeArticle(a));
      }
    } catch (e) {
      // skip source on error
    }
  }
  return results;
}

async function upsertArticlesIntoDb(reportsCollection, items) {
  if (!items || items.length === 0) return { inserted: 0, skipped: 0 };
  let inserted = 0;
  let skipped = 0;
  for (const item of items) {
    try {
      const exists = await reportsCollection.findOne({ externalId: item.externalId });
      if (exists) {
        skipped += 1;
        continue;
      }
      await reportsCollection.insertOne(item);
      inserted += 1;
    } catch {
      skipped += 1;
    }
  }
  return { inserted, skipped };
}

async function crawlAndStore(reportsCollection) {
  const collected = await collectFromSources();
  return await upsertArticlesIntoDb(reportsCollection, collected);
}

module.exports = {
  crawlAndStore,
};


