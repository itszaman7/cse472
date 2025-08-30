const axios = require("axios");

/**
 * Uses Hugging Face Space API to detect deepfake images.
 * Space: aaronespasa-deepfake-detection
 * Returns { success, label, score }
 */
async function detectDeepfakeFromUrl(imageUrl) {
  try {
    // Fetch image as arraybuffer
    const imgResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    // Convert to base64
    const base64Image = Buffer.from(imgResponse.data).toString("base64");
    const dataUrl = `data:image/png;base64,${base64Image}`;

    // Call the Hugging Face Space API
    const response = await axios.post(
      "https://aaronespasa-deepfake-detection.hf.space/run/predict",
      {
        data: [dataUrl, "deepfake_detection"],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      }
    );

    if (response.data && response.data.data) {
      const result = response.data.data;
      // The API returns the prediction result
      return {
        success: true,
        label: result.label || "unknown",
        score: result.score || 0,
        confidence: result.confidence || 0,
      };
    } else {
      return { success: false, error: "Invalid response format" };
    }
  } catch (error) {
    console.error("Deepfake detection error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Detect deepfake from base64 image data
 */
async function detectDeepfakeFromBase64(base64Data) {
  try {
    const dataUrl = `data:image/png;base64,${base64Data}`;

    const response = await axios.post(
      "https://aaronespasa-deepfake-detection.hf.space/run/predict",
      {
        data: [dataUrl, "deepfake_detection"],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      }
    );

    if (response.data && response.data.data) {
      const result = response.data.data;
      return {
        success: true,
        label: result.label || "unknown",
        score: result.score || 0,
        confidence: result.confidence || 0,
      };
    } else {
      return { success: false, error: "Invalid response format" };
    }
  } catch (error) {
    console.error("Deepfake detection error:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { detectDeepfakeFromUrl, detectDeepfakeFromBase64 };
