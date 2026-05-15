/**
 * Gmail Inbox — Full Inbox Access for AMP Center Gmail Command Center
 *
 * Actions:
 *   GET  ?action=list&userId=xxx&maxResults=20&pageToken=xxx   → List inbox messages
 *   GET  ?action=thread&userId=xxx&threadId=xxx                → Get full thread
 *   POST ?action=read    { userId, messageId }                 → Mark message as read
 *   POST ?action=reply   { userId, threadId, messageId, to, subject, body }  → Reply in thread
 *   POST ?action=send    { userId, to, subject, body }         → Send new email
 *   POST ?action=trash   { userId, messageId }                 → Trash a message
 *   POST ?action=star    { userId, messageId, starred }        → Star/unstar
 *
 * Uses stored refresh_token from gmail_tokens table.
 * Env vars: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

async function getAccessToken(userId) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
  const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;

  // 1. Get refresh token from Supabase
  const tokenRes = await fetch(
    `${SUPABASE_URL}/rest/v1/gmail_tokens?user_id=eq.${userId}&select=refresh_token,email`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );
  const tokens = await tokenRes.json();
  if (!tokens || tokens.length === 0) {
    throw new Error("Gmail not connected. Please connect your Gmail in Settings first.");
  }

  const refreshToken = tokens[0].refresh_token;
  const email = tokens[0].email;

  // 2. Exchange refresh token for access token
  const authRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!authRes.ok) {
    const errText = await authRes.text();
    throw new Error(`Token refresh failed: ${errText}`);
  }

  const authData = await authRes.json();
  return { accessToken: authData.access_token, email };
}

function decodeBase64Url(str) {
  if (!str) return "";
  // Replace URL-safe chars and pad
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return Buffer.from(base64, "base64").toString("utf-8");
}

function getHeader(headers, name) {
  if (!headers) return "";
  const h = headers.find(
    (h) => h.name.toLowerCase() === name.toLowerCase()
  );
  return h ? h.value : "";
}

function extractBody(payload) {
  // Simple text extraction from Gmail message payload
  if (!payload) return "";

  // Direct body
  if (payload.body && payload.body.data) {
    return decodeBase64Url(payload.body.data);
  }

  // Multipart — look for text/html first, then text/plain
  if (payload.parts) {
    // Recursive search for HTML content
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body && part.body.data) {
        return decodeBase64Url(part.body.data);
      }
      if (part.parts) {
        const nested = extractBody(part);
        if (nested) return nested;
      }
    }
    // Fallback to plain text
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body && part.body.data) {
        return decodeBase64Url(part.body.data);
      }
    }
  }

  return "";
}

function parseMessage(msg) {
  const headers = msg.payload?.headers || [];
  const from = getHeader(headers, "From");
  const to = getHeader(headers, "To");
  const subject = getHeader(headers, "Subject");
  const date = getHeader(headers, "Date");
  const messageId = getHeader(headers, "Message-ID");

  // Extract name and email from "Name <email>" format
  const fromMatch = from.match(/^(.+?)\s*<(.+?)>$/);
  const fromName = fromMatch ? fromMatch[1].replace(/"/g, "").trim() : from;
  const fromEmail = fromMatch ? fromMatch[2] : from;

  const body = extractBody(msg.payload);
  const isUnread = (msg.labelIds || []).includes("UNREAD");
  const isStarred = (msg.labelIds || []).includes("STARRED");
  const isImportant = (msg.labelIds || []).includes("IMPORTANT");

  return {
    id: msg.id,
    threadId: msg.threadId,
    snippet: msg.snippet || "",
    from: fromName,
    fromEmail,
    to,
    subject,
    date,
    body,
    isUnread,
    isStarred,
    isImportant,
    labelIds: msg.labelIds || [],
    internalDate: msg.internalDate,
  };
}

function createRawEmail({ to, subject, body, threadId, messageId, from }) {
  const boundary = "boundary_" + Date.now();
  let headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];

  if (messageId) {
    headers.push(`In-Reply-To: ${messageId}`);
    headers.push(`References: ${messageId}`);
  }

  const plainBody = body.replace(/<[^>]*>/g, ""); // Strip HTML for plain text version

  const raw = [
    headers.join("\r\n"),
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    plainBody,
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    body,
    `--${boundary}--`,
  ].join("\r\n");

  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

exports.handler = async function (event) {
  const params = event.queryStringParameters || {};
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // ─── LIST INBOX ───
    if (event.httpMethod === "GET" && params.action === "list") {
      if (!params.userId) throw new Error("Missing userId");

      const { accessToken } = await getAccessToken(params.userId);
      const maxResults = params.maxResults || "25";
      let url = `${GMAIL_API}/messages?maxResults=${maxResults}&labelIds=INBOX`;
      if (params.pageToken) url += `&pageToken=${params.pageToken}`;
      if (params.q) url += `&q=${encodeURIComponent(params.q)}`;

      const listRes = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!listRes.ok) throw new Error(`Gmail list failed: ${await listRes.text()}`);
      const listData = await listRes.json();

      if (!listData.messages || listData.messages.length === 0) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ messages: [], nextPageToken: null, resultSizeEstimate: 0 }),
        };
      }

      // Fetch details for each message (batch via individual calls — Gmail batch API requires multipart which is complex)
      const messageDetails = await Promise.all(
        listData.messages.map(async (m) => {
          const detailRes = await fetch(
            `${GMAIL_API}/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date&metadataHeaders=Message-ID`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (!detailRes.ok) return null;
          return detailRes.json();
        })
      );

      const messages = messageDetails
        .filter(Boolean)
        .map((msg) => {
          const h = msg.payload?.headers || [];
          const from = getHeader(h, "From");
          const fromMatch = from.match(/^(.+?)\s*<(.+?)>$/);
          return {
            id: msg.id,
            threadId: msg.threadId,
            snippet: msg.snippet || "",
            from: fromMatch ? fromMatch[1].replace(/"/g, "").trim() : from,
            fromEmail: fromMatch ? fromMatch[2] : from,
            subject: getHeader(h, "Subject"),
            date: getHeader(h, "Date"),
            isUnread: (msg.labelIds || []).includes("UNREAD"),
            isStarred: (msg.labelIds || []).includes("STARRED"),
            isImportant: (msg.labelIds || []).includes("IMPORTANT"),
            internalDate: msg.internalDate,
          };
        });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          messages,
          nextPageToken: listData.nextPageToken || null,
          resultSizeEstimate: listData.resultSizeEstimate || 0,
        }),
      };
    }

    // ─── GET FULL THREAD ───
    if (event.httpMethod === "GET" && params.action === "thread") {
      if (!params.userId || !params.threadId) throw new Error("Missing userId or threadId");

      const { accessToken } = await getAccessToken(params.userId);
      const threadRes = await fetch(
        `${GMAIL_API}/threads/${params.threadId}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!threadRes.ok) throw new Error(`Thread fetch failed: ${await threadRes.text()}`);
      const threadData = await threadRes.json();

      const messages = (threadData.messages || []).map(parseMessage);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ messages, threadId: threadData.id }),
      };
    }

    // ─── POST ACTIONS ───
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const action = params.action || body.action;

      if (!body.userId) throw new Error("Missing userId");

      const { accessToken, email } = await getAccessToken(body.userId);

      // ── Mark as Read ──
      if (action === "read") {
        if (!body.messageId) throw new Error("Missing messageId");
        const modRes = await fetch(
          `${GMAIL_API}/messages/${body.messageId}/modify`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ removeLabelIds: ["UNREAD"] }),
          }
        );
        if (!modRes.ok) throw new Error(`Mark read failed: ${await modRes.text()}`);
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
      }

      // ── Star / Unstar ──
      if (action === "star") {
        if (!body.messageId) throw new Error("Missing messageId");
        const modBody = body.starred
          ? { addLabelIds: ["STARRED"] }
          : { removeLabelIds: ["STARRED"] };
        const modRes = await fetch(
          `${GMAIL_API}/messages/${body.messageId}/modify`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(modBody),
          }
        );
        if (!modRes.ok) throw new Error(`Star failed: ${await modRes.text()}`);
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
      }

      // ── Trash ──
      if (action === "trash") {
        if (!body.messageId) throw new Error("Missing messageId");
        const trashRes = await fetch(
          `${GMAIL_API}/messages/${body.messageId}/trash`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!trashRes.ok) throw new Error(`Trash failed: ${await trashRes.text()}`);
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
      }

      // ── Send New Email ──
      if (action === "send") {
        if (!body.to || !body.subject) throw new Error("Missing to or subject");
        const raw = createRawEmail({
          to: body.to,
          subject: body.subject,
          body: body.body || "",
          from: email,
        });
        const sendRes = await fetch(`${GMAIL_API}/messages/send`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ raw }),
        });
        if (!sendRes.ok) throw new Error(`Send failed: ${await sendRes.text()}`);
        const sendData = await sendRes.json();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, messageId: sendData.id }),
        };
      }

      // ── Reply to Thread ──
      if (action === "reply") {
        if (!body.to || !body.threadId) throw new Error("Missing to or threadId");
        const raw = createRawEmail({
          to: body.to,
          subject: body.subject || "Re: ",
          body: body.body || "",
          threadId: body.threadId,
          messageId: body.inReplyTo || "",
          from: email,
        });
        const sendRes = await fetch(`${GMAIL_API}/messages/send`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ raw, threadId: body.threadId }),
        });
        if (!sendRes.ok) throw new Error(`Reply failed: ${await sendRes.text()}`);
        const sendData = await sendRes.json();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, messageId: sendData.id }),
        };
      }

      throw new Error(`Unknown POST action: ${action}`);
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request" }) };
  } catch (err) {
    console.error("[Gmail Inbox]", err.message);
    return {
      statusCode: err.message.includes("not connected") ? 403 : 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
