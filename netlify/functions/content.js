const { createClient } = require("@supabase/supabase-js");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body);
    const { prompt, aspectRatio } = body;
    
    let width = 1024;
    let height = 1024;
    
    if (aspectRatio === '16:9') { width = 1024; height = 576; }
    else if (aspectRatio === '9:16') { width = 576; height = 1024; }
    else if (aspectRatio === '4:3') { width = 1024; height = 768; }
    else if (aspectRatio === '3:4') { width = 768; height = 1024; }
    
    // Add random seed to bypass cache and force a new generation every time
    const seed = Math.floor(Math.random() * 10000000);
    const safePrompt = encodeURIComponent(prompt || "abstract brand concept");
    const imageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        content: imageUrl
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
