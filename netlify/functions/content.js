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
    const { prompt, referenceImages, businessContext } = body;

    const modelId = "nano-banana-pro-preview";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    let parts = [];
    
    // Add text prompt
    const fullPrompt = `You are the Creative Agent for the AMP Center. 
Context: ${businessContext || 'No specific business context provided.'}
Task: Generate the requested creative asset based on the provided reference images and context.
User Request: ${prompt}`;
    
    parts.push({ text: fullPrompt });

    // Add inline images
    if (referenceImages && referenceImages.length > 0) {
      for (const img of referenceImages) {
        parts.push({
          inline_data: {
            mime_type: img.mimeType,
            data: img.data
          }
        });
      }
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: parts
        }
      ]
    };

    const apiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      throw new Error(`Gemini API Error: ${apiRes.status} ${errorText}`);
    }

    const data = await apiRes.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No candidates returned from Gemini API");
    }

    const responseParts = data.candidates[0].content.parts;
    let textResponse = "";
    
    for (const part of responseParts) {
      if (part.text) {
        textResponse += part.text;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        content: textResponse || "Asset generation complete."
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
