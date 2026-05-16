/**
 * Content Factory — Replicate Flux 1.1 Pro Backend
 *
 * Generates production-grade marketing visuals via Replicate's Flux 1.1 Pro model.
 * Supports content-type presets, brand style injection, and reference images.
 *
 * Required env var: REPLICATE_API_TOKEN
 * Get your token at: https://replicate.com/account/api-tokens
 */

// ── Content-type prompt engineering templates ──
const CONTENT_TYPE_CONTEXT = {
  "instagram-story": "vertical Instagram Story graphic (9:16 portrait format). Bold eye-catching typography, vibrant colours, designed for mobile viewing, space for text overlay at top and bottom thirds",
  "instagram-post": "square Instagram feed post (1:1 format). Thumb-stopping, scroll-stopping composition, clean professional layout, social media ready",
  "instagram-reel": "vertical Instagram Reel cover frame (9:16 portrait). Dynamic, energetic, bold typography treatment, designed to stop mid-scroll",
  "facebook-ad": "Facebook/Meta advertisement (4:3 format). Clear value proposition layout, professional marketing graphic, headline area prominent, CTA-focused composition",
  "linkedin-post": "LinkedIn professional post graphic (4:3 format). Clean corporate aesthetic, authoritative, trust-building visual, business-appropriate palette",
  "youtube-thumbnail": "YouTube video thumbnail (16:9 landscape). High contrast, bold large text, expressive face or focal point, designed to be legible at small sizes",
  "promotional-banner": "promotional marketing banner (16:9 landscape). Sale/offer focused, price or discount prominent, urgency-driven design, retail-quality composition",
  "flyer-poster": "portrait marketing flyer or poster (3:4 format). Print-quality, event or promotion focused, hierarchical typography, professional layout",
  "pinterest-pin": "tall Pinterest pin (2:3 portrait). Aspirational, lifestyle-driven aesthetic, elegant typography, pinterest-worthy composition",
  "story-ad": "vertical paid story advertisement (9:16). 3-second hook visual, single clear message, swipe-up area preserved at bottom, maximum visual impact",
  "square-ad": "square display advertisement (1:1). Balanced composition, brand-forward, suitable for multiple placements across social platforms",
  "email-header": "wide email header banner (16:9 landscape). Clean professional layout, brand colours dominant, clear headline area, digital-first design",
};

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      throw new Error(
        "REPLICATE_API_TOKEN is not configured. " +
        "Go to Netlify → Site Configuration → Environment Variables → Add REPLICATE_API_TOKEN. " +
        "Get your token at https://replicate.com/account/api-tokens"
      );
    }

    const body = JSON.parse(event.body);
    const { prompt, aspectRatio, contentType, brandStyle, referenceImages } = body;

    if (!prompt || !prompt.trim()) {
      throw new Error("No prompt provided.");
    }

    // ── Aspect ratio from content type or explicit selection ──
    const CONTENT_TYPE_RATIOS = {
      "instagram-story": "9:16",
      "instagram-reel": "9:16",
      "story-ad": "9:16",
      "instagram-post": "1:1",
      "square-ad": "1:1",
      "facebook-ad": "4:3",
      "linkedin-post": "4:3",
      "flyer-poster": "3:4",
      "pinterest-pin": "2:3",
      "youtube-thumbnail": "16:9",
      "promotional-banner": "16:9",
      "email-header": "16:9",
    };

    const VALID_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4"];
    const derivedRatio = CONTENT_TYPE_RATIOS[contentType] || aspectRatio;
    const fluxAspectRatio = VALID_RATIOS.includes(derivedRatio) ? derivedRatio : "1:1";

    // ── Build enhanced prompt ──
    // Layers: content type context → brand style → user prompt → quality suffix
    const contentTypeCtx = CONTENT_TYPE_CONTEXT[contentType];
    const qualitySuffix = "Professional graphic design, marketing-quality, no watermarks, no text artifacts, photorealistic rendering where appropriate, suitable for brand use.";

    const enhancedPromptParts = [];
    if (contentTypeCtx) {
      enhancedPromptParts.push(`Create a ${contentTypeCtx}.`);
    }
    if (brandStyle && brandStyle.trim()) {
      enhancedPromptParts.push(`Brand visual style: ${brandStyle.trim()}.`);
    }
    enhancedPromptParts.push(prompt.trim());
    enhancedPromptParts.push(qualitySuffix);

    const enhancedPrompt = enhancedPromptParts.join(" ");

    console.log(`[Content Factory] type=${contentType || "custom"}, ratio=${fluxAspectRatio}, hasRef=${!!(referenceImages && referenceImages.length > 0)}`);
    console.log(`[Content Factory] Enhanced prompt: ${enhancedPrompt.substring(0, 120)}...`);

    // ── Build Replicate input payload ──
    const input = {
      prompt: enhancedPrompt,
      aspect_ratio: fluxAspectRatio,
      output_format: "webp",
      output_quality: 95,
      safety_tolerance: 2,
      prompt_upsampling: true,
    };

    // ── Brand Reference Image (Flux image_prompt) ──
    // Pass the first reference image as visual style guidance.
    // image_prompt_strength controls how strongly the style is applied (0–1).
    if (referenceImages && referenceImages.length > 0 && referenceImages[0].data) {
      const ref = referenceImages[0];
      const mimeType = ref.mimeType || "image/jpeg";
      input.image_prompt = `data:${mimeType};base64,${ref.data}`;
      input.image_prompt_strength = 0.1; // Light style guidance — keeps creative freedom
    }

    // ── Create Prediction (sync-first with polling fallback) ──
    const MODEL = "black-forest-labs/flux-1.1-pro";
    const createUrl = `https://api.replicate.com/v1/models/${MODEL}/predictions`;

    const createRes = await fetch(createUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        "Prefer": "wait=55", // Wait up to 55s synchronously
      },
      body: JSON.stringify({ input }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Replicate API Error (${createRes.status}): ${errText}`);
    }

    let prediction = await createRes.json();

    // ── Polling Fallback ──
    if (prediction.status !== "succeeded" && prediction.status !== "failed" && prediction.status !== "canceled") {
      const pollUrl = prediction.urls?.get;
      if (!pollUrl) {
        throw new Error("Replicate returned no polling URL. Prediction may have failed to start.");
      }

      console.log(`[Content Factory] Polling prediction ${prediction.id}...`);

      const MAX_POLLS = 40;       // 40 × 2s = 80s max
      const POLL_INTERVAL = 2000;

      for (let i = 0; i < MAX_POLLS; i++) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));

        const pollRes = await fetch(pollUrl, {
          headers: { "Authorization": `Bearer ${apiToken}` },
        });

        if (!pollRes.ok) throw new Error(`Replicate polling error (${pollRes.status})`);

        prediction = await pollRes.json();

        if (prediction.status === "succeeded" || prediction.status === "failed" || prediction.status === "canceled") {
          break;
        }
      }
    }

    // ── Handle result ──
    if (prediction.status === "failed") {
      throw new Error(`Generation failed: ${prediction.error || "Unknown error from Replicate."}`);
    }
    if (prediction.status === "canceled") {
      throw new Error("Generation was canceled.");
    }
    if (prediction.status !== "succeeded") {
      throw new Error(`Generation timed out (status: ${prediction.status}). Try again.`);
    }

    let imageUrl = prediction.output;
    if (Array.isArray(imageUrl)) imageUrl = imageUrl[0];
    if (!imageUrl) throw new Error("Replicate returned no output image.");

    console.log(`[Content Factory] Done — ${prediction.metrics?.predict_time || "?"}s`);

    return {
      statusCode: 200,
      body: JSON.stringify({ content: imageUrl, ratio: fluxAspectRatio }),
    };

  } catch (error) {
    console.error("[Content Factory] Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
