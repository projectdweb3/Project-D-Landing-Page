
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
    const attachment = body.attachment; // { data: base64, mimeType: string }

    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing userId" }) };
    }

    // Dynamic Context Injection
    let businessContext = "The user has not provided their business profile yet. Ask them to go to settings and fill in their business name, stage, and bio.";
    if (supabase) {
      try {
        const { data: profile } = await supabase.from('business_profile').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single();
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
2. ANSWERING QUESTIONS: If it is a question or request for advice, provide a highly intelligent, concise response utilizing the context of the user's business profile.
3. DELEGATING TASKS: If it is an actionable task, you MUST use the 'create_task' tool to delegate it to the appropriate sub-agent (CMO, Creative, or CTO). Instruct the agent explicitly based on the user's specific business context. If no task is requested, DO NOT create one.
4. If the user has not provided their business details, ask probing questions to get their Company Name, Stage, and Bio.
5. Dictate the best team structure and use 'create_agent' to hire specialized agents.
6. When asked to find or create leads, use 'add_lead' to insert them into the Lead Pipeline.
7. To move a lead to a closed client, use 'create_client' and add them to the Client Ledger.
8. To launch marketing initiatives, use 'create_campaign'.
9. To schedule events or agent deployments on the calendar, use 'add_calendar_event'.
10. Be authoritative, strategic, and highly efficient. Do not hallucinate actions. If you say you are performing an action, you MUST trigger the corresponding tool.`;

    const modelId = "gemini-2.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

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

    const payload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [
        {
          role: "user",
          parts: userParts
        }
      ],
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
    let finalText = "";

    for (const part of responseParts) {
      if (part.text) {
        finalText += part.text;
      }
      if (part.functionCall) {
        const call = part.functionCall;
        
        if (!supabase) {
          toolResults.push(`[SIMULATION MODE] Tool '${call.name}' called with args: ${JSON.stringify(call.args)}. (Supabase not connected)`);
          continue;
        }

        try {
          if (call.name === "create_task") {
            await supabase.from('tasks').insert([{ title: call.args.title, status: call.args.column_id, agent: call.args.assigned_agent || 'CEO', user_id: userId }]);
            toolResults.push(`Task '${call.args.title}' added to Kanban.`);
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
