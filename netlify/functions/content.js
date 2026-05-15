/**
 * Content Factory — Replicate Flux 1.1 Pro Backend
 * 
 * Generates production-grade images via Replicate's Flux 1.1 Pro model.
 * Supports native aspect ratios and brand reference images (Flux Redux).
 * 
 * Required env var: REPLICATE_API_TOKEN
 */

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      throw new Error(
        "REPLICATE_API_TOKEN environment variable is missing. " +
        "Add it in Netlify → Site Settings → Environment Variables."
      );
    }

    const body = JSON.parse(event.body);
    const { prompt, aspectRatio, referenceImages } = body;

    if (!prompt || !prompt.trim()) {
      throw new Error("No prompt provided.");
    }

    // ── Map frontend aspect ratios to Flux's native aspect_ratio param ──
    // Flux 1.1 Pro supports: 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3, 4:5, 5:4, 21:9, 9:21
    const VALID_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4"];
    const fluxAspectRatio = VALID_RATIOS.includes(aspectRatio) ? aspectRatio : "1:1";

    // ── Build Replicate input payload ──
    const input = {
      prompt: prompt,
      aspect_ratio: fluxAspectRatio,
      output_format: "webp",
      output_quality: 90,
      safety_tolerance: 2,
      prompt_upsampling: true
    };

    // ── Brand Reference Images (Flux Redux) ──
    // If the user uploaded reference images, pass the first one as image_prompt.
    // Flux Redux uses this to guide the composition and style of the output.
    if (referenceImages && referenceImages.length > 0 && referenceImages[0].data) {
      const ref = referenceImages[0];
      const mimeType = ref.mimeType || "image/png";
      input.image_prompt = `data:${mimeType};base64,${ref.data}`;
    }

    // ── Create Prediction (sync-first approach) ──
    // Uses the Prefer: wait header to get a synchronous response.
    // Replicate will hold the connection for up to 60s and return the result directly.
    const MODEL = "black-forest-labs/flux-1.1-pro";
    const createUrl = `https://api.replicate.com/v1/models/${MODEL}/predictions`;

    console.log(`[Content Factory] Creating prediction — model: ${MODEL}, ratio: ${fluxAspectRatio}, hasRef: ${!!input.image_prompt}`);

    const createRes = await fetch(createUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify({ input })
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Replicate API Error (${createRes.status}): ${errText}`);
    }

    let prediction = await createRes.json();

    // ── Polling Fallback ──
    // If the sync request returned before the prediction finished,
    // poll until completion (max ~45 seconds, checking every 1.5s).
    if (prediction.status !== "succeeded" && prediction.status !== "failed" && prediction.status !== "canceled") {
      const pollUrl = prediction.urls?.get;
      if (!pollUrl) {
        throw new Error("Replicate returned no polling URL. Prediction may have failed to start.");
      }

      console.log(`[Content Factory] Sync response pending — falling back to polling (id: ${prediction.id})`);

      const MAX_POLLS = 30;      // 30 × 1.5s = 45s max wait
      const POLL_INTERVAL = 1500; // 1.5 seconds

      for (let i = 0; i < MAX_POLLS; i++) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));

        const pollRes = await fetch(pollUrl, {
          headers: { "Authorization": `Bearer ${apiToken}` }
        });

        if (!pollRes.ok) {
          throw new Error(`Replicate polling error (${pollRes.status})`);
        }

        prediction = await pollRes.json();

        if (prediction.status === "succeeded" || prediction.status === "failed" || prediction.status === "canceled") {
          break;
        }
      }
    }

    // ── Handle Result ──
    if (prediction.status === "failed") {
      const errorMsg = prediction.error || "Image generation failed.";
      throw new Error(`Replicate prediction failed: ${errorMsg}`);
    }

    if (prediction.status === "canceled") {
      throw new Error("Image generation was canceled.");
    }

    if (prediction.status !== "succeeded") {
      throw new Error(`Image generation timed out (status: ${prediction.status}). Try a simpler prompt.`);
    }

    // Flux output is typically a single URL or an array with one URL
    let imageUrl = prediction.output;
    if (Array.isArray(imageUrl)) {
      imageUrl = imageUrl[0];
    }

    if (!imageUrl) {
      throw new Error("Replicate returned no output image.");
    }

    console.log(`[Content Factory] Generation succeeded — ${prediction.metrics?.predict_time || '?'}s`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        content: imageUrl
      }),
    };

  } catch (error) {
    console.error("[Content Factory] Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Content Factory Error: ${error.message}` }),
    };
  }
};
