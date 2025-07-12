const axios = require("axios");
const { ObjectId } = require("mongodb");

/**
 * Analyzes a comment and updates the parent report's sentiment score.
 * @param {Db.Collection} reportsCollection - The MongoDB collection for reports.
 * @param {string} reportId - The ID of the report to update.
 * @param {string} commentText - The text of the new comment to analyze.
 */
async function analyzeAndUpdateSentiment(reportsCollection, reportId, commentText) {
    try {
        console.log(`--- Sentiment Service Received ---
    Report ID: ${reportId}
    Comment Text: ${commentText}
    --------------------------------`);
        // A. Call Hugging Face Inference API
        const HUGGING_FACE_URL = "https://api-inference.huggingface.co/models/finiteautomata/bertweet-base-sentiment-analysis";
        const response = await axios.post(
            HUGGING_FACE_URL,
            { inputs: commentText },
            { headers: { Authorization: `Bearer ${process.env.HF_API_TOKEN}` } }
        );
        
        const sentiments = response.data[0];
        let highestScore = 0;
        let sentimentLabel = 'NEU';

        sentiments.forEach(s => {
            if (s.score > highestScore) {
                highestScore = s.score;
                sentimentLabel = s.label; // Will be 'POS', 'NEG', or 'NEU'
            }
        });

        // B. Determine which counter to increment
        const updateField = sentimentLabel === 'POS' ? 'sentiment.positiveCount' :
                              sentimentLabel === 'NEG' ? 'sentiment.negativeCount' :
                              'sentiment.neutralCount';

        // C. Increment the correct counter
        await reportsCollection.updateOne(
            { _id: new ObjectId(reportId) },
            { $inc: { [updateField]: 1 } }
        );

        // D. Recalculate and update the overall sentiment label
        const updatedReport = await reportsCollection.findOne({ _id: new ObjectId(reportId) });
        if (!updatedReport) return;

        const { positiveCount, negativeCount } = updatedReport.sentiment;
        let overallSentiment = 'neutral';
        const totalVotes = positiveCount + negativeCount;

        if (totalVotes > 0) {
            if (positiveCount > negativeCount) {
                overallSentiment = 'positive';
            } else if (negativeCount > positiveCount) {
                overallSentiment = 'negative';
            } else {
                overallSentiment = 'mixed';
            }
        }
        
        await reportsCollection.updateOne(
            { _id: new ObjectId(reportId) },
            { $set: { "sentiment.overall": overallSentiment } }
        );

    } catch (error) {
        // Log the error without crashing the main request flow
        console.error(`Sentiment analysis background task failed for report ${reportId}:`, error.response ? error.response.data : error.message);
    }
}

module.exports = { analyzeAndUpdateSentiment };