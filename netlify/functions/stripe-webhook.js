const { createClient } = require("@supabase/supabase-js");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const userId = event.queryStringParameters.userId;
    const businessStage = event.queryStringParameters.stage || "Default";

    if (!userId) {
      return { statusCode: 400, body: "Missing userId query parameter in webhook URL" };
    }

    const payload = JSON.parse(event.body);
    const eventType = payload.type;
    
    // We only process charge.succeeded in this serverless webhook handler
    if (eventType !== "charge.succeeded") {
      return { statusCode: 200, body: `Event type ${eventType} ignored` };
    }

    const c = payload.data.object;
    if (!c.paid || c.status !== "succeeded") {
      return { statusCode: 200, body: "Charge is unpaid or not succeeded" };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { statusCode: 500, body: "Supabase configuration missing on server" };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const chargeAmount = c.amount / 100;
    const feeAmount = parseFloat(((c.amount * 0.029) + 30) / 100);

    const transactionId = `stripe_ch_${c.id}`;
    const feeId = `stripe_fee_${c.id}`;
    const clientName = c.billing_details?.name || null;

    // Check if transaction already exists to avoid duplicates
    const { data: existing } = await supabase.from('finances').select('id').eq('id', transactionId).maybeSingle();
    
    if (existing) {
      return { statusCode: 200, body: "Transaction already processed" };
    }

    // Insert income transaction
    const t1 = {
      id: transactionId,
      user_id: userId,
      business_stage: businessStage,
      type: "Income",
      amount: chargeAmount,
      description: c.description || `Stripe webhook: charge.succeeded from ${clientName || 'Customer'}`,
      category: (c.description && c.description.toLowerCase().includes('sub')) ? 'Monthly Recurring Revenue' : 'One-Time Payment',
      client_name: clientName,
      created_at: new Date(c.created * 1000).toISOString()
    };

    // Insert fee expense transaction
    const t2 = {
      id: feeId,
      user_id: userId,
      business_stage: businessStage,
      type: "Expense",
      amount: parseFloat(feeAmount.toFixed(2)),
      description: `Stripe processing fee for charge ${c.id} (webhook)`,
      category: "Merchant Fees",
      client_name: null,
      created_at: new Date(c.created * 1000).toISOString()
    };

    const { error } = await supabase.from('finances').insert([t1, t2]);
    if (error) {
      throw new Error(`Supabase insert error: ${error.message}`);
    }

    // If clientName matches, update LTV in Supabase client ledger
    if (clientName) {
      const { data: clients } = await supabase.from('clients').select('*').eq('user_id', userId).eq('name', clientName);
      if (clients && clients.length > 0) {
        const client = clients[0];
        const currentLtvVal = parseFloat(String(client.ltv || '0').replace(/[^0-9.]/g, '')) || 0;
        const newLtv = currentLtvVal + chargeAmount;
        const newLtvString = `$${newLtv.toLocaleString()}`;
        await supabase.from('clients').update({ ltv: newLtvString }).eq('id', client.id);
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, message: "Webhook processed and synced to Supabase" })
    };

  } catch (error) {
    console.error("Stripe webhook processing error:", error);
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error.message}`
    };
  }
};
