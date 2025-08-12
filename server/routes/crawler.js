const express = require("express");
const router = express.Router();
const { crawlAndStore } = require("../services/newsCrawler");

router.post("/crawler/run", async (req, res) => {
  try {
    const reportsCollection = req.reportsCollection;
    if (!reportsCollection) {
      return res.status(500).json({ message: "DB not initialized" });
    }
    const result = await crawlAndStore(reportsCollection);
    res.status(200).json({ message: "Crawl completed", ...result });
  } catch (e) {
    res.status(500).json({ message: "Crawl failed", error: e.message });
  }
});

module.exports = router;


