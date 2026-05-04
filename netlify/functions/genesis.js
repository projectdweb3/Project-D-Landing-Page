const { createClient } = require("@supabase/supabase-js");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body);
    const { description } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Missing API Key" }) };
    }

    const systemInstruction = `You are the core architect of the AMP Center platform.
Your job is to analyze the user's description of their business ("kingdom") and design a highly customized AI workforce for them.

You must output a raw JSON object with NO markdown wrapping, matching this exact schema:
{
  "businessStage": "One of: ['Solo', 'Family', 'Ecomm', 'Local Service', 'Software', 'Food']",
  "subAgents": [
    {
      "name": "Custom Agent Name (e.g. 'Ad Copywriter', 'Supply Chain Tracker')",
      "parent": "Which core agent they report to. MUST be one of: 'CMO', 'CTO', or 'Creative'",
      "description": "Short 1-sentence description of their role.",
      "icon": "A valid Solar Icon name (e.g. 'solar:box-linear', 'solar:pen-linear', 'solar:cart-linear', 'solar:graph-up-linear')"
    }
  ]
}

Rules:
1. Select the businessStage that best fits their description. If none fit perfectly, default to 'Solo' or 'Local Service' depending on context.
2. Generate exactly 2 to 4 highly specific subAgents tailored to their business model.
3. Distribute the subAgents logically among the 'CMO', 'CTO', and 'Creative' parents.
4. Keep the agent names punchy and professional.`;

    const modelId = "gemini-2.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    const requestPayload = {
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: `Analyze this business description: "${description || 'A new undefined startup.'}"` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        response_mime_type: "application/json"
      }
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Gemini API Error: ${data.error?.message || response.statusText}`);
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(generatedText);

    return {
      statusCode: 200,
      body: JSON.stringify(parsed),
    };

  } catch (error) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Genesis Analysis Error: ${error.message}` }),
    };
  }
};
