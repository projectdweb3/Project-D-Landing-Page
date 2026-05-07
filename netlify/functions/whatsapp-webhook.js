exports.handler = async (event, context) => {
  const httpMethod = event.httpMethod;

  // Verify Webhook Setup from Meta
  if (httpMethod === 'GET') {
    const queryParams = event.queryStringParameters;
    if (queryParams) {
      const mode = queryParams['hub.mode'];
      const verifyToken = queryParams['hub.verify_token'];
      const challenge = queryParams['hub.challenge'];

      if (mode === 'subscribe' && verifyToken === process.env.WHATSAPP_VERIFY_TOKEN) {
        return {
          statusCode: 200,
          body: challenge
        };
      } else {
        return { statusCode: 403, body: 'Forbidden' };
      }
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

          console.log(`Received message from ${from}: ${text}`);

          // TODO: Initialize Supabase client
          // const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
          
          // TODO: Insert into driver_messages table
          // await supabase.from('driver_messages').insert([{
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
