const axios = require("axios");

/**
 * Uses Hugging Face Inference API to classify whether an image is deepfake.
 * Model: prithivMLmods/Deep-Fake-Detector-v2-Model
 * Returns { success, label, score }
 */
async function detectDeepfakeFromUrl(imageUrl) {
  const apiToken = process.env.HF_API_TOKEN;
  if (!apiToken) {
    return { success: false, error: "HF_API_TOKEN missing" };
  }

  try {
    // Fetch image as arraybuffer then send to HF API
    const img = await axios.get(imageUrl, { responseType: "arraybuffer" });

    const res = await axios.post(
      "https://api-inference.huggingface.co/models/prithivMLmods/Deep-Fake-Detector-v2-Model",
      img.data,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/octet-stream",
        },
        timeout: 30000,
      }
    );

    // HF image-classification returns array of {label, score}
    const predictions = Array.isArray(res.data) ? res.data : [];
    const top = predictions.sort((a, b) => b.score - a.score)[0] || null;
    if (!top) {
      return { success: false, error: "No prediction returned" };
    }
    return { success: true, label: top.label, score: top.score };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { detectDeepfakeFromUrl };
