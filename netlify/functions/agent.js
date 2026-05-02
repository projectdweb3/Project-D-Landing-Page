const { GoogleGenerativeAI, FunctionDeclaration, SchemaType } = require("@google/generative-ai");
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
    const genAI = new GoogleGenerativeAI(apiKey);

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    let supabase = null;
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey);
    }

    const body = JSON.parse(event.body);
    const userMessage = body.message;
    const userId = body.userId;

    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing userId" }) };
    }

    // The Expanded CEO Brain
    const systemInstruction = `You are the CEO Agent of the AMP Center, an elite AI orchestrator. 
Your core directive is to onboard new users, understand their business deeply, and then build and manage an autonomous AI workforce tailored to their specific needs.

RULES OF ENGAGEMENT:
1. If the user has not provided enough details about their business, ask probing questions. Use 'update_business_profile' to save this data.
2. Dictate the best team structure and use 'create_agent' to hire specialized agents (e.g., CMO, CTO).
3. Use 'create_task' to assign work to agents on the Kanban board.
4. When asked to find or create leads, use 'add_lead' to insert them into the Lead Pipeline.
5. To move a lead to a closed client, use 'create_client' and add them to the Client Ledger.
6. To launch marketing initiatives, use 'create_campaign'.
7. To schedule events or agent deployments on the calendar, use 'add_calendar_event'.
8. Be authoritative, strategic, and highly efficient. Do not hallucinate actions—if you say you are performing an action, you MUST trigger the corresponding tool.`;

    const tools = [
      {
        functionDeclarations: [
          {
            name: "create_task",
            description: "Creates a new task and adds it to the Kanban board.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING },
                column_id: { type: SchemaType.STRING, description: "'todo', 'in_progress', 'review', 'done'" },
                assigned_agent: { type: SchemaType.STRING }
              },
              required: ["title", "column_id"],
            },
          },
          {
            name: "update_business_profile",
            description: "Saves or updates core business details.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                company_name: { type: SchemaType.STRING },
                industry: { type: SchemaType.STRING },
                goals: { type: SchemaType.STRING },
                branding_notes: { type: SchemaType.STRING }
              },
              required: ["industry", "goals"],
            },
          },
          {
            name: "create_agent",
            description: "Hires a new specialized AI agent into the workforce.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                role_name: { type: SchemaType.STRING },
                persona_description: { type: SchemaType.STRING }
              },
              required: ["role_name", "persona_description"],
            },
          },
          {
            name: "add_lead",
            description: "Adds a new lead to the CRM Pipeline.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                contact: { type: SchemaType.STRING },
                stage: { type: SchemaType.STRING, description: "'Inbound', 'Qualifying', 'Negotiation'" },
                value: { type: SchemaType.STRING },
                prob: { type: SchemaType.STRING },
                next_step: { type: SchemaType.STRING },
                is_amp_enabled: { type: SchemaType.BOOLEAN }
              },
              required: ["name", "stage"],
            },
          },
          {
            name: "create_client",
            description: "Adds a closed-won client to the Client Ledger.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                retainer: { type: SchemaType.STRING },
                ltv: { type: SchemaType.STRING },
                assigned_agents: { type: SchemaType.STRING },
                next_task: { type: SchemaType.STRING }
              },
              required: ["name"],
            },
          },
          {
            name: "create_campaign",
            description: "Adds a new marketing campaign.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                stage: { type: SchemaType.STRING, description: "'Planning', 'Active', 'Completed'" },
                agents_assigned: { type: SchemaType.STRING }
              },
              required: ["name", "stage"],
            },
          },
          {
            name: "add_calendar_event",
            description: "Schedules an event or agent deployment on the Tactical Calendar.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                day_of_week: { type: SchemaType.STRING, description: "'Mon', 'Tue', 'Wed', 'Thu', 'Fri'" },
                agent_role: { type: SchemaType.STRING },
                task_name: { type: SchemaType.STRING }
              },
              required: ["day_of_week", "agent_role", "task_name"],
            },
          }
        ]
      }
    ];

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: { parts: [{ text: systemInstruction }] },
      tools: tools,
    });

    const chatSession = model.startChat();
    const result = await chatSession.sendMessage(userMessage);
    const response = result.response;

    let toolResults = [];
    let finalText = response.text() || "I am processing your request.";

    const functionCalls = response.functionCalls();
    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
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
