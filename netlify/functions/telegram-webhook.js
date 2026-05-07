exports.handler = async (event, context) => {
  const httpMethod = event.httpMethod;
  const queryParams = event.queryStringParameters || {};
  const uid = queryParams.uid;

  if (httpMethod === 'POST') {
    try {
      // We require a uid parameter to identify which user's account this message belongs to
      if (!uid) {
        return { statusCode: 400, body: 'Missing user ID in webhook URL' };
      }

      // TODO: Initialize Supabase client
      // const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      
      // Validate secret token if configured (recommended by Telegram)
      const secretToken = event.headers['x-telegram-bot-api-secret-token'];
      
      // In a SaaS model, you'd likely fetch the user's specific secret token from the DB
      // const { data: profile } = await supabase.from('business_profile').select('api_keys').eq('user_id', uid).single();
      // const userSecretToken = profile?.api_keys?.telegram_secret; // Assuming you add this to the UI
      
      if (process.env.TELEGRAM_SECRET_TOKEN && secretToken !== process.env.TELEGRAM_SECRET_TOKEN) {
        // Keeping global secret token check for now, but can be made per-user
        return { statusCode: 403, body: 'Forbidden' };
      }

      const body = JSON.parse(event.body);

      // Extract message details
      if (body.message && body.message.text) {
        const message = body.message;
        const chatId = message.chat.id; // Sender's Telegram Chat ID
        const text = message.text;
        const username = message.from.username; // Sender's username

        console.log(`[User: ${uid}] Received Telegram message from @${username} (ID: ${chatId}): ${text}`);
        
        // TODO: Insert into driver_messages table
        // await supabase.from('driver_messages').insert([{
        //   user_id: uid,
        //   sender_phone: username || chatId.toString(),
        //   text: text,
        //   platform: 'telegram',
        //   created_at: new Date().toISOString()
        // }]);
      }

      return { statusCode: 200, body: 'OK' };
    } catch (error) {
      console.error(error);
      return { statusCode: 500, body: 'Internal Server Error' };
    }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
