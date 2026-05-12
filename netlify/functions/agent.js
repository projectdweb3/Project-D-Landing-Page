
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
    const userMessage = body.msg || body.message || ''; // frontend sends 'msg'
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

    // --- AI MEMORY: Load learned insights about this user ---
    let memoryContext = '';
    if (supabase) {
      try {
        const { data: memories } = await supabase
          .from('user_memory')
          .select('category, content')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(50);
        if (memories && memories.length > 0) {
          const grouped = {};
          memories.forEach(m => {
            if (!grouped[m.category]) grouped[m.category] = [];
            grouped[m.category].push(m.content);
          });
          memoryContext = '\n\nUSER MEMORY (things you have learned about this user over time — use these to personalize your responses and avoid asking questions you already know the answer to):\n';
          Object.entries(grouped).forEach(([cat, items]) => {
            memoryContext += `[${cat}]: ${items.join(' | ')}\n`;
          });
        }
      } catch (e) {
        console.warn('Could not load user memory:', e.message);
      }
    }

    // The CEO Brain — Conversational AI + Platform Controller
    const systemInstruction = `You are the CEO Agent of the AMP Center — a smart, personable AI assistant that also has the power to control every channel on this platform.

MOST IMPORTANT RULE: You are a CONVERSATIONAL AI FIRST. You can talk about literally anything — business, life, technology, strategy, random questions, whatever the user wants. Answer questions thoughtfully and insightfully, like a brilliant friend who also happens to run their business operations. You are NOT a rigid command-executor that only talks about tasks and tools. Be human.

Current Business Context:
${businessContext}
${memoryContext}

PERSONALITY:
- Talk like a sharp, friendly business partner. Keep it simple and natural.
- When things get technical, use analogies. Example: "Think of your pipeline like a fishing net — I'll add this person so they don't slip through the cracks."
- Be concise unless the user asks for detail. No walls of text.
- Use **bold** to highlight key info so users can scan quickly.
- If the user asks a general question ("what can you do?", "how does this work?", "tell me about X"), just ANSWER it naturally. Don't try to execute tools or create agents. Just talk.

WHEN TO USE TOOLS vs WHEN TO JUST TALK:
- If the user DIRECTLY asks you to do something ("add a lead", "schedule a meeting", "create a plan", "add Jakob as a user"), you MUST execute the tool IMMEDIATELY. No menus, no bullet lists of options, no "we could do X or Y" — just DO IT. If someone says "add a user named Jakob", you call 'add_user' with name "Jakob" right then and there.
- If you need more information to complete an action (e.g. they say "add a new client" but don't give a name, or "schedule a meeting" but don't give a date), ask ONLY for the specific missing pieces in one short question, then execute on their next response. Never ask more than one round of clarifying questions.
- If the user is just chatting, asking questions, or having a conversation — JUST TALK. Do NOT fire tools. Do NOT create agents. Do NOT generate plans unless asked.
- NEVER take structural actions (creating agents, generating leads, building plans) unless EXPLICITLY asked to.

PROACTIVE SUGGESTIONS (CRITICAL — what makes you feel alive):
- As the conversation flows, ALWAYS be on the lookout for moments where you can be useful. If the user mentions anything that maps to a tool you have, gently offer:
  * "By the way, I can add that to your pipeline right now if you want."
  * "Want me to throw that on your calendar?"
  * "That sounds like a plan worth saving — should I document it in Strategic Planning?"
  * "Sounds like you're describing a potential client — want me to add them to the ledger?"
  * "I can search Google and find real businesses like that for you — just tell me the area and I'll pull them straight into your pipeline."
- This is NOT the same as taking action silently. You ALWAYS ask first. But you DO ask — proactively, naturally, like a partner who's paying attention. Don't wait to be told everything.
- One proactive suggestion per response is enough. Don't overwhelm.

SCREENSHOT & IMAGE PROCESSING:
- When the user uploads ANY image (screenshot, photo, spreadsheet, store listing, table, handwritten list, etc.), you MUST analyze it using your vision capabilities.
- Identify WHAT the data is (products, leads, clients, tasks, contacts, inventory, etc.) and WHERE it should go in the platform (Client Ledger, Lead Pipeline, Inventory Tracker, Today's Tasks, etc.).
- Automatically extract every row/item visible and use the appropriate bulk or individual tool to enter the data. If you see 10 products, call 'add_inventory_item' 10 times or describe them all. If you see contacts, use 'add_lead' or 'add_multiple_leads'.
- If you're unsure what the data represents, ask ONE clarifying question: "I see a list of names with phone numbers — should I add these as leads or clients?"
- NEVER tell the user to manually type out data that you can clearly read from their screenshot.

RULES OF ENGAGEMENT:
1. DECIPHER INTENT: Is this a conversation, a question, or an instruction? Most messages are conversational — treat them that way. Only use tools when the intent is clearly actionable.
2. CONVERSATIONAL MEMORY: Use the conversation history to understand context. If the user told you something earlier, reference it naturally. Make them feel known.
3. COMPLEX PLANNING: You ARE capable of detailed, multi-step strategic planning — but only when asked. When a user asks for a marketing campaign or complex strategy, formulate a detailed plan before autonomously instructing your agents.
4. MARKETING CAMPAIGNS VS LEAD GEN PLANS: These are distinct. Lead Generation = finding specific contacts. Marketing Campaigns = broad outreach/branding (Meta Ads, TikTok Ads). When asked for a campaign, use 'create_campaign' AND 'store_plan'. When asked for lead gen, use 'search_for_leads' with a good query.
5. DELEGATING TASKS: When a task is ready for execution, use 'create_task' to delegate it. But ONLY when the user wants something done — not because you think you should.
6. CONTENT GENERATION: If the user explicitly asks for an image, graphic, or visual asset, use 'trigger_creative_agent'.
7. BUSINESS KNOWLEDGE: If the user gives you new business details in chat, use 'update_business_profile' to save them. Don't ask them to update manually.
8. ADDING LEADS: When asked to find or create leads, use 'add_lead', 'add_multiple_leads', or 'search_for_leads'. For finding real businesses via Google, use 'search_for_leads' — it handles the search and pipeline insertion automatically.
9. ADDING TO LEDGER: When a user mentions hiring a driver, adding a member, or closing a client, use 'create_client'. Ask for required fields first (Route & Work Days for Dispatchers, Products for Ecomm, etc.). Don't guess.
10. AUTONOMOUS SCHEDULING: You CAN proactively manage calendar and tasks based on conversation — but gently. "I noticed you mentioned a team sync Friday — want me to add that to your calendar?"
11. Be honest. If you say you're doing something, use the tool. Don't hallucinate actions.
12. WEB SEARCH & LEAD RESEARCH: You have a 'search_for_leads' tool that searches Google in real-time. When a user asks you to find leads or prospects, have a natural conversation to understand what they need — what kind of businesses, what location, what makes an ideal client. When you feel you have enough info, call 'search_for_leads' with a specific query like "plumbing companies in Long Island NY". The backend will execute the search and add the results to the pipeline automatically. Don't overthink it — if they give you enough to search, search. If their request is vague, just ask naturally.
13. STRATEGIC PLANNING & PLAN EXECUTION: When asked to create a plan, use 'store_plan' to save it. Within the plan, identify every actionable step and use 'create_task' for each one. For marketing campaigns, also use 'create_campaign'. When the user says "execute the plan" or clicks Execute, move tasks to 'in_progress' and begin executing tool-based steps immediately. For human-required steps (calls, meetings, in-person tasks), create them as tasks and tell the user what they need to handle personally. Think of yourself as the execution engine — not just the planner.
14. ADAPTING PLANS: When a user wants to modify a plan, use 'update_plan'.
15. PIPELINE STAGE RULES (when adding leads):
   - 'Inbound' = leads that came TO US first (form submissions, referrals). NEVER put searched/researched leads here.
   - 'Qualifying' = leads WE found or researched. This is the DEFAULT for any lead the AI generates via search.
   - 'Negotiation' = leads actively in conversation about pricing/scope.
   - NEVER fabricate businesses. The search_for_leads tool finds real ones. If you can't find enough, say so honestly.
16. SOCIAL MEDIA: Check 'Active Integrations' before posting. If a platform isn't connected, tell them to pair it in Settings.
17. CSV & SPREADSHEET IMPORTS: If CSV data or a spreadsheet screenshot is provided, auto-analyze and import using the appropriate bulk tool.
18. STRICT FORMAT: Use the JSON function declarations for tool calls. NEVER output raw Python, tool_code blocks, or thought blocks. Keep responses clean and human.
19. DRAFTING DOCUMENTS: For emails, letters, or outreach (not strategic plans), use 'draft_document'. Always present drafts for user confirmation before "sending."
20. SUBAGENT CREATION: ONLY create new subagents with 'create_agent' if the user EXPLICITLY asks you to hire or create a new agent. The initial agent team is set up during the onboarding genesis phase — do NOT auto-create agents after profile save.
21. USER MANAGEMENT: You can add, edit, or remove users on the account using 'add_user', 'edit_user', and 'remove_user'. If someone asks to add a user, just do it. If they ask to rename or remove a user, do it.
22. CLIENT & LEAD EDITING: You can update existing client records with 'update_client', and remove leads or clients with 'remove_lead' and 'remove_client'. If a user says "change John's retainer to $5000" or "remove that lead", use the appropriate tool immediately.
23. TEAM MESSAGING: You can send messages to team channels using 'send_team_message'. Use this when the user asks you to announce something or send a message to the team.
24. FULL PLATFORM CONTROL: You have tools for EVERY function on this platform. If a user asks you to do literally anything within the AMP Center — add, edit, remove, update, schedule, plan, message, create, search — you have a tool for it. USE IT. Do not tell the user to do something manually if you have a tool for it. Think of yourself as having root access to every channel.
25. LEARNING & MEMORY: You have a 'save_user_insight' tool. Use it to remember important things the user tells you — their ideal client criteria, industry preferences, locations they target, communication preferences, names of key people, business goals, recurring requests, and anything else that would help you serve them better next time. Save insights QUIETLY in the background — don't announce "I'm saving that to memory" unless they ask. Over time, your USER MEMORY section above will fill with these insights, so you never have to ask the same question twice. Think of it like building a relationship — the more you learn, the better partner you become.`;

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

    // --- ALL REQUESTS GO THROUGH GEMINI NATURALLY ---
    // No prescriptive pipelines. Gemini decides when to ask for details, when to search,
    // when to use tools, and when to just chat. The only JS is the technical bridge
    // that executes google_search when Gemini calls the search_for_leads tool.

    // --- STANDARD REQUEST ---
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
              description: "Adds a new lead to the CRM Pipeline. Use 'Qualifying' for leads YOU found via search. Use 'Inbound' ONLY for leads that contacted the user first.",
              parameters: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  contact: { type: "STRING" },
                  stage: { type: "STRING", description: "'Inbound' = lead came to us first. 'Qualifying' = we found/researched them (DEFAULT for searched leads). 'Negotiation' = actively discussing pricing/scope." },
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
                  stage: { type: "STRING", description: "'Inbound' = came to us. 'Qualifying' = we found them. 'Negotiation' = active pricing talks." },
                  next_step: { type: "STRING", description: "Any new next steps." },
                  prob: { type: "STRING", description: "The updated win probability, e.g. '20%', '50%', etc." }
                },
                required: ["name", "stage"],
              },
            },
            {
              name: "add_multiple_leads",
              description: "Adds multiple new leads to the CRM Pipeline at once. Use this when finding leads via Google Search. Default stage is 'Qualifying' for researched/found leads. NEVER use 'Inbound' for leads that were searched for.",
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
            },
            {
              name: "add_user",
              description: "Adds a new user to the AMP Center account. Max 5 users per account.",
              parameters: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING", description: "The display name for the new user." }
                },
                required: ["name"],
              },
            },
            {
              name: "edit_user",
              description: "Renames or edits an existing user on the account.",
              parameters: {
                type: "OBJECT",
                properties: {
                  current_name: { type: "STRING", description: "The current name of the user to edit." },
                  new_name: { type: "STRING", description: "The new display name." }
                },
                required: ["current_name", "new_name"],
              },
            },
            {
              name: "remove_user",
              description: "Removes a user from the account. Cannot remove the Primary User.",
              parameters: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING", description: "The name of the user to remove." }
                },
                required: ["name"],
              },
            },
            {
              name: "update_client",
              description: "Updates an existing client's information in the Client Ledger. Use this to change retainer, LTV, assigned agents, name, or next task.",
              parameters: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING", description: "The name of the client to update." },
                  new_name: { type: "STRING", description: "Optional. Change the client's name." },
                  retainer: { type: "STRING", description: "Optional. Updated retainer amount." },
                  ltv: { type: "STRING", description: "Optional. Updated lifetime value." },
                  assigned_agents: { type: "STRING", description: "Optional. Change assigned agents." },
                  next_task: { type: "STRING", description: "Optional. Update next task." }
                },
                required: ["name"],
              },
            },
            {
              name: "remove_lead",
              description: "Removes a lead from the CRM Pipeline by name.",
              parameters: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING", description: "The name of the lead to remove." }
                },
                required: ["name"],
              },
            },
            {
              name: "remove_client",
              description: "Removes a client from the Client Ledger by name.",
              parameters: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING", description: "The name of the client to remove." }
                },
                required: ["name"],
              },
            },
            {
              name: "send_team_message",
              description: "Sends a message or announcement to a team channel.",
              parameters: {
                type: "OBJECT",
                properties: {
                  message: { type: "STRING", description: "The message content to send." },
                  channel: { type: "STRING", description: "Optional. Target channel: 'all', 'marketing', 'operations', 'creative'. Defaults to 'all'." },
                  agent_name: { type: "STRING", description: "Optional. Which agent is sending. Defaults to 'CEO Agent'." }
                },
                required: ["message"],
              },
            },
            {
              name: "update_campaign",
              description: "Updates an existing marketing campaign's name, description, or stage.",
              parameters: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING", description: "The current name of the campaign to update." },
                  new_name: { type: "STRING", description: "Optional. New campaign name." },
                  description: { type: "STRING", description: "Optional. Updated description." },
                  stage: { type: "STRING", description: "Optional. 'Planning', 'Active', 'Completed'." }
                },
                required: ["name"],
              },
            },
            {
              name: "search_for_leads",
              description: "Searches Google in real-time to find REAL businesses matching the user's criteria. Call this when you have enough information about what type of businesses they want and where. The backend will execute a live Google Search and return the results as leads in the Qualifying pipeline. You must provide a specific, detailed search query — include the business type AND location. Example queries: 'plumbing companies in Long Island NY', 'hair salons near Miami FL', 'med spas in Dallas Texas'. The more specific your query, the better the results.",
              parameters: {
                type: "OBJECT",
                properties: {
                  query: { type: "STRING", description: "The Google search query. Be specific: include business type AND location. Example: 'landscaping companies in Long Island New York'" },
                  context: { type: "STRING", description: "Optional. Additional context about what makes an ideal lead for this user. Example: 'small local businesses that likely need a website or digital presence'" }
                },
                required: ["query"],
              },
            },
            {
              name: "save_user_insight",
              description: "Saves a learned fact about the user to persistent memory. Use this silently whenever you learn something important — their target audience, preferred locations, industry focus, communication style, key contacts, recurring requests, business goals, or action preferences. This builds your long-term knowledge of the user so you never have to ask the same question twice.",
              parameters: {
                type: "OBJECT",
                properties: {
                  category: { type: "STRING", description: "Category of insight: 'ideal_client', 'target_location', 'business_goals', 'preferences', 'key_contacts', 'action_patterns', 'industry_focus', 'communication_style', or 'general'" },
                  content: { type: "STRING", description: "The insight to remember. Be specific and concise. Example: 'Targets third-party Amazon logistics companies in NY and Long Island'" }
                },
                required: ["category", "content"],
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

        // --- SEARCH_FOR_LEADS: Technical bridge to Google Search ---
        // This is the only handler that makes a separate API call. It executes the
        // actual Google Search that Gemini requested, parses results, and converts
        // them into add_multiple_leads frontend actions.
        if (call.name === 'search_for_leads') {
          try {
            // Use a FAST, LIGHTWEIGHT model for search — NOT the main agent model.
            // The main agent (gemini-2.5-flash) already consumed ~3-5s of Netlify's 10s timeout.
            // gemini-2.5-flash-lite responds in ~1-2s with google_search.
            const searchModelEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
            
            const searchPayload = {
              system_instruction: { parts: [{ text: `Search Google and return REAL businesses as a JSON array. Output ONLY a valid JSON array — no markdown, no explanation.
Format: [{"name":"Business Name","phone":"(555) 123-4567","address":"Full address","website":"https://url","description":"What they do"}]
Rules: Find 7-10+ real businesses. Never fabricate. Use empty string "" for missing fields.` }] },
              contents: [{ role: 'user', parts: [{ text: call.args.query + (call.args.context ? '. Context: ' + call.args.context : '') }] }],
              tools: [{ google_search: {} }],
              generationConfig: { temperature: 0.5, maxOutputTokens: 2048 }
            };

            // Tight timeout: 7s max to stay within Netlify's 10s limit
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 7000);

            const searchRes = await fetch(searchModelEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(searchPayload),
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!searchRes.ok) {
              toolResults.push(`Google Search returned an error (${searchRes.status}). The leads couldn't be fetched — try a more specific query.`);
              continue;
            }

            let searchData;
            try { searchData = await searchRes.json(); } catch (e) {
              toolResults.push(`Google Search returned a non-JSON response. Try again with a different query.`);
              continue;
            }

            const searchText = (searchData?.candidates?.[0]?.content?.parts || []).filter(p => p.text).map(p => p.text).join('\n');

            // Parse results with multiple strategies
            let leads = [];

            // Strategy 1: JSON array
            try {
              const m = searchText.match(/\[[\s\S]*?\]/);
              if (m) { const p = JSON.parse(m[0]); if (Array.isArray(p) && p.length > 0) leads = p; }
            } catch(e) {}

            // Strategy 2: Individual JSON objects
            if (!leads.length) {
              try {
                const objs = [...searchText.matchAll(/\{[^{}]*"name"\s*:\s*"[^"]+[^{}]*\}/g)];
                if (objs.length) leads = objs.map(m => { try { return JSON.parse(m[0]); } catch(e) { return null; } }).filter(Boolean);
              } catch(e) {}
            }

            // Strategy 3: Numbered/bulleted lists
            if (!leads.length && searchText.length > 30) {
              const lines = searchText.match(/(?:^|\n)\s*(?:\d+\.|\*|-)\s*\*{0,2}([A-Z][^\n]{2,60})/gm);
              if (lines) leads = lines.map(l => ({ name: l.replace(/^[\s\n\r*\-\d.]+/, '').replace(/\*+/g, '').trim(), phone:'', address:'', website:'', description:'Found via Google' })).filter(l => l.name.length > 2 && l.name.length < 80);
            }

            // Build pipeline actions
            if (leads.length > 0) {
              frontendActions.push({ type: 'add_multiple_leads', payload: { leads: leads.map(l => ({
                name: l.name || 'Unknown', contact: l.phone || l.website || l.address || '',
                stage: 'Qualifying', value: '$0', prob: '0%', next_step: 'Research & send intro email'
              })) } });
              toolResults.push(`${leads.length} real leads found via Google Search and added to the Qualifying pipeline.`);
            } else {
              toolResults.push(`Google Search returned results but couldn't parse structured leads. Raw results were included in the response.`);
              if (searchText) finalText += `\n\n**Search Results:**\n${searchText}`;
            }
          } catch (searchErr) {
            if (searchErr.name === 'AbortError') {
              toolResults.push(`The Google Search took too long and timed out. Try a simpler, more specific query like "plumbers in Dallas TX".`);
            } else {
              toolResults.push(`Lead search failed: ${searchErr.message}`);
            }
          }
          continue;
        }

        // --- SAVE_USER_INSIGHT: Persist learned facts to Supabase ---
        if (call.name === 'save_user_insight') {
          if (supabase) {
            try {
              // Upsert: update if same category+similar content exists, else insert
              await supabase.from('user_memory').insert({
                user_id: userId,
                category: call.args.category || 'general',
                content: call.args.content,
                updated_at: new Date().toISOString()
              });
              // Silent — don't add to toolResults so it doesn't clutter the response
            } catch (e) {
              console.warn('Could not save memory:', e.message);
            }
          }
          continue;
        }
        
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
          else if (call.name === "add_user") {
            frontendActions.push({ type: 'add_user', payload: call.args });
            toolResults.push(`User '${call.args.name}' added to the account.`);
          }
          else if (call.name === "edit_user") {
            frontendActions.push({ type: 'edit_user', payload: call.args });
            toolResults.push(`User '${call.args.current_name}' renamed to '${call.args.new_name}'.`);
          }
          else if (call.name === "remove_user") {
            frontendActions.push({ type: 'remove_user', payload: call.args });
            toolResults.push(`User '${call.args.name}' removed from the account.`);
          }
          else if (call.name === "update_client") {
            frontendActions.push({ type: 'update_client', payload: call.args });
            toolResults.push(`Client '${call.args.name}' updated successfully.`);
          }
          else if (call.name === "remove_lead") {
            frontendActions.push({ type: 'remove_lead', payload: call.args });
            toolResults.push(`Lead '${call.args.name}' removed from the pipeline.`);
          }
          else if (call.name === "remove_client") {
            frontendActions.push({ type: 'remove_client', payload: call.args });
            toolResults.push(`Client '${call.args.name}' removed from the ledger.`);
          }
          else if (call.name === "send_team_message") {
            frontendActions.push({ type: 'send_team_message', payload: call.args });
            toolResults.push(`Message sent to ${call.args.channel || 'all'} channel.`);
          }
          else if (call.name === "update_campaign") {
            frontendActions.push({ type: 'update_campaign', payload: call.args });
            toolResults.push(`Campaign '${call.args.name}' updated.`);
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


