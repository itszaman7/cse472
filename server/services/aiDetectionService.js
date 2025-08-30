const axios = require("axios");
const FormData = require("form-data");

/**
 * Uses Grammarly AI Detection API to detect AI-generated content in text.
 * API: https://developer.grammarly.com/ai-detection-api.html
 *
 * The API requires:
 * 1. Create a score request with filename
 * 2. Upload document to pre-signed URL
 * 3. Check evaluation results
 */
async function detectAIGeneratedText(text) {
  try {
    // Step 1: Create a score request
    const scoreRequestResponse = await axios.post(
      "https://api.grammarly.com/ecosystem/api/v1/ai-detection",
      {
        filename: "text_analysis.txt",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GRAMMARLY_ACCESS_TOKEN}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "CrimeShield/1.0",
        },
        timeout: 30000,
      }
    );

    if (
      !scoreRequestResponse.data ||
      !scoreRequestResponse.data.score_request_id ||
      !scoreRequestResponse.data.file_upload_url
    ) {
      throw new Error(
        "Invalid response from Grammarly API - missing score_request_id or file_upload_url"
      );
    }

    const { score_request_id, file_upload_url } = scoreRequestResponse.data;

    // Step 2: Upload the text document
    const formData = new FormData();
    formData.append("file", Buffer.from(text), {
      filename: "text_analysis.txt",
      contentType: "text/plain",
    });

    await axios.put(file_upload_url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000,
    });

    // Step 3: Wait a moment for processing and check results
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 4: Get the evaluation results
    const resultResponse = await axios.get(
      `https://api.grammarly.com/ecosystem/api/v1/ai-detection/${score_request_id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GRAMMARLY_ACCESS_TOKEN}`,
          Accept: "application/json",
          "User-Agent": "CrimeShield/1.0",
        },
        timeout: 30000,
      }
    );

    if (
      resultResponse.data &&
      resultResponse.data.status === "COMPLETED" &&
      resultResponse.data.score
    ) {
      const score = resultResponse.data.score;
      const averageConfidence = score.average_confidence || 0;
      const aiGeneratedPercentage = score.ai_generated_percentage || 0;

      return {
        success: true,
        isAIGenerated: aiGeneratedPercentage > 0.5, // Consider AI-generated if more than 50% is flagged
        confidence: averageConfidence,
        details: {
          aiGeneratedPercentage: aiGeneratedPercentage,
          averageConfidence: averageConfidence,
          scoreRequestId: score_request_id,
          status: resultResponse.data.status,
        },
      };
    } else if (
      resultResponse.data &&
      resultResponse.data.status === "PENDING"
    ) {
      // If still pending, wait a bit more and try again
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const retryResponse = await axios.get(
        `https://api.grammarly.com/ecosystem/api/v1/ai-detection/${score_request_id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GRAMMARLY_ACCESS_TOKEN}`,
            Accept: "application/json",
            "User-Agent": "CrimeShield/1.0",
          },
          timeout: 30000,
        }
      );

      if (
        retryResponse.data &&
        retryResponse.data.status === "COMPLETED" &&
        retryResponse.data.score
      ) {
        const score = retryResponse.data.score;
        const averageConfidence = score.average_confidence || 0;
        const aiGeneratedPercentage = score.ai_generated_percentage || 0;

        return {
          success: true,
          isAIGenerated: aiGeneratedPercentage > 0.5,
          confidence: averageConfidence,
          details: {
            aiGeneratedPercentage: aiGeneratedPercentage,
            averageConfidence: averageConfidence,
            scoreRequestId: score_request_id,
            status: retryResponse.data.status,
          },
        };
      }
    }

    // If we get here, something went wrong
    return {
      success: false,
      error: "Failed to get AI detection results",
      details: {
        status: resultResponse.data?.status || "unknown",
        scoreRequestId: score_request_id,
      },
    };
  } catch (error) {
    console.error("Grammarly AI detection error:", error.message);

    // Check if it's an authentication error
    if (error.response?.status === 401) {
      return {
        success: false,
        error:
          "Grammarly API authentication failed. Please check your access token.",
        details: { statusCode: 401 },
      };
    }

    // Check if it's a rate limit error
    if (error.response?.status === 429) {
      return {
        success: false,
        error: "Grammarly API rate limit exceeded. Please try again later.",
        details: { statusCode: 429 },
      };
    }

    return {
      success: false,
      error: error.message,
      details: {
        statusCode: error.response?.status || "unknown",
      },
    };
  }
}

/**
 * Analyze multiple text fields for AI generation
 */
async function analyzeTextForAI(textFields) {
  const results = {};

  for (const [fieldName, text] of Object.entries(textFields)) {
    if (text && text.trim().length > 0) {
      try {
        // Check if text meets minimum requirements (30 words as per Grammarly API)
        const wordCount = text.trim().split(/\s+/).length;
        if (wordCount < 30) {
          results[fieldName] = {
            success: false,
            error:
              "Text too short for AI detection (minimum 30 words required)",
            details: { wordCount },
          };
          continue;
        }

        const result = await detectAIGeneratedText(text);
        results[fieldName] = result;
      } catch (error) {
        console.error(`AI detection failed for ${fieldName}:`, error);
        results[fieldName] = { success: false, error: error.message };
      }
    }
  }

  return results;
}

/**
 * Get overall AI detection summary for a post
 */
function getAIDetectionSummary(aiResults) {
  const flaggedFields = [];
  let overallConfidence = 0;
  let totalFields = 0;

  for (const [fieldName, result] of Object.entries(aiResults)) {
    if (result.success && result.isAIGenerated) {
      flaggedFields.push({
        field: fieldName,
        confidence: result.confidence,
        details: result.details,
      });
      overallConfidence += result.confidence;
      totalFields++;
    }
  }

  const averageConfidence =
    totalFields > 0 ? overallConfidence / totalFields : 0;

  return {
    hasAIGeneratedContent: flaggedFields.length > 0,
    flaggedFields: flaggedFields,
    overallConfidence: averageConfidence,
    totalFieldsAnalyzed: totalFields,
  };
}

module.exports = {
  detectAIGeneratedText,
  analyzeTextForAI,
  getAIDetectionSummary,
};
