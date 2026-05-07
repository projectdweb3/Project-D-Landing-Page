exports.handler = async (event, context) => {
  const httpMethod = event.httpMethod;
  const queryParams = event.queryStringParameters || {};
  const uid = queryParams.uid;

  // We require a uid parameter to identify which user's account this message belongs to
  if (!uid) {
    return { statusCode: 400, body: 'Missing user ID in webhook URL' };
  }

  // TODO: Initialize Supabase client
  // const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  
  // TODO: Fetch user profile to get their specific API keys
  // const { data: profile } = await supabase.from('business_profile').select('api_keys').eq('user_id', uid).single();
  // const userVerifyToken = profile?.api_keys?.whatsapp_verify;
  
  // Simulated for now:
  const userVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN; // Replace this with the DB fetch

  // Verify Webhook Setup from Meta
  if (httpMethod === 'GET') {
    const mode = queryParams['hub.mode'];
    const verifyToken = queryParams['hub.verify_token'];
    const challenge = queryParams['hub.challenge'];

    if (mode === 'subscribe' && verifyToken === userVerifyToken) {
      return {
        statusCode: 200,
        body: challenge
      };
    } else {
      return { statusCode: 403, body: 'Forbidden: Invalid Verify Token' };
    }
  }

  // Handle incoming messages
  if (httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);

      // Meta sends messages inside an 'entry' array
      if (body.object === 'whatsapp_business_account' && body.entry) {
        const entry = body.entry[0];
        const changes = entry.changes[0];
        const value = changes.value;

        if (value.messages && value.messages[0]) {
          const message = value.messages[0];
          const from = message.from; // Sender's phone number
          const text = message.text?.body; // Message content

          console.log(`[User: ${uid}] Received message from ${from}: ${text}`);
          
          // TODO: Insert into driver_messages table linked to this specific user
          // await supabase.from('driver_messages').insert([{
          //   user_id: uid,
          //   sender_phone: from,
          //   text: text,
          //   platform: 'whatsapp',
          //   created_at: new Date().toISOString()
          // }]);
        }
      }

      return { statusCode: 200, body: 'EVENT_RECEIVED' };
    } catch (error) {
      console.error(error);
      return { statusCode: 500, body: 'Internal Server Error' };
    }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
