const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const cloudinary = require("../config/cloudinaryConfig"); // 👈 Import Cloudinary config
const upload = require("../config/multerConfig");
const {
  analyzeMediaBatch, // 👈 New, correct name
  analyzeTextDescription,
} = require("../services/geminiService");
const { detectDeepfakeFromUrl } = require("../services/deepfakeService");

// Create new report
router.post("/", upload.array("attachments", 5), async (req, res) => {
  try {
    const reportData = req.body;
    const files = req.files;
    const reportsCollection = req.reportsCollection;

    // --- 1. Validation ---
    if (
      !reportData.title ||
      !reportData.description ||
      !reportData.location ||
      !reportData.category ||
      !reportData.threatLevel
    ) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    // --- 2. Cloudinary Upload Logic ---
    const attachmentUrls = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "incident_reports" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });

        attachmentUrls.push({
          url: result.secure_url,
          public_id: result.public_id,
          file_type: result.resource_type,
        });
      }
    }

    // --- 3. AI Analysis Logic ---
    const aiAnalysisResults = {
      mediaAnalysis: null,
      textAnalysis: null,
      overallCertainty: 0,
      aiGeneratedBadges: [],
      aiThreatLevel: "Low",
      deepfake: { anyFlagged: false, items: [] },
    };

    // Analyze uploaded media files in a single batch
    if (attachmentUrls.length > 0) {
      console.log("Starting AI batch analysis of uploaded media...");
      const mediaToAnalyze = attachmentUrls.map((att) => ({
        url: att.url,
        fileType: att.file_type === "video" ? "video" : "image",
      }));

      const batchAnalysisResult = await analyzeMediaBatch(mediaToAnalyze);

      if (batchAnalysisResult.success) {
        const analysis = batchAnalysisResult.analysis;
        aiAnalysisResults.mediaAnalysis = analysis;
        aiAnalysisResults.aiGeneratedBadges = analysis.crimeBadges || [];
        aiAnalysisResults.overallCertainty = analysis.certaintyPercentage || 0;
        aiAnalysisResults.aiThreatLevel = analysis.threatLevel || "Low";
      } else {
        console.error("AI batch analysis failed:", batchAnalysisResult.error);
        aiAnalysisResults.mediaAnalysis = { error: "AI analysis failed." };
      }

      // Deepfake detection per image
      for (const att of attachmentUrls) {
        if (att.file_type === "image") {
          try {
            const df = await detectDeepfakeFromUrl(att.url);
            if (df.success) {
              aiAnalysisResults.deepfake.items.push({
                url: att.url,
                label: df.label,
                score: df.score,
              });
              if (df.label?.toLowerCase() === "deepfake" && df.score >= 0.75) {
                aiAnalysisResults.deepfake.anyFlagged = true;
              }
            }
          } catch (e) {
            // non-blocking
          }
        }
      }
    }

    // Analyze text description
    if (reportData.description) {
      try {
        const textAnalysisResult = await analyzeTextDescription(
          reportData.description
        );
        if (textAnalysisResult.success) {
          aiAnalysisResults.textAnalysis = textAnalysisResult.analysis;

          if (textAnalysisResult.analysis.additionalBadges) {
            aiAnalysisResults.aiGeneratedBadges.push(
              ...textAnalysisResult.analysis.additionalBadges
            );
          }

          if (textAnalysisResult.analysis.riskAssessment) {
            aiAnalysisResults.overallCertainty = Math.max(
              aiAnalysisResults.overallCertainty,
              textAnalysisResult.analysis.riskAssessment.certaintyPercentage ||
                0
            );
          }
        }
      } catch (error) {
        console.error("Text analysis failed:", error);
      }
    }

    // --- 4. Consolidate Final AI Results ---

    // ✅ SUGGESTION: Consolidate threat level from both media and text analysis
    if (aiAnalysisResults.textAnalysis?.riskAssessment?.threatLevel) {
      const threatLevels = ["Low", "Medium", "High", "Critical"];
      const mediaThreatIndex = threatLevels.indexOf(
        aiAnalysisResults.aiThreatLevel
      );
      const textThreatIndex = threatLevels.indexOf(
        aiAnalysisResults.textAnalysis.riskAssessment.threatLevel
      );

      // If text analysis suggests a higher threat, use that one.
      if (textThreatIndex > mediaThreatIndex) {
        aiAnalysisResults.aiThreatLevel =
          aiAnalysisResults.textAnalysis.riskAssessment.threatLevel;
      }
    }

    // Remove duplicate badges for a clean final list
    aiAnalysisResults.aiGeneratedBadges = [
      ...new Set(aiAnalysisResults.aiGeneratedBadges),
    ];

    // --- 5. Prepare and Save Final Report to Database ---
    const isAnonymous = reportData.userEmail === "anonymous";

    const enhancedReportData = {
      ...reportData,
      attachments: attachmentUrls,
      attachmentCount: attachmentUrls.length,
      // Normalize location: accept either string or object {label, latitude, longitude}
      location: (() => {
        try {
          // Try to parse as JSON first (for location objects sent as JSON strings)
          if (typeof reportData.location === "string") {
            try {
              const parsedLocation = JSON.parse(reportData.location);
              if (typeof parsedLocation === "object" && parsedLocation.label) {
                return parsedLocation.label;
              }
            } catch (parseError) {
              // If JSON parsing fails, treat as regular string
              return reportData.location;
            }
            return reportData.location;
          }
          if (typeof reportData.location === "object") {
            return reportData.location.label || "";
          }
          return "";
        } catch (error) {
          console.error("Error processing location:", error);
          return reportData.location;
        }
      })(),
      coordinates: (() => {
        try {
          let locationObj = reportData.location;

          // Try to parse as JSON first
          if (typeof reportData.location === "string") {
            try {
              const parsedLocation = JSON.parse(reportData.location);
              if (typeof parsedLocation === "object") {
                locationObj = parsedLocation;
              }
            } catch (parseError) {
              // If JSON parsing fails, return null
              return null;
            }
          }

          if (
            typeof locationObj === "object" &&
            locationObj.latitude &&
            locationObj.longitude
          ) {
            const coords = {
              lat: Number(locationObj.latitude),
              lng: Number(locationObj.longitude),
            };
            return coords;
          }
          return null;
        } catch (error) {
          console.error("Error processing coordinates:", error);
          return null;
        }
      })(),
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
      reactions: [],
      authenticityLevel: 0,
      authenticityVotes: [],
      verified: false,
      anonymous: isAnonymous,
      sentiment: {
        overall: "neutral",
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
      },
      aiAnalysis: aiAnalysisResults, // Store the fully consolidated AI results
    };

    const result = await reportsCollection.insertOne(enhancedReportData);

    res.status(201).json({
      message: "Report submitted successfully!",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Failed to save report:", error);
    res.status(500).json({
      message: "Error saving report to the database",
    });
  }
});

// Get all reports
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      category,
      threatLevel,
      q,
      sort = "new",
    } = req.query;
    const reportsCollection = req.reportsCollection;

    let filter = {};
    let cityFilter = null;

    if (city) {
      // Check both city field and location field for city filtering
      // Also include posts that don't have specific city but are from the country
      cityFilter = {
        $or: [
          { city: city },
          { location: { $regex: city, $options: "i" } },
          // Include news posts from Bangladesh when filtering for Dhaka
          {
            $and: [{ userEmail: "newsbot@system" }, { location: "Bangladesh" }],
          },
        ],
      };
    }

    if (category) {
      try {
        filter.category = new RegExp(`^${category}$`, "i");
      } catch {
        filter.category = category;
      }
    }
    if (threatLevel) filter.threatLevel = threatLevel;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }

    // Combine city filter with other filters
    // Always include news posts regardless of city
    if (cityFilter) {
      if (Object.keys(filter).length > 0) {
        filter = {
          $or: [
            { $and: [cityFilter, filter] },
            { userEmail: "newsbot@system" }, // Always include news posts
          ],
        };
      } else {
        filter = {
          $or: [
            cityFilter,
            { userEmail: "newsbot@system" }, // Always include news posts
          ],
        };
      }
    } else if (Object.keys(filter).length > 0) {
      // If no city filter but other filters exist, still include news posts
      filter = {
        $or: [
          filter,
          { userEmail: "newsbot@system" }, // Always include news posts
        ],
      };
    } else {
      // No filters at all, include everything
      filter = {};
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Define sorting options
    let sortOption = { createdAt: -1 }; // default: newest first
    switch (sort) {
      case "hot":
        // Sort by engagement (reactions + comments) - we'll handle this in the application
        sortOption = { createdAt: -1 };
        break;
      case "top":
        // Sort by total engagement (reactions + comments) - we'll handle this in the application
        sortOption = { createdAt: -1 };
        break;
      case "rising":
        // Sort by recent engagement (posts with recent activity)
        sortOption = { createdAt: -1 };
        break;
      case "new":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    console.log("Posts API Filter:", JSON.stringify(filter, null, 2));

    const reports = await reportsCollection
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await reportsCollection.countDocuments(filter);

    console.log("Posts API Results:", {
      total,
      returned: reports.length,
      sampleReport: reports[0]
        ? {
            title: reports[0].title,
            category: reports[0].category,
            location: reports[0].location,
            city: reports[0].city,
            userEmail: reports[0].userEmail,
          }
        : null,
    });

    // Aggregate heatmap data: prefer coordinates; fallback to location string counts
    const heatmap = await reportsCollection
      .aggregate([
        {
          $project: {
            location: 1,
            coordinates: 1,
            locKey: {
              $cond: [
                {
                  $and: [
                    { $ifNull: ["$coordinates", false] },
                    { $ifNull: ["$coordinates.lat", false] },
                    { $ifNull: ["$coordinates.lng", false] },
                  ],
                },
                { lat: "$coordinates.lat", lng: "$coordinates.lng" },
                "$location",
              ],
            },
          },
        },
        { $group: { _id: "$locKey", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1000 },
      ])
      .toArray();

    // Leaderboard: top reporters by userEmail
    const leaderboard = await reportsCollection
      .aggregate([
        { $group: { _id: "$userEmail", posts: { $sum: 1 } } },
        { $sort: { posts: -1 } },
        { $limit: 10 },
      ])
      .toArray();

    // Suggestions for search autocomplete
    let suggestions = [];
    if (q) {
      const catsAgg = await reportsCollection
        .aggregate([
          { $match: { category: { $regex: q, $options: "i" } } },
          { $group: { _id: "$category" } },
          { $limit: 5 },
        ])
        .toArray();
      const cats = catsAgg.map((x) => x._id).filter(Boolean);
      const locs = await reportsCollection
        .aggregate([
          { $match: { location: { $regex: q, $options: "i" } } },
          { $group: { _id: "$location", c: { $sum: 1 } } },
          { $sort: { c: -1 } },
          { $limit: 5 },
        ])
        .toArray();
      suggestions = [
        ...cats.map((c) => ({ type: "category", value: c })),
        ...locs.map((l) => ({ type: "location", value: l._id })),
      ];
    }

    res.json({
      reports,
      heatmap,
      leaderboard,
      suggestions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalReports: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    res.status(500).json({
      message: "Error fetching reports from the database",
    });
  }
});

// Get single report by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const reportsCollection = req.reportsCollection;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid report ID",
      });
    }

    const report = await reportsCollection.findOne({ _id: new ObjectId(id) });

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    res.json(report);
  } catch (error) {
    console.error("Failed to fetch report:", error);
    res.status(500).json({
      message: "Error fetching report from the database",
    });
  }
});

// Update report status (for admin)
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const reportsCollection = req.reportsCollection;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid report ID",
      });
    }

    const allowedStatuses = ["pending", "reviewed", "resolved", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const result = await reportsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    res.json({
      message: "Report status updated successfully",
    });
  } catch (error) {
    console.error("Failed to update report status:", error);
    res.status(500).json({
      message: "Error updating report status",
    });
  }
});

// Test endpoint to check news posts
router.get("/test/news", async (req, res) => {
  try {
    const reportsCollection = req.reportsCollection;

    // Check for news posts specifically
    const newsPosts = await reportsCollection
      .find({
        $or: [{ category: "News" }, { userEmail: "newsbot@system" }],
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Also check total posts
    const totalPosts = await reportsCollection.countDocuments({});
    const totalNewsPosts = await reportsCollection.countDocuments({
      $or: [{ category: "News" }, { userEmail: "newsbot@system" }],
    });

    res.json({
      totalPosts,
      totalNewsPosts,
      newsPosts: newsPosts.map((post) => ({
        id: post._id,
        title: post.title,
        category: post.category,
        location: post.location,
        city: post.city,
        userEmail: post.userEmail,
        createdAt: post.createdAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch news posts:", error);
    res.status(500).json({
      message: "Error fetching news posts",
      error: error.message,
    });
  }
});

// Test endpoint to check filtering
router.get("/test/filter", async (req, res) => {
  try {
    const reportsCollection = req.reportsCollection;

    // Test different filter scenarios
    const scenarios = {
      noFilter: await reportsCollection.countDocuments({}),
      cityDhaka: await reportsCollection.countDocuments({ city: "Dhaka" }),
      locationBangladesh: await reportsCollection.countDocuments({
        location: "Bangladesh",
      }),
      categoryNews: await reportsCollection.countDocuments({
        category: "News",
      }),
      newsbotUser: await reportsCollection.countDocuments({
        userEmail: "newsbot@system",
      }),
      cityOrLocation: await reportsCollection.countDocuments({
        $or: [
          { city: "Dhaka" },
          { location: { $regex: "Dhaka", $options: "i" } },
        ],
      }),
    };

    res.json({
      scenarios,
      samplePosts: await reportsCollection.find({}).limit(3).toArray(),
    });
  } catch (error) {
    console.error("Failed to test filters:", error);
    res.status(500).json({
      message: "Error testing filters",
      error: error.message,
    });
  }
});

// Get posts by user email
router.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const reportsCollection = req.reportsCollection;

    const posts = await reportsCollection
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      posts,
      total: posts.length,
    });
  } catch (error) {
    console.error("Failed to fetch user posts:", error);
    res.status(500).json({
      message: "Error fetching user posts from the database",
    });
  }
});

// Delete post by ID (only by the author)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body; // Email of the user trying to delete
    const reportsCollection = req.reportsCollection;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    // Find the post first to check ownership
    const post = await reportsCollection.findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check if the user is the author of the post
    if (post.userEmail !== userEmail) {
      return res.status(403).json({
        message: "You can only delete your own posts",
      });
    }

    // Delete the post
    const result = await reportsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete post:", error);
    res.status(500).json({
      message: "Error deleting post from the database",
    });
  }
});

module.exports = router;
