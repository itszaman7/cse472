const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const axios = require("axios");
const { analyzeAndUpdateSentiment } = require("../services/sentimentService");
const { detectAIGeneratedText } = require("../services/aiDetectionService");
const { detectDeepfakeFromUrl } = require("../services/deepfakeService");
// Add comment to report
router.post("/:id/comments", async (req, res) => {
  try {
    console.log("Backend received this request body:", req.body);
    const { id } = req.params;
    const { userName, comment } = req.body;
    const reportsCollection = req.reportsCollection;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid report ID",
      });
    }

    if (!userName || !comment) {
      return res.status(400).json({
        message: "Username and comment are required",
      });
    }

    // AI Detection for comment
    let aiDetection = { success: false, isAIGenerated: false, confidence: 0 };
    try {
      console.log("Checking comment for AI generation...");
      aiDetection = await detectAIGeneratedText(comment.trim());
      console.log("AI detection result:", aiDetection);
    } catch (error) {
      console.error("AI detection failed for comment:", error);
      // non-blocking
    }

    // Deepfake detection for comment (if there are any image URLs in the comment)
    let deepfakeDetection = { success: false, anyFlagged: false, items: [] };
    try {
      // Extract URLs from comment text
      const urlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp))/gi;
      const imageUrls = comment.match(urlRegex);

      if (imageUrls && imageUrls.length > 0) {
        console.log("Checking comment images for deepfake...");
        const deepfakeResults = [];

        for (const imageUrl of imageUrls) {
          try {
            const result = await detectDeepfakeFromUrl(imageUrl);
            if (
              result.success &&
              result.isDeepfake &&
              result.confidence >= 0.7
            ) {
              deepfakeResults.push({
                url: imageUrl,
                isDeepfake: true,
                confidence: result.confidence,
                label: result.label,
              });
            }
          } catch (error) {
            console.error(
              "Deepfake detection failed for image:",
              imageUrl,
              error
            );
          }
        }

        deepfakeDetection = {
          success: true,
          anyFlagged: deepfakeResults.length > 0,
          items: deepfakeResults,
        };
        console.log("Deepfake detection result:", deepfakeDetection);
      }
    } catch (error) {
      console.error("Deepfake detection failed for comment:", error);
      // non-blocking
    }

    const newComment = {
      id: new ObjectId(),
      userName: userName.trim(),
      comment: comment.trim(),
      createdAt: new Date(),
      aiDetection: aiDetection,
      deepfakeDetection: deepfakeDetection,
    };

    const result = await reportsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { comments: newComment },
        $set: { updatedAt: new Date() },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    analyzeAndUpdateSentiment(reportsCollection, id, comment);

    // Real-time notify post owner
    try {
      const io = req.app.get("io");
      const postOwner = existingReport?.userEmail; // will compute below if needed
    } catch (_) {}

    // Emit socket event to post owner
    try {
      const io = req.app.get("io");
      const post = await reportsCollection.findOne({ _id: new ObjectId(id) });
      if (post?.userEmail) {
        io.to(`user:${post.userEmail}`).emit("notification", {
          type: "comment",
          reportId: id,
          by: userName,
          at: new Date().toISOString(),
          message: "New comment on your report",
        });
      }
    } catch (_) {}

    res.json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Failed to add comment:", error);
    res.status(500).json({
      message: "Error adding comment",
    });
  }
});

// Delete comment (only by the comment author)
router.delete("/:id/comments/:commentId", async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { userName } = req.body;
    const reportsCollection = req.reportsCollection;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(commentId)) {
      return res.status(400).json({
        message: "Invalid report ID or comment ID",
      });
    }

    if (!userName) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    const result = await reportsCollection.updateOne(
      {
        _id: new ObjectId(id),
        "comments.id": new ObjectId(commentId),
        "comments.userName": userName.trim(),
      },
      {
        $pull: { comments: { id: new ObjectId(commentId) } },
        $set: { updatedAt: new Date() },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message:
          "Report not found, comment not found, or you don't have permission to delete this comment",
      });
    }

    res.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete comment:", error);
    res.status(500).json({
      message: "Error deleting comment",
    });
  }
});

module.exports = router;
