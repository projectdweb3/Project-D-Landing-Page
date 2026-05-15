/**
 * Outreach Engine — Gmail API Email Sender (Multi-User)
 *
 * Sends real emails via each user's own Gmail account using OAuth 2.0.
 * Supports single and bulk sends with per-recipient personalization.
 *
 * Token resolution order:
 *   1. Per-user: Fetch refresh_token from Supabase gmail_tokens table (multi-tenant)
 *   2. Fallback: Use GMAIL_REFRESH_TOKEN + GMAIL_SENDER_EMAIL env vars (single-tenant / admin)
 *
 * Required env vars:
 *   GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY  (for per-user tokens)
 *   GMAIL_REFRESH_TOKEN, GMAIL_SENDER_EMAIL  (optional fallback)
 */

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Gmail OAuth app credentials are not configured (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET).");
    }

    const body = JSON.parse(event.body);
    const { recipients, subject, message, sender_name, userId } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new Error("No recipients provided.");
    }
    if (!subject || !subject.trim()) {
      throw new Error("No subject line provided.");
    }
    if (!message || !message.trim()) {
      throw new Error("No message body provided.");
    }

    // ── Resolve Gmail credentials (per-user or fallback) ──
    let refreshToken = null;
    let senderEmail = null;

    // Try per-user token from Supabase first
    if (userId && userId !== "local") {
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

      if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
        try {
          const res = await fetch(
            `${SUPABASE_URL}/rest/v1/gmail_tokens?user_id=eq.${userId}&select=email,refresh_token`,
            {
              headers: {
                apikey: SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
              },
            }
          );
          const data = await res.json();
          if (data && data.length > 0) {
            refreshToken = data[0].refresh_token;
            senderEmail = data[0].email;
            console.log(`[Outreach] Using per-user Gmail: ${senderEmail}`);
          }
        } catch (e) {
          console.warn("[Outreach] Failed to fetch per-user token:", e.message);
        }
      }
    }

    // Fallback to env vars (single-tenant / admin mode)
    if (!refreshToken) {
      refreshToken = process.env.GMAIL_REFRESH_TOKEN;
      senderEmail = process.env.GMAIL_SENDER_EMAIL;
    }

    if (!refreshToken || !senderEmail) {
      throw new Error(
        "Gmail is not connected. Go to Settings → Connect Gmail to link your account."
      );
    }

    // ── Step 1: Exchange refresh token for a fresh access token ──
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Failed to refresh Gmail access token: ${errText}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // ── Step 2: Send emails to each recipient ──
    const results = [];
    const fromHeader = sender_name
      ? `${sender_name} <${senderEmail}>`
      : senderEmail;

    for (const recipient of recipients) {
      if (!recipient.email || !recipient.email.includes("@")) {
        results.push({
          name: recipient.name || "Unknown",
          email: recipient.email || "",
          status: "skipped",
          reason: "Invalid or missing email address",
        });
        continue;
      }

      try {
        // Personalize message — replace {{name}} placeholder if present
        const personalizedMessage = message.replace(
          /\{\{name\}\}/gi,
          recipient.name || "there"
        );

        // Build RFC 2822 email with proper UTF-8 and HTML support
        const toHeader = recipient.name
          ? `${recipient.name} <${recipient.email}>`
          : recipient.email;

        // Convert plain text line breaks to HTML paragraphs for a cleaner look
        const htmlBody = personalizedMessage
          .split("\n\n")
          .map((p) => `<p style="margin:0 0 16px 0;line-height:1.6;color:#333;">${p.replace(/\n/g, "<br>")}</p>`)
          .join("");

        const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
${htmlBody}
</body>
</html>`;

        const rawEmail = [
          `From: ${fromHeader}`,
          `To: ${toHeader}`,
          `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
          `MIME-Version: 1.0`,
          `Content-Type: text/html; charset=UTF-8`,
          ``,
          emailHtml,
        ].join("\r\n");

        // Gmail API requires base64url encoding
        const encodedEmail = Buffer.from(rawEmail)
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        const sendRes = await fetch(
          "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ raw: encodedEmail }),
          }
        );

        if (sendRes.ok) {
          const sendData = await sendRes.json();
          console.log(
            `[Outreach] ✅ Sent to ${recipient.email} from ${senderEmail} (msgId: ${sendData.id})`
          );
          results.push({
            name: recipient.name || recipient.email,
            email: recipient.email,
            status: "sent",
            messageId: sendData.id,
          });
        } else {
          const errText = await sendRes.text();
          console.error(
            `[Outreach] ❌ Failed for ${recipient.email}: ${errText}`
          );
          results.push({
            name: recipient.name || recipient.email,
            email: recipient.email,
            status: "failed",
            reason: `Gmail API error (${sendRes.status})`,
          });
        }
      } catch (sendErr) {
        console.error(
          `[Outreach] ❌ Error sending to ${recipient.email}:`,
          sendErr.message
        );
        results.push({
          name: recipient.name || recipient.email,
          email: recipient.email,
          status: "failed",
          reason: sendErr.message,
        });
      }
    }

    // ── Step 3: Summarize results ──
    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const skipped = results.filter((r) => r.status === "skipped").length;

    console.log(
      `[Outreach] Complete: ${sent} sent, ${failed} failed, ${skipped} skipped (via ${senderEmail})`
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        summary: { sent, failed, skipped, total: recipients.length },
        results,
        sentFrom: senderEmail,
      }),
    };
  } catch (error) {
    console.error("[Outreach] Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: `Outreach Error: ${error.message}`,
      }),
    };
  }
};
