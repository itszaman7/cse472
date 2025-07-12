const express = require('express');
const router = express.Router();
const { ObjectId } = require("mongodb");
const axios = require("axios");
const { analyzeAndUpdateSentiment } = require('../services/sentimentService');
// Add comment to report
router.post('/:id/comments', async (req, res) => {
    try {
          console.log('Backend received this request body:', req.body); 
        const { id } = req.params;
        const { userName, comment } = req.body;
        const reportsCollection = req.reportsCollection;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid report ID"
            });
        }

        if (!userName || !comment) {
            return res.status(400).json({
                message: "Username and comment are required"
            });
        }

        const newComment = {
            id: new ObjectId(),
            userName: userName.trim(),
            comment: comment.trim(),
            createdAt: new Date()
        };

        

        const result = await reportsCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $push: { comments: newComment },
                $set: { updatedAt: new Date() }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Report not found"
            });
        }

        analyzeAndUpdateSentiment(reportsCollection, id, comment);

        res.json({
            message: "Comment added successfully",
            comment: newComment
        });

    } catch (error) {
        console.error("Failed to add comment:", error);
        res.status(500).json({
            message: "Error adding comment"
        });
    }
});

// --- NEW HELPER FUNCTION TO RUN ANALYSIS IN THE BACKGROUND ---
// async function analyzeAndUpdateSentiment(reportId, commentText) {
//     try {
//         // A. Call Hugging Face Inference API
//         const HUGGING_FACE_URL = "https://api-inference.huggingface.co/models/finiteautomata/bertweet-base-sentiment-analysis";
//         const response = await axios.post(
//             HUGGING_FACE_URL,
//             { inputs: commentText },
//             { headers: { Authorization: `Bearer ${process.env.HF_API_TOKEN}` } }
//         );
        
//         // The API returns an array of label predictions; we take the one with the highest score.
//         const sentiments = response.data[0];
//         let highestScore = 0;
//         let sentimentLabel = 'NEU'; // Default to Neutral

//         sentiments.forEach(s => {
//             if (s.score > highestScore) {
//                 highestScore = s.score;
//                 sentimentLabel = s.label; // Will be 'POS', 'NEG', or 'NEU'
//             }
//         });

//         // B. Determine which counter to increment
//         const updateField = sentimentLabel === 'POS' ? 'sentiment.positiveCount' :
//                               sentimentLabel === 'NEG' ? 'sentiment.negativeCount' :
//                               'sentiment.neutralCount';

//         const updateResult = await reportsCollection.updateOne(
//             { _id: new ObjectId(reportId) },
//             { $inc: { [updateField]: 1 } }
//         );

//         // C. Update the overall sentiment label based on the new counts
//         const updatedReport = await reportsCollection.findOne({ _id: new ObjectId(reportId) });
//         const { positiveCount, negativeCount, neutralCount } = updatedReport.sentiment;

//         let overallSentiment = 'neutral';
//         const totalVotes = positiveCount + negativeCount;

//         if (totalVotes > 0) {
//             if (positiveCount > negativeCount) {
//                 overallSentiment = 'positive';
//             } else if (negativeCount > positiveCount) {
//                 overallSentiment = 'negative';
//             } else {
//                 overallSentiment = 'mixed';
//             }
//         }
        
//         // D. Save the new overall sentiment to the database
//         await reportsCollection.updateOne(
//             { _id: new ObjectId(reportId) },
//             { $set: { "sentiment.overall": overallSentiment } }
//         );

//     } catch (error) {
//         console.error(`Sentiment analysis failed for report ${reportId}:`, error.response ? error.response.data : error.message);
//     }
// }


// Delete comment (only by the comment author)
router.delete('/:id/comments/:commentId', async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const { userName } = req.body;
        const reportsCollection = req.reportsCollection;

        if (!ObjectId.isValid(id) || !ObjectId.isValid(commentId)) {
            return res.status(400).json({
                message: "Invalid report ID or comment ID"
            });
        }

        if (!userName) {
            return res.status(400).json({
                message: "Username is required"
            });
        }

        const result = await reportsCollection.updateOne(
            {
                _id: new ObjectId(id),
                "comments.id": new ObjectId(commentId),
                "comments.userName": userName.trim()
            },
            {
                $pull: { comments: { id: new ObjectId(commentId) } },
                $set: { updatedAt: new Date() }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Report not found, comment not found, or you don't have permission to delete this comment"
            });
        }

        res.json({
            message: "Comment deleted successfully"
        });

    } catch (error) {
        console.error("Failed to delete comment:", error);
        res.status(500).json({
            message: "Error deleting comment"
        });
    }
});

module.exports = router;