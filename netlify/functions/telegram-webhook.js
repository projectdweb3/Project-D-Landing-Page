exports.handler = async (event, context) => {
  const httpMethod = event.httpMethod;

  if (httpMethod === 'POST') {
    try {
      // Validate secret token if configured (recommended by Telegram)
      const secretToken = event.headers['x-telegram-bot-api-secret-token'];
      if (process.env.TELEGRAM_SECRET_TOKEN && secretToken !== process.env.TELEGRAM_SECRET_TOKEN) {
        return { statusCode: 403, body: 'Forbidden' };
      }

      const body = JSON.parse(event.body);

      // Extract message details
      if (body.message && body.message.text) {
        const message = body.message;
        const chatId = message.chat.id; // Sender's Telegram Chat ID
        const text = message.text;
        const username = message.from.username; // Sender's username

        console.log(`Received Telegram message from @${username} (ID: ${chatId}): ${text}`);

        // TODO: Initialize Supabase client
        // const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
        
        // TODO: Insert into driver_messages table
        // await supabase.from('driver_messages').insert([{
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
