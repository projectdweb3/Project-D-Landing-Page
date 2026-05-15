/**
 * Gmail Connect — Per-User OAuth Flow Handler
 *
 * Two modes:
 *   1. GET ?action=connect&userId=xxx  → Redirects user to Google consent screen
 *   2. GET ?code=xxx&state=userId      → Callback: exchanges code for tokens, stores in Supabase
 *   3. GET ?action=status&userId=xxx   → Returns connection status for a user
 *   4. POST ?action=disconnect         → Removes user's Gmail tokens from Supabase
 *
 * Env vars required:
 *   GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

exports.handler = async function (event, context) {
  const params = event.queryStringParameters || {};
  const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
  const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  // CORS headers for API calls
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // ─── Action: Check connection status ───
  if (event.httpMethod === "GET" && params.action === "status") {
    if (!params.userId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing userId" }) };
    }
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/gmail_tokens?user_id=eq.${params.userId}&select=email,connected_at`,
        {
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ connected: true, email: data[0].email, connected_at: data[0].connected_at }),
        };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ connected: false }) };
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  // ─── Action: Disconnect Gmail ───
  if (event.httpMethod === "POST" && params.action === "disconnect") {
    try {
      const body = JSON.parse(event.body || "{}");
      if (!body.userId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing userId" }) };
      }
      await fetch(
        `${SUPABASE_URL}/rest/v1/gmail_tokens?user_id=eq.${body.userId}`,
        {
          method: "DELETE",
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        }
      );
      return { statusCode: 200, headers, body: JSON.stringify({ disconnected: true }) };
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  // ─── Action: Start OAuth flow (redirect to Google) ───
  if (event.httpMethod === "GET" && params.action === "connect") {
    if (!params.userId) {
      return { statusCode: 400, body: "Missing userId parameter" };
    }
    if (!GMAIL_CLIENT_ID) {
      return { statusCode: 500, body: "GMAIL_CLIENT_ID not configured" };
    }

    // Determine the callback URL (this same function)
    const host = event.headers.host || event.headers.Host;
    const protocol = host?.includes("localhost") ? "http" : "https";
    const redirectUri = `${protocol}://${host}/.netlify/functions/gmail-connect`;

    // State carries the userId so we can store the token for the right user
    const state = encodeURIComponent(params.userId);

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GMAIL_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify email");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    authUrl.searchParams.set("state", state);

    return {
      statusCode: 302,
      headers: { Location: authUrl.toString() },
      body: "",
    };
  }

  // ─── Callback: Google redirects back with ?code=xxx&state=userId ───
  if (event.httpMethod === "GET" && params.code) {
    try {
      const userId = decodeURIComponent(params.state || "");
      if (!userId) {
        throw new Error("Missing state (userId) in callback");
      }

      const host = event.headers.host || event.headers.Host;
      const protocol = host?.includes("localhost") ? "http" : "https";
      const redirectUri = `${protocol}://${host}/.netlify/functions/gmail-connect`;

      // Exchange authorization code for tokens
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: params.code,
          client_id: GMAIL_CLIENT_ID,
          client_secret: GMAIL_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        throw new Error(`Token exchange failed: ${errText}`);
      }

      const tokenData = await tokenRes.json();
      const refreshToken = tokenData.refresh_token;
      const accessToken = tokenData.access_token;

      if (!refreshToken) {
        throw new Error(
          "No refresh_token received. The user may have previously authorized this app. " +
          "Try revoking access at https://myaccount.google.com/permissions and reconnecting."
        );
      }

      // Get the user's email address from the token
      let userEmail = "";
      try {
        const profileRes = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (profileRes.ok) {
          const profile = await profileRes.json();
          userEmail = profile.email || "";
        }
      } catch (_) {}

      // Store the refresh token in Supabase
      const upsertRes = await fetch(
        `${SUPABASE_URL}/rest/v1/gmail_tokens`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            user_id: userId,
            email: userEmail,
            refresh_token: refreshToken,
            connected_at: new Date().toISOString(),
          }),
        }
      );

      if (!upsertRes.ok) {
        const errText = await upsertRes.text();
        console.error("[Gmail Connect] Supabase upsert failed:", errText);
        throw new Error("Failed to save Gmail credentials");
      }

      console.log(`[Gmail Connect] ✅ Connected ${userEmail} for user ${userId.slice(0, 8)}...`);

      // Redirect back to AMP Center with success indicator
      const returnUrl = `${protocol}://${host}/amp-center.html?gmail_connected=true`;
      return {
        statusCode: 302,
        headers: { Location: returnUrl },
        body: "",
      };
    } catch (err) {
      console.error("[Gmail Connect] Error:", err.message);
      const host = event.headers.host || event.headers.Host;
      const protocol = host?.includes("localhost") ? "http" : "https";
      const returnUrl = `${protocol}://${host}/amp-center.html?gmail_error=${encodeURIComponent(err.message)}`;
      return {
        statusCode: 302,
        headers: { Location: returnUrl },
        body: "",
      };
    }
  }

  return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request" }) };
};
