const { createClient } = require("@supabase/supabase-js");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { secretKey, userId, businessStage } = JSON.parse(event.body);

    if (!secretKey) {
      return { statusCode: 400, body: "Missing Stripe Secret Key" };
    }

    // Call Stripe API using standard fetch
    const response = await fetch("https://api.stripe.com/v1/charges?limit=25", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { 
        statusCode: response.status, 
        body: `Stripe API Error: ${errorText}`
      };
    }

    const data = await response.json();
    const charges = data.data || [];

    // Map charges to AMP transaction format
    const transactions = [];
    charges.forEach(c => {
      if (!c.paid || c.status !== "succeeded") return;

      const chargeAmount = c.amount / 100;
      // Deduct Stripe fee (2.9% + 30c) as a separate expense transaction
      const feeAmount = parseFloat(((c.amount * 0.029) + 30) / 100);

      // Mapped Income transaction
      transactions.push({
        id: `stripe_ch_${c.id}`,
        user_id: userId || "local",
        business_stage: businessStage || "Default",
        type: "Income",
        amount: chargeAmount,
        description: c.description || `Stripe payment from ${c.billing_details?.name || c.billing_details?.email || 'Customer'}`,
        category: (c.description && c.description.toLowerCase().includes('sub')) ? 'Monthly Recurring Revenue' : 'One-Time Payment',
        client_name: c.billing_details?.name || null,
        created_at: new Date(c.created * 1000).toISOString()
      });

      // Mapped Fee Expense transaction
      transactions.push({
        id: `stripe_fee_${c.id}`,
        user_id: userId || "local",
        business_stage: businessStage || "Default",
        type: "Expense",
        amount: parseFloat(feeAmount.toFixed(2)),
        description: `Stripe processing fee for charge ${c.id}`,
        category: "Merchant Fees",
        client_name: null,
        created_at: new Date(c.created * 1000).toISOString()
      });
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactions })
    };

  } catch (error) {
    console.error("Stripe sync error:", error);
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error.message}`
    };
  }
};
