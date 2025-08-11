const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const os = require("os"); // Added for robust temporary directory handling

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.AI_STUDIO);

/**
 * Downloads a file from a URL and saves it to the system's temporary directory.
 * @param {string} url - The URL of the file to download.
 * @param {string} filename - The desired filename for the temporary file.
 * @returns {Promise<string>} The full path to the saved temporary file.
 */
async function downloadFile(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    // Use the OS's temporary directory for better portability
    const tempPath = path.join(os.tmpdir(), filename);

    fs.writeFileSync(tempPath, Buffer.from(buffer));
    console.log(`File downloaded to: ${tempPath}`);
    return tempPath;
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

/**
 * Deletes a temporary file if it exists.
 * @param {string | null} filePath - The path to the file to delete.
 */
function cleanupTempFile(filePath) {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up temp file: ${filePath}`);
    }
  } catch (error) {
    console.error("Error cleaning up temp file:", error);
  }
}

/**
 * Cleans the AI's text response to ensure it's valid JSON.
 * @param {string} text - The raw text response from the AI.
 * @returns {string} A cleaned string ready for JSON parsing.
 */
function cleanJsonString(text) {
  // AI models sometimes wrap JSON in markdown backticks. This removes them.
  return text.replace(/```json\n?|\n?```/g, "").trim();
}

/**
 * Analyzes a BATCH of images or videos from URLs for potential crime-related content.
 * @param {Array<object>} attachments - An array of attachment objects, e.g., [{ url: "...", fileType: "image" }]
 * @returns {Promise<object>} An object containing the success status and a single, combined analysis.
 */
async function analyzeMediaBatch(attachments) {
  // Use a model that supports vision and multiple images
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  // This prompt now asks the AI to analyze ALL provided images together.
  const prompt = `
    You are an expert crime scene investigator. Analyze ALL of the provided images/videos together as a single incident report. Provide a consolidated analysis in the following JSON format.

    Analyze the media for potential crime or incident detection. Provide:
    1.  **aiDescription**: A single, detailed description summarizing everything you observe across ALL media.
    2.  **crimeBadges**: A combined list of specific crime types (e.g., "Theft", "Vandalism"). If no crime is detected, return ["No Crime Detected"].
    3.  **certaintyPercentage**: A single number (0-100) indicating your overall confidence that a crime is depicted across all media.
    4.  **threatLevel**: The highest threat level ("Low", "Medium", "High", "Critical") found across all media.
    5.  **recommendedActions**: Consolidated, brief, actionable advice.

    Format your entire response as a single, valid JSON object without any markdown.
  `;

  const fileParts = [];
  const tempFilePaths = []; // Keep track of all temp files to clean up

  try {
    // 1. Download all files and prepare them for the API
    for (const attachment of attachments) {
      const extension = attachment.fileType === "image" ? "jpg" : "mp4";
      const filename = `crime_report_media_${Date.now()}.${extension}`;
      const tempFilePath = await downloadFile(attachment.url, filename);
      tempFilePaths.push(tempFilePath); // Add to our list for cleanup

      const fileData = fs.readFileSync(tempFilePath);
      const mimeType =
        attachment.fileType === "image" ? "image/jpeg" : "video/mp4";

      fileParts.push({
        inlineData: { data: fileData.toString("base64"), mimeType },
      });
    }

    // 2. Make a SINGLE API call with the prompt and all file parts
    const result = await model.generateContent([prompt, ...fileParts]);
    const responseText = result.response.text();
    const cleanedText = cleanJsonString(responseText); // Assuming you have this helper function

    // 3. Parse and return the combined analysis
    const analysis = JSON.parse(cleanedText);
    return { success: true, analysis };
  } catch (error) {
    console.error("Gemini AI batch media analysis error:", error);
    // Return a structured error response
    return {
      success: false,
      error: error.message,
      analysis: {
        /* your default error object */
      },
    };
  } finally {
    // 4. Clean up ALL temporary files
    tempFilePaths.forEach(cleanupTempFile);
  }
}

/**
 * Analyzes a text description of a crime for additional insights.
 * @param {string} description - The text description of the incident.
 * @returns {Promise<object>} An object containing the success status and analysis results.
 */
async function analyzeTextDescription(description) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze the following crime incident description and provide enhanced insights.

    Description: "${description}"

    Return your analysis in a single, valid JSON object with the following structure, without any markdown formatting:
    {
        "enhancedDescription": "Improve and expand the original description with more detail and professional language.",
        "additionalBadges": ["Suggest any other relevant crime categories."],
        "riskAssessment": {
            "threatLevel": "Low|Medium|High|Critical",
            "certaintyPercentage": "An updated certainty percentage based on the text."
        },
        "contextAnalysis": "Identify key factors, potential motives, or important context from the description."
    }
    `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = cleanJsonString(responseText);

    const analysis = JSON.parse(cleanedText);
    return { success: true, analysis };
  } catch (error) {
    console.error("Text analysis error:", error);
    return {
      success: false,
      error: error.message,
      analysis: {
        enhancedDescription: "Text analysis failed.",
        additionalBadges: [],
        riskAssessment: { threatLevel: "Unknown", certaintyPercentage: 0 },
        contextAnalysis: "Could not process the text description.",
      },
    };
  }
}

module.exports = {
  analyzeMediaBatch,
  analyzeTextDescription,
};
