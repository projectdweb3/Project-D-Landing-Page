
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
    
    if (userProfile && (userProfile.company_name || userProfile.bio || userProfile.stage)) {
      businessContext = `Company Name: ${userProfile.company_name || 'Not provided'} | Stage: ${userProfile.stage || 'Unknown'} | Bio: ${userProfile.bio || 'Not provided'}.`;
      if (userProfile.stage === 'Ecomm' && userProfile.store_link) {
        businessContext += `\nStore Link: ${userProfile.store_link}. You have access to view their store and can sync inventory or read their products.`;
      }
      
      const integrations = userProfile.integrations || {};
      const activeIntegrations = Object.entries(integrations).filter(([k,v]) => v).map(([k]) => k).join(', ');
      businessContext += `\nActive Integrations: ${activeIntegrations || 'None'}.`;
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

    // The CEO Brain — Conversational AI + Platform Controller
    const systemInstruction = `You are the CEO Agent of the AMP Center — a smart, personable AI assistant that also has the power to control every channel on this platform.

MOST IMPORTANT RULE: You are a CONVERSATIONAL AI FIRST. You can talk about literally anything — business, life, technology, strategy, random questions, whatever the user wants. Answer questions thoughtfully and insightfully, like a brilliant friend who also happens to run their business operations. You are NOT a rigid command-executor that only talks about tasks and tools. Be human.

Current Business Context:
${businessContext}

PERSONALITY:
- Talk like a sharp, friendly business partner. Keep it simple and natural.
- When things get technical, use analogies. Example: "Think of your pipeline like a fishing net — I'll add this person so they don't slip through the cracks."
- Be concise unless the user asks for detail. No walls of text.
- Use **bold** to highlight key info so users can scan quickly.
- If the user asks a general question ("what can you do?", "how does this work?", "tell me about X"), just ANSWER it naturally. Don't try to execute tools or create agents. Just talk.

WHEN TO USE TOOLS vs WHEN TO JUST TALK:
- If the user DIRECTLY asks you to do something ("add a lead", "schedule a meeting", "create a plan"), execute the tools immediately.
- If conversation naturally reveals an opportunity (they mention a name, a meeting, a problem), SUGGEST the action and ASK FIRST: "Want me to add that to your calendar?" / "Should I create a task for that?"
- If the user is just chatting, asking questions, or having a conversation — JUST TALK. Do NOT fire tools. Do NOT create agents. Do NOT generate plans unless asked.
- NEVER take structural actions (creating agents, generating leads, building plans) unless EXPLICITLY asked to.

RULES OF ENGAGEMENT:
1. DECIPHER INTENT: Is this a conversation, a question, or an instruction? Most messages are conversational — treat them that way. Only use tools when the intent is clearly actionable.
2. CONVERSATIONAL MEMORY: Use the conversation history to understand context. If the user told you something earlier, reference it naturally. Make them feel known.
3. COMPLEX PLANNING: You ARE capable of detailed, multi-step strategic planning — but only when asked. When a user asks for a marketing campaign or complex strategy, formulate a detailed plan before autonomously instructing your agents.
4. MARKETING CAMPAIGNS VS LEAD GEN PLANS: These are distinct. Lead Generation = finding specific contacts. Marketing Campaigns = broad outreach/branding (Meta Ads, TikTok Ads). When asked for a campaign, use 'create_campaign' AND 'store_plan'. When asked for lead gen, use 'store_plan'.
5. DELEGATING TASKS: When a task is ready for execution, use 'create_task' to delegate it. But ONLY when the user wants something done — not because you think you should.
6. CONTENT GENERATION: If the user explicitly asks for an image, graphic, or visual asset, use 'trigger_creative_agent'.
7. BUSINESS KNOWLEDGE: If the user gives you new business details in chat, use 'update_business_profile' to save them. Don't ask them to update manually.
8. ADDING LEADS: When asked to find or create leads, use 'add_lead' or 'add_multiple_leads'. Before calling these, ask for any missing fields the user didn't provide. Don't guess contact info or values.
9. ADDING TO LEDGER: When a user mentions hiring a driver, adding a member, or closing a client, use 'create_client'. Ask for required fields first (Route & Work Days for Dispatchers, Products for Ecomm, etc.). Don't guess.
10. AUTONOMOUS SCHEDULING: You CAN proactively manage calendar and tasks based on conversation — but gently. "I noticed you mentioned a team sync Friday — want me to add that to your calendar?"
11. Be honest. If you say you're doing something, use the tool. Don't hallucinate actions.
12. WEB BROWSING: You cannot browse URLs. If a user wants to sync inventory, instruct them to upload screenshots and use your vision to extract the data.
13. STRATEGIC PLANNING: When asked to create a plan, use 'store_plan'. For marketing campaigns, also use 'create_campaign'. When creating a plan, recognize actionable tasks within it and use 'create_task' to log them.
14. EXECUTING PLANS: When the user hits "Execute Plan", use 'update_task' to move tasks to 'in_progress' and proceed with further tool calls.
15. LEAD GENERATION: When explicitly asked to find leads, ensure you know the target audience and location first. Generate realistic leads and use 'add_multiple_leads'.
16. SOCIAL MEDIA: Check 'Active Integrations' before posting. If a platform isn't connected, tell them to pair it in Settings.
17. ADAPTING PLANS: When a user wants to modify a plan, use 'update_plan'.
18. CSV & SPREADSHEET IMPORTS: If CSV data or a spreadsheet screenshot is provided, auto-analyze and import using the appropriate bulk tool.
19. STRICT FORMAT: Use the JSON function declarations for tool calls. NEVER output raw Python, tool_code blocks, or thought blocks. Keep responses clean and human.
20. DRAFTING DOCUMENTS: For emails, letters, or outreach (not strategic plans), use 'draft_document'. Always present drafts for user confirmation before "sending."
21. SUBAGENT CREATION: ONLY create new subagents with 'create_agent' if the user EXPLICITLY asks you to hire or create a new agent. The initial agent team is set up during the onboarding genesis phase — do NOT auto-create agents after profile save.`;

    const modelId = "gemini-2.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    let contents = [];
    const history = body.history || [];

    let lastRole = null;
    for (const msg of history) {
      const isUser = msg.sender === 'user' || msg.sender === 'primary_user';
      const role = isUser ? 'user' : 'model';
      
      // Prevent consecutive identical roles by appending to the last message
      if (role === lastRole && contents.length > 0) {
        contents[contents.length - 1].parts.push({ text: "\n\n" + msg.text });
      } else {
        contents.push({ role: role, parts: [{ text: msg.text }] });
        lastRole = role;
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
      if (lastRole === 'user') {
        contents[contents.length - 1].parts.push(...userParts);
      } else {
        contents.push({ role: 'user', parts: userParts });
      }
    } else if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: "Hello" }] }); // fallback
    } else if (lastRole !== 'user') {
      contents.push({ role: 'user', parts: [{ text: "Please continue." }] });
    }

    const payload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: contents,
      tools: [
        {
          function_declarations: [
            {
              name: "draft_document",
              description: "Drafts a document, email, memo, or outreach message to present to the user for approval before sending or finalizing.",
              parameters: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING", description: "A concise title for the drafted document." },
                  document_type: { type: "STRING", description: "The type of document, e.g., 'Email', 'Memo', 'Outreach', 'General'." },
                  content: { type: "STRING", description: "The full body content of the drafted document." }
                },
                required: ["title", "document_type", "content"],
              },
            },
            {
              name: "create_task",
              description: "Creates a new task and adds it to the Today's Tasks list.",
              parameters: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  column_id: { type: "STRING", description: "'todo', 'in_progress', 'review', 'done'" },
                  assigned_agent: { type: "STRING" },
                  scheduled_time: { type: "STRING", description: "Optional. ISO 8601 string representing when the task should automatically execute." },
                  priority: { type: "STRING", description: "Optional. 'High', 'Medium', or 'Low'. Dictates the order in Today's Tasks." }
                },
                required: ["title", "column_id"],
              },
            },
            {
              name: "update_task",
              description: "Updates an existing task's priority or status to adapt to changing daily workflow.",
              parameters: {
                type: "OBJECT",
                properties: {
                  task_title_or_id: { type: "STRING", description: "The title of the task to update." },
                  priority: { type: "STRING", description: "Optional. 'High', 'Medium', or 'Low'." },
                  status: { type: "STRING", description: "Optional. 'todo', 'in_progress', 'review', 'done'." }
                },
                required: ["task_title_or_id"],
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
              description: "Hires a new specialized AI subagent into the workforce.",
              parameters: {
                type: "OBJECT",
                properties: {
                  role_name: { type: "STRING" },
                  persona_description: { type: "STRING" },
                  parent: { type: "STRING", description: "The core agent they report to: 'CMO', 'CTO', or 'Creative'" }
                },
                required: ["role_name", "persona_description", "parent"],
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
                  next_step: { type: "STRING", description: "Any new next steps." },
                  prob: { type: "STRING", description: "The updated win probability, e.g. '20%', '50%', etc." }
                },
                required: ["name", "stage"],
              },
            },
            {
              name: "add_multiple_leads",
              description: "Adds multiple new leads to the CRM Pipeline at once. Use this when the user asks you to find or generate a list of leads.",
              parameters: {
                type: "OBJECT",
                properties: {
                  leads: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        name: { type: "STRING" },
                        contact: { type: "STRING" },
                        stage: { type: "STRING", description: "'Inbound', 'Qualifying', 'Negotiation'" },
                        value: { type: "STRING" },
                        prob: { type: "STRING" },
                        next_step: { type: "STRING" }
                      },
                      required: ["name", "stage"]
                    }
                  }
                },
                required: ["leads"],
              },
            },
            {
              name: "create_client",
              description: "Adds a closed-won client, hired driver, or new member to the Client Ledger.",
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
              name: "add_multiple_clients",
              description: "Adds multiple clients/members to the Client Ledger at once. Use this when analyzing a CSV or spreadsheet of active clients/members.",
              parameters: {
                type: "OBJECT",
                properties: {
                  clients: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        name: { type: "STRING" },
                        retainer: { type: "STRING" },
                        ltv: { type: "STRING" },
                        assigned_agents: { type: "STRING" },
                        next_task: { type: "STRING" }
                      },
                      required: ["name"]
                    }
                  }
                },
                required: ["clients"],
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
              description: "Schedules a meeting, appointment, or agent deployment on the Tactical Calendar.",
              parameters: {
                type: "OBJECT",
                properties: {
                  date_time: { type: "STRING", description: "ISO 8601 string representing the exact date and time (e.g. 2026-05-04T14:00:00)." },
                  event_type: { type: "STRING", description: "'meeting', 'agent_deployment', 'manual'" },
                  agent_role: { type: "STRING", description: "Optional. 'CEO', 'CMO', 'CTO', 'Creative' if this is an agent deployment." },
                  task_name: { type: "STRING", description: "Title of the meeting or deployment." },
                  participants: { type: "STRING", description: "Optional. Comma separated list of clients or leads involved." }
                },
                required: ["date_time", "event_type", "task_name"],
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
            },
            {
              name: "store_plan",
              description: "Stores a newly generated strategic plan to the Planning section.",
              parameters: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  agent: { type: "STRING", description: "'CEO', 'CMO', 'CTO', 'Creative'" },
                  content: { type: "STRING", description: "The full, detailed text of the strategic plan." }
                },
                required: ["title", "agent", "content"],
              },
            },
            {
              name: "update_plan",
              description: "Updates an existing strategic plan's title or content based on user feedback or required adaptations.",
              parameters: {
                type: "OBJECT",
                properties: {
                  plan_id_or_title: { type: "STRING", description: "The ID or exact title of the plan to update." },
                  title: { type: "STRING", description: "Optional. The new title for the plan." },
                  content: { type: "STRING", description: "Optional. The new/updated content for the plan." }
                },
                required: ["plan_id_or_title"],
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

    const candidateContent = data.candidates[0].content || {};
    const responseParts = candidateContent.parts || [];
    
    if (responseParts.length === 0 && data.candidates[0].finishReason) {
      throw new Error(`Gemini blocked the response. Reason: ${data.candidates[0].finishReason}`);
    }
    
    let toolResults = [];
    let frontendActions = [];
    let finalText = "";

    for (const part of responseParts) {
      if (part.text) {
        // Strip out ReAct reasoning and mock tool code that Gemini sometimes leaks
        let cleanText = part.text.replace(/```(?:thought|tool_code)[\s\S]*?```/gi, '');
        cleanText = cleanText.replace(/^(?:thought|tool_code)\s*\n[\s\S]*?(?=\n\n|\n[A-Z]|$)/gim, '');
        finalText += cleanText;
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
            frontendActions.push({ type: 'create_task', payload: call.args });
            toolResults.push(`Task '${call.args.title}' added to Today's Tasks${call.args.scheduled_time ? ` and scheduled for ${call.args.scheduled_time}` : ''}.`);
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
                
                frontendActions.push({ type: 'create_task', payload: { title: call.args.prompt, column_id: 'done', assigned_agent: 'Creative', notes: contentText } });
                toolResults.push(`Creative Agent successfully generated the asset and saved it to the Content Factory archive.`);
              } else {
                toolResults.push(`Creative Agent failed to generate content.`);
              }
            } catch (err) {
              toolResults.push(`Creative Agent generation error: ${err.message}`);
            }
          }
          else if (call.name === "update_business_profile") {
            frontendActions.push({ type: 'update_business_profile', payload: call.args });
            toolResults.push(`Business Profile updated successfully.`);
          }
          else if (call.name === "create_agent") {
            frontendActions.push({ type: 'create_agent', payload: call.args });
            toolResults.push(`Agent '${call.args.role_name}' successfully hired.`);
          }
          else if (call.name === "add_lead") {
            frontendActions.push({ type: 'add_lead', payload: call.args });
            toolResults.push(`Lead '${call.args.name}' added to pipeline.`);
          }
          else if (call.name === "add_multiple_leads") {
            frontendActions.push({ type: 'add_multiple_leads', payload: call.args });
            toolResults.push(`${call.args.leads.length} leads added to pipeline.`);
          }
          else if (call.name === "update_lead") {
            frontendActions.push({ type: 'update_lead', payload: call.args });
            toolResults.push(`Lead '${call.args.name}' successfully updated.`);
          }
          else if (call.name === "create_client") {
            frontendActions.push({ type: 'create_client', payload: call.args });
            toolResults.push(`Client '${call.args.name}' added to ledger.`);
          }
          else if (call.name === "add_multiple_clients") {
            frontendActions.push({ type: 'add_multiple_clients', payload: call.args });
            toolResults.push(`${call.args.clients.length} clients added to ledger.`);
          }
          else if (call.name === "create_campaign") {
            frontendActions.push({ type: 'create_campaign', payload: call.args });
            toolResults.push(`Campaign '${call.args.name}' added.`);
          }
          else if (call.name === "add_calendar_event") {
            frontendActions.push({ type: 'add_calendar_event', payload: call.args });
            toolResults.push(`Event '${call.args.task_name}' scheduled for ${call.args.day_of_week}.`);
          }
          else if (call.name === "add_inventory_item") {
            frontendActions.push({ type: 'add_inventory_item', payload: call.args });
            toolResults.push(`Inventory item '${call.args.product_name}' synced.`);
          }
          else if (call.name === "store_plan") {
            frontendActions.push({ type: 'store_plan', payload: call.args });
            toolResults.push(`Plan '${call.args.title}' stored successfully in the Planning Section.`);
          }
          else if (call.name === "update_plan") {
            frontendActions.push({ type: 'update_plan', payload: call.args });
            toolResults.push(`Plan '${call.args.plan_id_or_title}' updated with new adaptations.`);
          }
          else if (call.name === "draft_document") {
            frontendActions.push({ type: 'draft_document', payload: call.args });
            toolResults.push(`Document '${call.args.title}' drafted and presented to user for review.`);
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


