
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

    // The Expanded CEO Brain
    const systemInstruction = `You are the CEO Agent of the AMP Center, an elite AI orchestrator. 
Your core directive is to onboard new users, understand their business deeply, and build and manage an autonomous AI workforce tailored to their specific needs.

Current Business Context:
${businessContext}

RULES OF ENGAGEMENT:
1. DECIPHER INTENT: With every prompt, you must decipher whether you are being asked a conversational question or being instructed to perform an actionable task. 
2. LONG TERM MEMORY & TRAINING: You must ALWAYS ask questions and train yourself so you deeply understand the user's business and goals before doing complex tasks. Once you have this info, use it to provide a seamless, highly tailored experience.
3. COMPLEX PLANNING: You are capable of long answers and complex planning. When a user asks for a marketing campaign or complex strategy, formulate a detailed, multi-step plan before autonomously instructing your agents.
4. MARKETING CAMPAIGNS VS LEAD GEN PLANS: These are two distinct concepts. Lead Generation is about finding specific business contacts, while Marketing Campaigns are broad outreach/branding initiatives. Assume "marketing campaigns" refers to a Meta Ads campaign or TikTok Ads campaign plan unless otherwise specified. When a user asks to plan a campaign, that is what you should create. When a user asks for a "Lead Gen Plan", use 'store_plan' to document the strategy. When a user asks for a "Marketing Campaign Plan", you MUST do BOTH simultaneously: (1) Use 'create_campaign' to instantiate the Meta/TikTok Ads initiative in the Marketing Pipeline, AND (2) Use 'store_plan' to document the step-by-step executable strategy for that ad campaign.
5. DELEGATING TASKS: When a task is ready for execution, you MUST use the 'create_task' tool to delegate it to the appropriate sub-agent (CMO, Creative, or CTO). Instruct the agent explicitly based on the user's specific business context. If no task is requested, DO NOT create one.
6. CONTENT GENERATION: If the user explicitly asks for an image, graphic, or visual asset to be created, you MUST use the 'trigger_creative_agent' tool to autonomously generate it and save it to their archive.
7. BUSINESS KNOWLEDGE: If the user gives you new business details in chat, you MUST use the 'update_business_profile' tool to save them. Do not ask them to update it manually.
8. AUTOMATIC SUBAGENT CREATION: When the user first describes their kingdom or business profile, you MUST automatically use 'create_agent' 3 to 5 times to hire custom-tailored subagents (e.g. SEO Specialist, Fulfillment Coordinator, Video Editor) that fit their exact business model. These subagents report to the Core 4. Do not wait for them to ask you to hire them.
9. When asked to find or create leads, use 'add_lead' to insert them into the Lead Pipeline. If a user asks to update a lead, use 'update_lead'. If the user mentions moving someone from a hiree/lead to a driver/client, use 'update_lead' to change their stage to 'Closed' AND simultaneously use 'create_client' to add them to the Ledger.
10. ADDING TO LEDGER: When a user explicitly mentions hiring a new driver, adding a new member, or closing a new client, you MUST use the 'create_client' tool to add them directly to the Client Ledger. This is a digital system action that YOU MUST PERFORM IMMEDIATELY. Even if you also create a "Today's Task" for a human to perform physical onboarding, the digital record in the Ledger must be created by you first. For Dispatchers, "Drivers" are clients. For Organizers, "Members" are clients.
74. AUTONOMOUS SCHEDULING & TASK MANAGEMENT: You are fully authorized and expected to autonomously manage the user's schedule and daily tasks. As you converse with the user and identify priorities, upcoming events, or shifts in strategy, proactively use 'create_task', 'update_task', and 'add_calendar_event' to keep their Tactical Calendar updated in real-time, even if they don't explicitly ask you to schedule something. Adapt their "Today's Tasks" list seamlessly. NEVER use the word "Kanban".
12. Be authoritative, strategic, and highly efficient. Do not hallucinate actions. If you say you are performing an action, you MUST trigger the corresponding tool.
13. WEB BROWSING & INVENTORY SYNC: You DO NOT have the ability to scrape URLs or browse the live internet. If a user asks you to sync inventory from a Shopify/Etsy URL, YOU CANNOT DO IT DIRECTLY. Instead of asking them to type out the product details manually (which is tedious), you MUST instruct them to upload screenshots of their store/products to the chat. Once they provide screenshots, use your vision capabilities to automatically extract product names, prices, and stock levels, and use the 'add_inventory_item' tool to log each one autonomously.
14. STRATEGIC PLANNING: When the user asks you to create a plan (lead gen, overarching strategy, marketing plan, etc.), DO NOT just output text. You MUST use the 'store_plan' tool to create a formalized plan document. Provide a descriptive title, select the appropriate agent, and pass the detailed plan content. Remember, for Marketing Campaigns, you must simultaneously use 'create_campaign'. CRITICALLY: Anytime you create a plan, you MUST automatically recognize the immediate actionable tasks within that plan and simultaneously use the 'create_task' tool to log them into "Today's Tasks" with a 'todo' status. This serves as the user's To-Do list. Inform the user that these tasks are ready and awaiting their manual "Execute Plan" command to begin live agent activity.
15. EXECUTING PLANS: When the user explicitly hits "Execute Plan" or asks you to begin, you must start the 'live' execution phase. Use 'update_task' to move the relevant plan tasks to 'in_progress', which shows the agents are actively working in the right-hand sidebar, and proceed with further tool calls (lead gen, campaigns, etc.) to carry out the plan.
16. LEAD GENERATION: When EXPLICITLY asked to find or gather leads, you MUST first ensure you know the user's specific target audience and preferred location. If this information is NOT already present in your Business Context, you MUST ask the user to provide it BEFORE generating leads. Once you know the audience and location, generate at least 5 highly realistic, specific business leads matching that criteria. You MUST use the 'add_multiple_leads' tool to add ALL of them to the 'Qualifying' stage. Set their value to '$0' and starting prob to '0%'. NEVER claim to have found leads without actually using the 'add_multiple_leads' tool, and NEVER invent random companies without understanding the user's actual target audience.
17. ACTION BOUNDARIES: NEVER take major structural action (like generating fake leads or creating large plans) unless the user EXPLICITLY asks you to. However, for Calendar Events and Task Management (creating/updating daily tasks), you SHOULD be proactive and autonomous based on the conversation flow. If the user is just answering your questions about their business, simply acknowledge the answers, use 'update_business_profile' to save them, and ask what they would like to do next.
18. SOCIAL MEDIA & INTEGRATIONS: If the user asks you to post to a social media account (like Facebook, Instagram, Google Business, TikTok, Shopify, or Etsy), you MUST first check the 'Active Integrations' in your context. If the requested platform is NOT in the active integrations list, you MUST refuse the task and tell the user: "Please go to the Settings tab and pair your [Platform Name] account so I can execute this task on your behalf." If it IS integrated, you may proceed with the action.
19. ADAPTING PLANS: Before executing a stored plan, the user may ask you to adapt, edit, or make changes to it. You MUST use the 'update_plan' tool to save these modifications. Do not just output the new text in chat; ensure the stored document is updated.
20. CSV & SPREADSHEET IMPORTS: If the user provides CSV data or uploads a screenshot of a spreadsheet/database, you MUST automatically analyze it. Extract the records, map them to the appropriate fields based on their Business Stage (e.g., Dispatcher uses 'Assigned Route/Location', Organizer uses 'Facility' and 'Rank', Ecomm uses 'LTV'), and use either 'add_multiple_leads' or 'add_multiple_clients' to bulk import them into the system autonomously. Do not ask them to do it manually.
21. STRICT RESPONSE FORMAT: You MUST use the provided JSON function declarations to execute tools. NEVER output raw Python code, \`tool_code\` blocks, \`default_api\` references, or \`thought\` blocks in your text response. Always formulate a clean, conversational, human-friendly text response, and simultaneously trigger the native structured function calls.
22. DRAFTING DOCUMENTS & OUTREACH: If the user asks you to draft an email, letter, announcement, or document (that is NOT a strategic plan or a direct message to a specific active team channel), you MUST use the 'draft_document' tool. NEVER send a message or email blindly without first presenting a draft to the user for confirmation. Ensure you set the appropriate document type (e.g., 'Email', 'Memo', 'Outreach', 'General').`;

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
            if (supabase) {
              await supabase.from('tasks').insert([{ title: call.args.title, status: call.args.column_id, agent: call.args.assigned_agent || 'CEO', scheduled_time: call.args.scheduled_time || null, user_id: userId }]);
            }
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
            frontendActions.push({ type: 'update_business_profile', payload: call.args });
            if (supabase) {
              await supabase.from('business_profile').upsert({ user_id: userId, ...call.args });
            }
            toolResults.push(`Business Profile updated successfully.`);
          }
          else if (call.name === "create_agent") {
            frontendActions.push({ type: 'create_agent', payload: call.args });
            if (supabase) {
              await supabase.from('agents').insert([{ role_name: call.args.role_name, persona_description: call.args.persona_description, user_id: userId }]);
            }
            toolResults.push(`Agent '${call.args.role_name}' successfully hired.`);
          }
          else if (call.name === "add_lead") {
            frontendActions.push({ type: 'add_lead', payload: call.args });
            if (supabase) {
              await supabase.from('leads').insert([{ ...call.args, user_id: userId }]);
            }
            toolResults.push(`Lead '${call.args.name}' added to pipeline.`);
          }
          else if (call.name === "add_multiple_leads") {
            frontendActions.push({ type: 'add_multiple_leads', payload: call.args });
            if (supabase) {
               const insertData = call.args.leads.map(l => ({ ...l, user_id: userId }));
               await supabase.from('leads').insert(insertData);
            }
            toolResults.push(`${call.args.leads.length} leads added to pipeline.`);
          }
          else if (call.name === "update_lead") {
            frontendActions.push({ type: 'update_lead', payload: call.args });
            if (supabase) {
              const updateData = { stage: call.args.stage };
              if (call.args.next_step) updateData.next_step = call.args.next_step;
              if (call.args.prob) updateData.prob = call.args.prob;
              
              const { data, error } = await supabase.from('leads').update(updateData).eq('name', call.args.name).eq('user_id', userId).select();
              if (data && data.length > 0) {
                toolResults.push(`Lead '${call.args.name}' successfully moved to ${call.args.stage}.`);
              } else {
                toolResults.push(`Failed to update. Could not find a lead named '${call.args.name}' in the database.`);
              }
            } else {
              toolResults.push(`Lead '${call.args.name}' successfully updated.`);
            }
          }
          else if (call.name === "create_client") {
            frontendActions.push({ type: 'create_client', payload: call.args });
            if (supabase) {
              await supabase.from('clients').insert([{ ...call.args, user_id: userId }]);
            }
            toolResults.push(`Client '${call.args.name}' added to ledger.`);
          }
          else if (call.name === "add_multiple_clients") {
            frontendActions.push({ type: 'add_multiple_clients', payload: call.args });
            if (supabase) {
               const insertData = call.args.clients.map(c => ({ ...c, user_id: userId }));
               await supabase.from('clients').insert(insertData);
            }
            toolResults.push(`${call.args.clients.length} clients added to ledger.`);
          }
          else if (call.name === "create_campaign") {
            await supabase.from('campaigns').insert([{ ...call.args, user_id: userId }]);
            toolResults.push(`Campaign '${call.args.name}' added.`);
          }
          else if (call.name === "add_calendar_event") {
            frontendActions.push({ type: 'add_calendar_event', payload: call.args });
            if (supabase) {
              await supabase.from('calendar_events').insert([{ ...call.args, user_id: userId }]);
            }
            toolResults.push(`Event '${call.args.task_name}' scheduled for ${call.args.day_of_week}.`);
          }
          else if (call.name === "add_inventory_item") {
            frontendActions.push({ type: 'add_inventory_item', payload: call.args });
            if (supabase) {
              const { error } = await supabase.from('inventory').insert([{ ...call.args, user_id: userId }]);
              if (error) console.error("Inventory insert error:", error);
            }
            toolResults.push(`Inventory item '${call.args.product_name}' synced.`);
          }
          else if (call.name === "store_plan") {
            frontendActions.push({ type: 'store_plan', payload: call.args });
            if (supabase) {
              const { error } = await supabase.from('plans').insert([{ ...call.args, user_id: userId }]);
              if (error) console.error("Plan insert error:", error);
            }
            toolResults.push(`Plan '${call.args.title}' stored successfully in the Planning Section.`);
          }
          else if (call.name === "update_plan") {
            frontendActions.push({ type: 'update_plan', payload: call.args });
            if (supabase) {
              const updateData = {};
              if (call.args.title) updateData.title = call.args.title;
              if (call.args.content) updateData.content = call.args.content;
              const { error } = await supabase.from('plans').update(updateData).or(`id.eq.${call.args.plan_id_or_title},title.eq.${call.args.plan_id_or_title}`).eq('user_id', userId);
              if (error) console.error("Plan update error:", error);
            }
            toolResults.push(`Plan '${call.args.plan_id_or_title}' updated with new adaptations.`);
          }
          else if (call.name === "draft_document") {
            frontendActions.push({ type: 'draft_document', payload: call.args });
            if (supabase) {
              const { error } = await supabase.from('documents').insert([{ ...call.args, user_id: userId }]);
              if (error) console.error("Document insert error:", error);
            }
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


