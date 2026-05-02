const { createClient } = require("@supabase/supabase-js");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }

    const body = JSON.parse(event.body);
    const { prompt, aspectRatio, referenceImages, userId } = body;
    
    // Default aspect ratio if not provided
    const selectedRatio = aspectRatio || "1:1";

    const modelId = "imagen-3.0-generate-001";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${apiKey}`;

    const payload = {
      instances: [
        {
          prompt: prompt
        }
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: selectedRatio
      }
    };

    const apiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      throw new Error(`Gemini Image API Error: ${apiRes.status} ${errorText}`);
    }

    const data = await apiRes.json();
    
    if (!data.predictions || data.predictions.length === 0) {
      throw new Error("No image generated from Gemini API");
    }

    const base64Image = data.predictions[0].bytesBase64Encoded;
    const mimeType = data.predictions[0].mimeType;
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        content: dataUrl
      }),
    };

  } catch (error) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Content Factory Error: ${error.message}` }),
    };
  }
};
