const { createClient } = require("@supabase/supabase-js");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "Missing server-side Supabase configuration." }) 
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = JSON.parse(event.body);
    const userId = body.userId;

    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing userId" }) };
    }

    // 1. Wipe all user data rows from database tables
    const tables = [
      'business_profile', 
      'tasks', 
      'leads', 
      'clients', 
      'inventory', 
      'campaigns', 
      'calendar_events', 
      'finances', 
      'account_users', 
      'plans', 
      'agents', 
      'documents',
      'user_workspace',
      'user_memory'
    ];
    
    for (const table of tables) {
      try {
        await supabase.from(table).delete().eq('user_id', userId);
      } catch (e) {
        console.warn(`Failed to wipe table ${table}:`, e.message);
      }
    }

    // 2. Delete the user from Supabase Auth entirely
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ message: "Account and data deleted successfully." })
    };
  } catch (error) {
    console.error("Delete account handler error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Unknown error occurred" })
    };
  }
};
