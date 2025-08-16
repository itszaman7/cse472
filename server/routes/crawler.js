const express = require("express");
const router = express.Router();
const { crawlAndStore, collectPreviewFromSources, getCrawlStatus, requestStopCrawl } = require("../services/newsCrawler");

// In-memory storage for crawl history (in production, use database)
let crawlHistory = [];

// Get crawler status
router.get("/status", (req, res) => {
  try {
    const status = getCrawlStatus();
    res.json(status);
  } catch (error) {
    console.error("Error getting crawler status:", error);
    res.status(500).json({ error: "Failed to get crawler status" });
  }
});

// Get crawl history
router.get("/history", (req, res) => {
  try {
    res.json({ history: crawlHistory });
  } catch (error) {
    console.error("Error getting crawl history:", error);
    res.status(500).json({ error: "Failed to get crawl history" });
  }
});

// Start crawl
router.post("/start", async (req, res) => {
  try {
    const { source, limit, ai } = req.body;
    const reportsCollection = req.reportsCollection;

    // Check if already running
    const currentStatus = getCrawlStatus();
    if (currentStatus.isRunning) {
      return res.status(400).json({ 
        success: false, 
        error: "Crawler is already running" 
      });
    }

    // Start crawl in background
    crawlAndStore(reportsCollection, { 
      source, 
      limit, 
      ai: ai !== false, // default to true if not specified
      debug: false 
    }).then((result) => {
      // Add to history when completed
      const historyEntry = {
        id: Date.now().toString(),
        source: source || 'All Sources',
        startedAt: currentStatus.startedAt,
        completedAt: new Date().toISOString(),
        status: 'completed',
        insertedCount: result.inserted || 0,
        skippedCount: result.skipped || 0,
        duration: formatDuration(currentStatus.startedAt, new Date().toISOString())
      };
      crawlHistory.unshift(historyEntry);
      
      // Keep only last 50 entries
      if (crawlHistory.length > 50) {
        crawlHistory = crawlHistory.slice(0, 50);
      }
      
      console.log(`[CRAWLER] Completed crawl: ${result.inserted} posts created`);
    }).catch((error) => {
      console.error("[CRAWLER] Crawl failed:", error);
      
      // Add failed entry to history
      const historyEntry = {
        id: Date.now().toString(),
        source: source || 'All Sources',
        startedAt: currentStatus.startedAt,
        completedAt: new Date().toISOString(),
        status: 'failed',
        insertedCount: 0,
        skippedCount: 0,
        error: error.message,
        duration: formatDuration(currentStatus.startedAt, new Date().toISOString())
      };
      crawlHistory.unshift(historyEntry);
    });

    res.json({ 
      success: true, 
      message: "Crawl started successfully",
      source: source || 'All Sources',
      limit: limit || 3,
      ai: ai !== false
    });
  } catch (error) {
    console.error("Error starting crawl:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to start crawl" 
    });
  }
});

// Stop crawl
router.post("/stop", (req, res) => {
  try {
    requestStopCrawl();
    res.json({ 
      success: true, 
      message: "Stop request sent to crawler" 
    });
  } catch (error) {
    console.error("Error stopping crawl:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to stop crawl" 
    });
  }
});

// Preview crawl (without storing to database)
router.post("/preview", async (req, res) => {
  try {
    const { source, limit } = req.body;
    
    const result = await collectPreviewFromSources(
      source === 'all' ? null : source, 
      limit || 3
    );
    
    res.json(result);
  } catch (error) {
    console.error("Error previewing crawl:", error);
    res.status(500).json({ 
      error: "Failed to preview crawl",
      details: error.message 
    });
  }
});

// Helper function to format duration
function formatDuration(startTime, endTime) {
  if (!startTime || !endTime) return 'N/A';
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diff = end - start;
  
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

module.exports = router;
