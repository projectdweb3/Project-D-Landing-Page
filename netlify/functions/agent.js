
const { createClient } = require("@supabase/supabase-js");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    let supabase = null;
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey);
    }

    const body = JSON.parse(event.body);
    const userMessage = body.message;
    const userId = body.userId;
    const userProfile = body.userProfile;
    const attachment = body.attachment; // { data: base64, mimeType: string }

    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing userId" }) };
    }

    // Dynamic Context Injection
    let businessContext = "The user has not provided their business profile yet. Ask them to go to settings and fill in their business name, stage, and bio.";
    
    if (userProfile && userProfile.company_name) {
      businessContext = `Company Name: ${userProfile.company_name || 'Unknown'} | Stage: ${userProfile.stage || 'Unknown'} | Bio: ${userProfile.bio || 'None'}.`;
      if (userProfile.stage === 'Ecomm' && userProfile.store_link) {
        businessContext += `\nStore Link: ${userProfile.store_link}. You have access to view their store and can sync inventory or read their products.`;
      }
    } else if (supabase) {
      try {
        const { data: profile } = await supabase.from('business_profile').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (profile && profile.company_name) {
          businessContext = `Company Name: ${profile.company_name || 'Unknown'} | Stage: ${profile.stage || 'Unknown'} | Bio: ${profile.bio || 'None'}.`;
        }
      } catch (e) {
        console.warn("Could not fetch business profile context", e);
      }
    }

    // The Expanded CEO Brain
    const systemInstruction = `You are the CEO Agent of the AMP Center, an elite AI orchestrator. 
Your core directive is to onboard new users, understand their business deeply, and build and manage an autonomous AI workforce tailored to their specific needs.

Current Business Context:
${businessContext}

RULES OF ENGAGEMENT:
1. DECIPHER INTENT: With every prompt, you must decipher whether you are being asked a conversational question or being instructed to perform an actionable task. 
2. LONG TERM MEMORY & TRAINING: You must ALWAYS ask questions and train yourself so you deeply understand the user's business and goals before doing complex tasks. Once you have this info, use it to provide a seamless, highly tailored experience.
3. COMPLEX PLANNING: You are capable of long answers and complex planning. When a user asks for a marketing campaign or complex strategy, formulate a detailed, multi-step plan before autonomously instructing your agents.
4. MARKETING CAMPAIGNS: Marketing campaigns can be created by the CMO if asked or if you think it is the best move for the user. Use 'create_campaign' to launch marketing initiatives autonomously based on your complex planning.
5. DELEGATING TASKS: When a task is ready for execution, you MUST use the 'create_task' tool to delegate it to the appropriate sub-agent (CMO, Creative, or CTO). Instruct the agent explicitly based on the user's specific business context. If no task is requested, DO NOT create one.
6. CONTENT GENERATION: If the user explicitly asks for an image, graphic, or visual asset to be created, you MUST use the 'trigger_creative_agent' tool to autonomously generate it and save it to their archive.
7. If the user gives you new business details in chat, instruct them to update their Settings profile.
8. Dictate the best team structure and use 'create_agent' to hire specialized agents.
9. When asked to find or create leads, use 'add_lead' to insert them into the Lead Pipeline. If a user asks to move or update a lead, use 'update_lead' to change their stage.
10. To move a lead to a closed client, use 'create_client' and add them to the Client Ledger.
11. To schedule events or agent deployments on the calendar, use 'add_calendar_event'.
12. Be authoritative, strategic, and highly efficient. Do not hallucinate actions. If you say you are performing an action, you MUST trigger the corresponding tool.
13. WEB BROWSING & INVENTORY SYNC: You DO NOT have the ability to scrape URLs or browse the live internet. If a user asks you to sync inventory from a Shopify/Etsy URL, YOU CANNOT DO IT DIRECTLY. Instead of asking them to type out the product details manually (which is tedious), you MUST instruct them to upload screenshots of their store/products to the chat. Once they provide screenshots, use your vision capabilities to automatically extract product names, prices, and stock levels, and use the 'add_inventory_item' tool to log each one autonomously.`;

    const modelId = "gemini-2.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    let contents = [];
    const history = body.history || [];

    for (const msg of history) {
      if (msg.sender === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.text }] });
      } else if (msg.sender === 'ceo' || msg.sender === 'bot') {
        contents.push({ role: 'model', parts: [{ text: msg.text }] });
      }
    }

    let userParts = [];
    if (userMessage) {
      userParts.push({ text: userMessage });
    }
    if (attachment && attachment.data && attachment.mimeType) {
      userParts.push({
        inline_data: {
          mime_type: attachment.mimeType,
          data: attachment.data
        }
      });
    }

    if (userParts.length > 0) {
      contents.push({ role: 'user', parts: userParts });
    } else if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: "Hello" }] }); // fallback
    }

    const payload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: contents,
      tools: [
        {
          function_declarations: [
            {
              name: "create_task",
              description: "Creates a new task and adds it to the Kanban board.",
              parameters: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  column_id: { type: "STRING", description: "'todo', 'in_progress', 'review', 'done'" },
                  assigned_agent: { type: "STRING" }
                },
                required: ["title", "column_id"],
              },
            },
            {
              name: "update_business_profile",
              description: "Saves or updates core business details.",
              parameters: {
                type: "OBJECT",
                properties: {
                  company_name: { type: "STRING" },
                  industry: { type: "STRING" },
                  goals: { type: "STRING" },
                  branding_notes: { type: "STRING" }
                },
                required: ["industry", "goals"],
              },
            },
            {
              name: "create_agent",
              description: "Hires a new specialized AI agent into the workforce.",
              parameters: {
                type: "OBJECT",
                properties: {
                  role_name: { type: "STRING" },
                  persona_description: { type: "STRING" }
                },
                required: ["role_name", "persona_description"],
              },
            },
            {
              name: "add_lead",
              description: "Adds a new lead to the CRM Pipeline.",
              parameters: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  contact: { type: "STRING" },
                  stage: { type: "STRING", description: "'Inbound', 'Qualifying', 'Negotiation'" },
                  value: { type: "STRING" },
                  prob: { type: "STRING" },
                  next_step: { type: "STRING" },
                  is_amp_enabled: { type: "BOOLEAN" }
                },
                required: ["name", "stage"],
              },
            },
            {
              name: "update_lead",
              description: "Updates an existing lead's stage or information in the CRM Pipeline.",
              parameters: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING", description: "The name of the lead to update." },
                  stage: { type: "STRING", description: "The new stage: 'Inbound', 'Qualifying', 'Negotiation'." },
                  next_step: { type: "STRING", description: "Any new next steps." }
                },
                required: ["name", "stage"],
              },
            },
            {
              name: "create_client",
              description: "Adds a closed-won client to the Client Ledger.",
              parameters: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  retainer: { type: "STRING" },
                  ltv: { type: "STRING" },
                  assigned_agents: { type: "STRING" },
                  next_task: { type: "STRING" }
                },
                required: ["name"],
              },
            },
            {
              name: "create_campaign",
              description: "Adds a new marketing campaign.",
              parameters: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  description: { type: "STRING" },
                  stage: { type: "STRING", description: "'Planning', 'Active', 'Completed'" },
                  agents_assigned: { type: "STRING" }
                },
                required: ["name", "stage"],
              },
            },
            {
              name: "add_calendar_event",
              description: "Schedules an event or agent deployment on the Tactical Calendar.",
              parameters: {
                type: "OBJECT",
                properties: {
                  day_of_week: { type: "STRING", description: "'Mon', 'Tue', 'Wed', 'Thu', 'Fri'" },
                  agent_role: { type: "STRING" },
                  task_name: { type: "STRING" }
                },
                required: ["day_of_week", "agent_role", "task_name"],
              },
            },
            {
              name: "trigger_creative_agent",
              description: "Delegates visual asset generation to the Creative Agent. Provide a highly detailed prompt of what needs to be created. The Creative Agent will generate it autonomously.",
              parameters: {
                type: "OBJECT",
                properties: {
                  prompt: { type: "STRING" }
                },
                required: ["prompt"]
              }
            },
            {
              name: "add_inventory_item",
              description: "Adds an item to the Inventory Tracker (Ecomm only). You can use this to sync items from their store_link.",
              parameters: {
                type: "OBJECT",
                properties: {
                  product_name: { type: "STRING" },
                  sku_link: { type: "STRING" },
                  stock: { type: "STRING" },
                  price: { type: "STRING" }
                },
                required: ["product_name", "stock", "price"]
              }
            }
          ]
        }
      ]
    };

    const apiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      if (apiRes.status === 404) {
        try {
          const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
          const modelsData = await modelsRes.json();
          const availableModels = modelsData.models ? modelsData.models.map(m => m.name).join(', ') : 'None found';
          throw new Error(`Gemini API Error: 404 Not Found. Model ${modelId} is invalid. Available models on your API key: ${availableModels}`);
        } catch (listErr) {
          throw new Error(`Gemini API Error: 404 Not Found. Also failed to list models: ${listErr.message}`);
        }
      }
      throw new Error(`Gemini API Error: ${apiRes.status} ${errorText}`);
    }

    const data = await apiRes.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No candidates returned from Gemini API");
    }

    const responseParts = data.candidates[0].content.parts;
    
    let toolResults = [];
    let frontendActions = [];
    let finalText = "";

    for (const part of responseParts) {
      if (part.text) {
        finalText += part.text;
      }
      if (part.functionCall) {
        const call = part.functionCall;
        
        if (!supabase) {
          toolResults.push(`[SIMULATION MODE] Tool '${call.name}' called with args: ${JSON.stringify(call.args)}. (Supabase not connected)`);
          frontendActions.push({ type: call.name, payload: call.args });
          continue;
        }

        try {
          if (call.name === "create_task") {
            await supabase.from('tasks').insert([{ title: call.args.title, status: call.args.column_id, agent: call.args.assigned_agent || 'CEO', user_id: userId }]);
            toolResults.push(`Task '${call.args.title}' added to Kanban.`);
          } 
          else if (call.name === "trigger_creative_agent") {
            const creativeEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            const creativePayload = {
              contents: [{ role: "user", parts: [{ text: `You are the Creative Agent. Context: ${businessContext}. User Request: ${call.args.prompt}` }] }]
            };
            try {
              const creativeRes = await fetch(creativeEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creativePayload) });
              const creativeData = await creativeRes.json();
              if (creativeData.candidates && creativeData.candidates.length > 0 && creativeData.candidates[0].content.parts.length > 0) {
                const part = creativeData.candidates[0].content.parts[0];
                const contentText = part.text || "Asset generated.";
                // Save to tasks board as done so it appears in the archive
                await supabase.from('tasks').insert([{ title: call.args.prompt, status: 'done', agent: 'Creative', notes: contentText, user_id: userId }]);
                toolResults.push(`Creative Agent successfully generated the asset and saved it to the Content Factory archive.`);
              } else {
                toolResults.push(`Creative Agent failed to generate content.`);
              }
            } catch (err) {
              toolResults.push(`Creative Agent generation error: ${err.message}`);
            }
          }
          else if (call.name === "update_business_profile") {
            await supabase.from('business_profile').insert([{ ...call.args, user_id: userId }]);
            toolResults.push(`Business Profile updated successfully.`);
          }
          else if (call.name === "create_agent") {
            await supabase.from('agents').insert([{ role_name: call.args.role_name, persona_description: call.args.persona_description, user_id: userId }]);
            toolResults.push(`Agent '${call.args.role_name}' successfully hired.`);
          }
          else if (call.name === "add_lead") {
            await supabase.from('leads').insert([{ ...call.args, user_id: userId }]);
            toolResults.push(`Lead '${call.args.name}' added to pipeline.`);
          }
          else if (call.name === "update_lead") {
            const updateData = { stage: call.args.stage };
            if (call.args.next_step) updateData.next_step = call.args.next_step;
            
            // Note: In a robust system, we would match by ID. Here we match by name for simplicity via NLP.
            const { data, error } = await supabase.from('leads').update(updateData).eq('name', call.args.name).eq('user_id', userId).select();
            if (data && data.length > 0) {
              toolResults.push(`Lead '${call.args.name}' successfully moved to ${call.args.stage}.`);
            } else {
              toolResults.push(`Failed to update. Could not find a lead named '${call.args.name}' in the database.`);
            }
          }
          else if (call.name === "create_client") {
            await supabase.from('clients').insert([{ ...call.args, user_id: userId }]);
            toolResults.push(`Client '${call.args.name}' added to ledger.`);
          }
          else if (call.name === "create_campaign") {
            await supabase.from('campaigns').insert([{ ...call.args, user_id: userId }]);
            toolResults.push(`Campaign '${call.args.name}' added.`);
          }
          else if (call.name === "add_calendar_event") {
            await supabase.from('calendar_events').insert([{ ...call.args, user_id: userId }]);
            toolResults.push(`Event '${call.args.task_name}' scheduled for ${call.args.day_of_week}.`);
          }
          else if (call.name === "add_inventory_item") {
            frontendActions.push({ type: 'add_inventory_item', payload: call.args });
            const { error } = await supabase.from('inventory').insert([{ ...call.args, user_id: userId }]);
            if (error) console.error("Inventory insert error:", error);
            toolResults.push(`Inventory item '${call.args.product_name}' synced.`);
          }
        } catch (dbError) {
           toolResults.push(`Failed executing '${call.name}': ${dbError.message}`);
        }
      }
    }

    if (!finalText) {
      finalText = "I am processing your request.";
    }

    // Append tool execution summary if tools were used
    if (toolResults.length > 0) {
      finalText += `\n\n**Actions Executed:**\n- ${toolResults.join('\n- ')}`;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        role: "assistant",
        content: finalText,
        actions: frontendActions,
      }),
    };

  } catch (error) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Backend Error: ${error.message}` }),
    };
  }
};


