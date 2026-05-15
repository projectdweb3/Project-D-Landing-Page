
const { createClient } = require("@supabase/supabase-js");

// Utility: Extract lead objects from Gemini's text response using multiple parsing strategies
function parseLeadsFromText(text) {
  if (!text || text.length < 10) return [];
  let leads = [];

  // Strategy 1: Find a JSON array in the response
  try {
    const m = text.match(/\[[\s\S]*\]/);
    if (m) {
      const parsed = JSON.parse(m[0]);
      if (Array.isArray(parsed) && parsed.length > 0) leads = parsed;
    }
  } catch(e) {}

  // Strategy 2: Individual JSON objects with a "name" field
  if (!leads.length) {
    try {
      const objs = [...text.matchAll(/\{[^{}]{10,500}\}/g)];
      if (objs.length) {
        leads = objs.map(m => {
          try { const p = JSON.parse(m[0]); return p.name ? p : null; } catch(e) { return null; }
        }).filter(Boolean);
      }
    } catch(e) {}
  }

  // Strategy 3: Extract business names from numbered/bulleted lists
  if (!leads.length && text.length > 50) {
    const lines = text.match(/(?:^|\n)\s*(?:\d+\.|\*|-|•)\s*\*{0,2}([A-Z][^\n]{2,80})/gm);
    if (lines) {
      leads = lines
        .map(l => ({ name: l.replace(/^[\s\n\r*\-•\d.]+/, '').replace(/\*+/g, '').trim(), phone:'', address:'', website:'', description:'Found via search' }))
        .filter(l => l.name.length > 2 && l.name.length < 100);
    }
  }

  return leads;
}

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
    const existingLeadNames = Array.isArray(body.existing_lead_names) ? body.existing_lead_names : [];
    const pipelineContacts = Array.isArray(body.pipeline_contacts) ? body.pipeline_contacts : [];
    // Normalize existing lead names for fuzzy dedup (lowercase, stripped)
    const normalizeLeadName = (n) => (n || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    const existingNormalized = new Set(existingLeadNames.map(normalizeLeadName).filter(Boolean));

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
    const systemInstruction = `You are the CEO of the AMP Center — a smart, friendly assistant that runs inside the user's business dashboard. You can talk about anything, answer questions, AND take real actions across every part of this platform on the user's behalf.

MOST IMPORTANT RULE: You are a CONVERSATIONAL partner FIRST. You can talk about literally anything — business, life, technology, strategy, random questions, whatever the user wants. Answer questions thoughtfully and warmly, like a knowledgeable friend who also happens to manage their business operations behind the scenes. You are NOT a rigid command-executor that only talks about tasks and tools. Be human. Be approachable.

CRITICAL CONTEXT — THE USER MAY NOT BE TECH-SAVVY:
Many users don't know what a CRM is, have never used an AI tool before, and may not understand terms like "pipeline," "agents," "leads," or "outreach sequences." Your job is to make them feel comfortable, not overwhelmed.
- NEVER use jargon without immediately explaining it in simple terms. Example: Instead of "I'll add them to your pipeline," say "I'll add them to your list of potential customers so we can keep track of them."
- When the user asks "what can you do?" — explain it like you're talking to a friend, not reading a feature list. Example: "Think of me as your business partner who never sleeps. I can find you new customers, write emails, keep your schedule organized, create marketing materials, and keep track of all your contacts — all from this one screen. Just tell me what you need in your own words."
- Emphasize that the AMP Center puts EVERYTHING in one place — no more switching between 10 different apps or spreadsheets. That's the magic.
- Emphasize AUTONOMY — "I can handle that for you" is your power phrase. The user shouldn't have to learn complicated tools. They tell you what they want, you make it happen.

Current Business Context:
${businessContext}
${memoryContext}
${pipelineContacts.length > 0 ? `\nPIPELINE CONTACTS (leads currently in the user's pipeline — use this to know who has email addresses for outreach):\n${pipelineContacts.map(c => `- ${c.name}${c.email ? ` | email: ${c.email}` : ' | NO EMAIL'}${c.phone ? ` | phone: ${c.phone}` : ''}${c.stage ? ` | stage: ${c.stage}` : ''}`).join('\n')}\n` : ''}

PERSONALITY:
- Talk like a sharp, friendly business partner. Keep it simple and natural. Imagine you're texting a friend who trusts you to handle things.
- When anything gets technical, ALWAYS use an analogy first. Example: "Think of your lead list like a fishing net — I'll add this person so they don't slip through the cracks."
- Be concise unless the user asks for detail. No walls of text. Short sentences. Easy words.
- Use **bold** to highlight key info so users can scan quickly.
- If the user seems confused or asks a basic question, lean into being helpful and patient. Never make them feel dumb for not knowing something.
- If the user asks a general question ("what can you do?", "how does this work?", "tell me about X"), just ANSWER it naturally. Don't try to execute tools or create agents. Just talk.
- When describing what you did, use plain language: "Done — I added them to your customer list" not "Lead successfully added to pipeline in Qualifying stage."

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
4. PLANS vs DOCUMENTS — THIS IS A CRITICAL DISTINCTION:

   A PLAN (use 'store_plan') is ONLY for workflows where EVERY step can be executed AUTONOMOUSLY by the AI agents within the AMP Center channels. Plans live in the Strategic Planning channel and have an Execute button. When executed, agents take real actions: searching for leads, adding to pipeline, scheduling calendar events, sending team messages, creating tasks, launching campaigns, etc. If even ONE step requires the user to leave the AMP Center and do something manually (go to another website, make a phone call, post on social media manually, sign up for a tool), it is NOT a plan — it's a document.

   A DOCUMENT (use 'draft_document') is for EVERYTHING ELSE: guides, playbooks, procedures, strategies, memos, outreach templates, emails, SOPs, step-by-step instructions, lead generation playbooks for non-searchable leads, training materials, or anything that requires human action outside the platform. Documents are presented directly in Neural Chat and are saveable as PDFs. If the user says 'make me a plan' but what they're describing contains steps that agents CAN'T automate, make it a document — not a plan. Use your judgment on the word 'plan' — the user might say 'plan' colloquially but actually need a document.

   EXAMPLES:
   - 'Find me 10 plumbing companies in Miami and add them to my pipeline' → PLAN (agents can search + add leads)
   - 'Create a 30-day outreach campaign with email sequences and calendar blocks' → PLAN (agents can create campaign + schedule + create tasks)
   - 'Give me a strategy for finding TikTok influencers' → DOCUMENT (agents can't browse TikTok)
   - 'Make me a plan for cold calling scripts and follow-up procedures' → DOCUMENT (agents can't make phone calls)
   - 'Build me a marketing plan that includes Meta Ads targeting' → PLAN for the parts agents CAN do (create campaign, schedule tasks) + mention what the user needs to handle manually
   - 'Give me an onboarding checklist for new hires' → DOCUMENT (agents can't onboard humans)
5. DELEGATING TASKS: When a task is ready for execution, use 'create_task' to delegate it. But ONLY when the user wants something done — not because you think you should.
6. CONTENT GENERATION: If the user explicitly asks for an image, graphic, or visual asset, use 'trigger_creative_agent'.
7. BUSINESS KNOWLEDGE: If the user gives you new business details in chat, use 'update_business_profile' to save them. Don't ask them to update manually.
8. ADDING LEADS: When asked to find or create leads, use 'add_lead', 'add_multiple_leads', or 'search_for_leads'. For finding real businesses via Google, use 'search_for_leads' — it handles the search and pipeline insertion automatically.
9. ADDING TO LEDGER: When a user mentions hiring a driver, adding a member, or closing a client, use 'create_client'. Ask for required fields first (Route & Work Days for Dispatchers, Products for Ecomm, etc.). Don't guess.
10. AUTONOMOUS SCHEDULING: You CAN proactively manage calendar and tasks based on conversation — but gently. "I noticed you mentioned a team sync Friday — want me to add that to your calendar?"
11. Be honest. If you say you're doing something, use the tool. Don't hallucinate actions.
12. WEB SEARCH & LEAD RESEARCH: You have a 'search_for_leads' tool backed by Google Places API + Google Search. BEFORE calling it, assess whether the lead type can realistically be found via a location-based business search:

   PLACES-COMPATIBLE (use 'search_for_leads'): Local or regional businesses with physical locations — contractors, med spas, restaurants, logistics companies, salons, gyms, law firms, auto shops, warehouses, retail stores, service companies, B2B suppliers, etc. These have addresses, phones, websites in Google's database. Provide a specific query with business type + location.

   NOT PLACES-COMPATIBLE (use 'draft_document' instead): Individual people (influencers, freelancers, coaches, content creators), online-only brands with no physical address, remote workers, job candidates, social media personalities, e-commerce only stores, SaaS companies without local presence, or anyone identified by role/title rather than business type + location.

   If the lead type is NOT Places-compatible: Do NOT call 'search_for_leads'. Instead, have a brief conversation to understand exactly who they're targeting, then call 'draft_document' with document_type='Lead Generation Playbook'. The document should be a step-by-step, repeatable manual procedure tailored to THEIR specific lead type — specific platforms to use (Instagram, LinkedIn, TikTok, Reddit, etc.), exact search filters and hashtags, how to qualify prospects, what to DM or email, and how to track them. Make it practical and immediately actionable, not generic.
13. PLAN EXECUTION: Plans stored via 'store_plan' are EXECUTABLE WORKFLOWS. Every step in a plan must map to a tool you have (search_for_leads, add_lead, add_multiple_leads, create_task, add_calendar_event, create_campaign, send_team_message, trigger_creative_agent, etc.). When the user says 'execute the plan' or clicks Execute, you IMMEDIATELY start firing those tools in sequence — searching for leads, adding them to pipeline, scheduling events, creating tasks, etc. You are the execution engine. If a plan has 5 steps and all 5 map to tools, execute all 5. Never store a plan that contains steps you can't execute.
14. ADAPTING PLANS: When a user wants to modify a plan, use 'update_plan'. If modifications add steps that can't be automated, convert those to a document instead.
15. PIPELINE STAGE RULES (when adding leads):
    - 'Inbound' = leads that came TO US first (form submissions, referrals). NEVER put searched/researched leads here.
    - 'Qualifying' = leads WE found or researched. This is the DEFAULT for any lead the AI generates via search.
    - 'Negotiation' = leads actively in conversation about pricing/scope.
    - NEVER fabricate businesses. The search_for_leads tool finds real ones. If you can't find enough, say so honestly.
16. SOCIAL MEDIA: Check 'Active Integrations' before posting. If a platform isn't connected, tell them to pair it in Settings.
17. CSV & SPREADSHEET IMPORTS: If CSV data or a spreadsheet screenshot is provided, auto-analyze and import using the appropriate bulk tool.
18. STRICT FORMAT: Use the JSON function declarations for tool calls. NEVER output raw Python, tool_code blocks, or thought blocks. Keep responses clean and human.
19. DRAFTING DOCUMENTS: Use 'draft_document' for ALL non-executable content: emails, memos, outreach templates, lead gen playbooks, SOPs, training docs, strategy guides, cold calling scripts, procedures, checklists, or any 'plan' that contains steps requiring human action outside the AMP Center. Documents appear in Neural Chat and are saveable as PDFs. Always present drafts for user review.
20. SUBAGENT CREATION: ONLY create new subagents with 'create_agent' if the user EXPLICITLY asks you to hire or create a new agent. The initial agent team is set up during the onboarding genesis phase — do NOT auto-create agents after profile save.
21. USER MANAGEMENT: You can add, edit, or remove users on the account using 'add_user', 'edit_user', and 'remove_user'. If someone asks to add a user, just do it. If they ask to rename or remove a user, do it.
22. CLIENT & LEAD EDITING: You can update existing client records with 'update_client', and remove leads or clients with 'remove_lead' and 'remove_client'. If a user says "change John's retainer to $5000" or "remove that lead", use the appropriate tool immediately.
23. TEAM MESSAGING: You can send messages to team channels using 'send_team_message'. Use this when the user asks you to announce something or send a message to the team.
24. FULL PLATFORM CONTROL: You have tools for EVERY function on this platform. If a user asks you to do literally anything within the AMP Center — add, edit, remove, update, schedule, plan, message, create, search — you have a tool for it. USE IT. Do not tell the user to do something manually if you have a tool for it. Think of yourself as having root access to every channel.
25. LEARNING & MEMORY: You have a 'save_user_insight' tool. Use it to remember important things the user tells you — their ideal client criteria, industry preferences, locations they target, communication preferences, names of key people, business goals, recurring requests, and anything else that would help you serve them better next time. Save insights QUIETLY in the background — don't announce "I'm saving that to memory" unless they ask. Over time, your USER MEMORY section above will fill with these insights, so you never have to ask the same question twice. Think of it like building a relationship — the more you learn, the better partner you become.
26. TARGET MARKET PIVOTING (CRITICAL — on-the-fly lead criteria changes):
    - The user can change their desired target market, ideal client type, or lead criteria at ANY point in the conversation simply by telling you. Examples: "Actually, let's switch to dentists instead" or "I want to target restaurants now" or "Focus on med spas in Houston going forward."
    - When the user tells you they want a DIFFERENT type of lead or target market: IMMEDIATELY acknowledge the change, use 'save_user_insight' to update your memory with the new target info (category: 'ideal_client' or 'target_location'), and begin searching/acting on the new criteria from that point forward. Do NOT continue using old criteria.
    - Confirm the pivot back to them naturally: "Got it — switching gears to [new target]. Let me search for those now." or "Noted — your new target market is [X]. I'll focus all future lead searches on that."
    - If the user hasn't specified a target market yet and asks for leads, ASK what kind of business and where before searching. Don't assume.
27. EXHAUSTION & REPEAT PREVENTION (CRITICAL — NEVER give duplicate leads):
    - The backend deduplicates every search result against the user's CURRENT pipeline leads AND their existing clients. This means: (a) leads already in the pipeline won't be re-added, and (b) businesses that have already become clients will never be re-surfaced as leads.
    - IMPORTANT: This dedup is based purely on current state — if a lead was removed/deleted from the pipeline and did NOT become a client, it is NO LONGER excluded and can appear in future searches. This is intentional — deleted leads are fair game again.
    - NEVER give repeat leads. YOU must also be conversationally aware: if the user says "give me more plumbers in Dallas" and the pipeline already has 16+ plumbers in Dallas, the search will likely return mostly duplicates.
    - If a search returns FEWER new leads than expected (e.g., user asked for 8 but only 3 new ones came back because the rest were already in the pipeline), explain it clearly: "I found 3 new ones this time — the rest were already in your pipeline. We're getting close to exhausting [business type] leads in [area]."
    - If a search returns ZERO new leads (all duplicates): Say explicitly: "We've exhausted the available [business type] leads in [area] — every result I found is already in your pipeline." Then PROACTIVELY suggest 2-3 nearby geographic areas to expand into: "To find fresh leads, I'd recommend expanding to [nearby city 1], [nearby city 2], or widening your radius to [broader region]. Want me to search one of those?"
    - This ensures the user is never stuck wondering why they're not getting new leads — you always explain and offer a clear path forward.
    - DUPLICATE PREVENTION also applies across the conversation. If you gave 8 leads from Area A earlier, and the user says "give me more from Area A", the backend will skip any leads already added. If all 8 possible results from Area A were already in the pipeline, tell the user that area is tapped and suggest alternatives.
28. EMAIL OUTREACH (CRITICAL — you can now send REAL emails):
    - You have a 'send_outreach' tool that sends REAL emails through Gmail. These actually arrive in the recipient's inbox. This is not a simulation.
    - BEFORE sending any email, you MUST verify the recipient has an email address. Check the lead data passed in the conversation or pipeline. If no email exists, ask the user for it.
    - FIRST-TIME OUTREACH: If the user says "start outreach" or "email my leads" or "begin a campaign" without specifying what to say, DO NOT immediately send. Instead, guide them through an Outreach Plan:
      1. Ask about the goal (book a discovery call? offer services? introduce the brand?)
      2. Ask about the tone (friendly/casual, professional, direct/bold)
      3. Draft a sample message with {{name}} personalization and show it for approval
      4. Offer to create 2-3 variants for different lead types
      5. Only send after explicit approval ("looks good", "send it", "go ahead")
    - DRAFT vs SEND: Use send_mode='draft' to show the email for review. Only use send_mode='send' when the user has explicitly approved the content.
    - PERSONALIZATION: Always use {{name}} in the message body. It auto-replaces with each recipient's business name. Never send generic "Dear Business Owner" emails.
    - BULK CAMPAIGNS: When the user wants to email multiple leads, include all recipients in a single send_outreach call. Each gets their own personalized copy.
    - FOLLOW-UP SEQUENCES: If the user wants a multi-touch campaign, use store_plan to create an executable outreach plan with scheduled steps (e.g., Day 1: intro email, Day 3: value-add follow-up, Day 7: final touch with CTA).
    - POST-SEND REPORTING: After emails are sent, always report: how many delivered, how many failed (and why), and which leads had no email address. Be specific.
    - NEVER send an email the user hasn't seen or approved. When in doubt, draft first.`;


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
              description: "Creates a document that is presented directly in Neural Chat and saveable as a PDF. Use this for ALL non-executable content: emails, memos, outreach templates, lead generation playbooks, SOPs, cold calling scripts, training guides, strategy write-ups, checklists, procedures, or any 'plan' that contains steps requiring manual human action outside the AMP Center. If the user asks for a plan but the steps can't be automated by the AI agents, use this tool — NOT store_plan.",
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
              description: "Stores an EXECUTABLE plan to the Strategic Planning channel. ONLY use this when EVERY step in the plan can be performed autonomously by the AI agents using AMP Center tools (search_for_leads, add_lead, add_multiple_leads, create_task, add_calendar_event, create_campaign, send_team_message, trigger_creative_agent, etc.). Plans have an Execute button. If any step requires the user to act outside the AMP Center (visit another website, make calls, post on social media manually), use 'draft_document' instead.",
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
              description: "Searches Google Places + Google Search in real-time to find REAL businesses with physical locations. ONLY use this for businesses that have a local presence (contractors, salons, gyms, restaurants, logistics companies, law firms, warehouses, med spas, auto shops, B2B service companies, etc.). Do NOT use this for: individual people, influencers, online-only brands, remote workers, or anyone without a physical business address. For those lead types, use 'draft_document' with a Lead Generation Playbook instead. When using this tool, include business type AND location in the query. Examples: 'third party Amazon logistics companies Long Island NY', 'hair salons Miami FL', 'med spas in Dallas Texas'. Be specific — the more detail, the better the results.",
              parameters: {
                type: "OBJECT",
                properties: {
                  query: { type: "STRING", description: "Specific search query with business type + location. Example: 'plumbing companies Long Island New York'" },
                  context: { type: "STRING", description: "Optional. What makes an ideal lead. Example: 'owner-operated, under 20 employees, likely no marketing agency yet'" },
                  lead_type: { type: "STRING", description: "Optional. Set to 'places' for local physical businesses (default), or 'web_only' if Google Places is unlikely to help and you want to fall back to general web search." }
                },
                required: ["query"],
              },
            },
            {
              name: "send_outreach",
              description: "Sends REAL emails to leads or clients via Gmail. This is NOT a draft — it actually delivers to their inbox. CRITICAL RULES:\n\n1. REQUIRE EMAIL: You MUST have the recipient's email address before sending. If the lead has no email, tell the user: 'I don't have an email address for [Name]. Can you provide one, or would you like me to draft the message for you to send manually?'\n\n2. FIRST-TIME OUTREACH FLOW: If the user says 'start outreach', 'reach out to my leads', 'begin emailing', or anything suggesting they want to start a campaign but haven't specified details yet, you MUST guide them through an Outreach Planning conversation BEFORE sending anything:\n   - Ask: What kind of businesses are you reaching out to? (or reference your memory)\n   - Ask: What's the goal? (book a call, offer a service, introduce yourself, etc.)\n   - Ask: What tone? (casual/friendly, professional/formal, direct/bold)\n   - Then DRAFT the message and show it to them for approval before sending.\n   - Offer to create 2-3 message variants for A/B testing.\n   - Suggest a follow-up sequence (Day 1 intro, Day 3 follow-up, Day 7 final touch).\n\n3. PERSONALIZATION: Use {{name}} in the message body — it auto-replaces with each recipient's business name. Always personalize.\n\n4. BULK SENDING: When sending to multiple leads, provide ALL of their emails in the recipients array. Each gets their own personalized copy.\n\n5. AFTER SENDING: Report exactly how many were sent, failed, or skipped. If any failed, explain why. If leads had no email, list them separately.\n\n6. OUTREACH PLANNING via store_plan: If the user wants a multi-day outreach campaign, use store_plan to create an executable plan with scheduled send_outreach steps. Each step should have the message content, subject, and target leads.",
              parameters: {
                type: "OBJECT",
                properties: {
                  recipients: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        name: { type: "STRING", description: "Business or contact name" },
                        email: { type: "STRING", description: "Email address to send to" }
                      },
                      required: ["name", "email"]
                    },
                    description: "Array of recipients with name and email. Every recipient MUST have a valid email address."
                  },
                  subject: { type: "STRING", description: "Email subject line. Keep it compelling and under 60 chars." },
                  message: { type: "STRING", description: "Email body. Use {{name}} for per-recipient personalization. Write in plain text with line breaks — it will be formatted as clean HTML automatically." },
                  send_mode: { type: "STRING", description: "'send' to deliver immediately, 'draft' to show the user for approval first." }
                },
                required: ["recipients", "subject", "message"],
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
      ],
      // CRITICAL: Disable thinking mode. gemini-2.5-flash thinks silently by default,
      // burning the entire token budget on internal reasoning with nothing left to output.
      // thinkingBudget: 0 = respond directly without silent reasoning chains.
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        thinkingConfig: {
          thinkingBudget: 0
        }
      },
      toolConfig: {
        functionCallingConfig: { mode: "AUTO" }
      }
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
    
    // Debug logging — helps diagnose issues without crashing
    console.log('Gemini response structure:', JSON.stringify({
      hasCandidates: !!data.candidates,
      candidateCount: data.candidates?.length,
      finishReason: data.candidates?.[0]?.finishReason,
      hasContent: !!data.candidates?.[0]?.content,
      partsCount: data.candidates?.[0]?.content?.parts?.length,
      partTypes: data.candidates?.[0]?.content?.parts?.map(p => p.text ? 'text' : p.functionCall ? 'functionCall:' + p.functionCall.name : 'other')
    }));
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No candidates returned from Gemini API");
    }

    const candidateContent = data.candidates[0].content || {};
    const responseParts = candidateContent.parts || [];
    const finishReason = data.candidates[0].finishReason || '';
    
    // Only throw for ACTUAL blocked responses — not for normal completions
    // STOP = normal finish, FUNCTION_CALL = normal with tools
    // SAFETY, RECITATION, OTHER, BLOCKLIST = genuinely blocked
    const blockedReasons = ['SAFETY', 'RECITATION', 'OTHER', 'BLOCKLIST', 'PROHIBITED_CONTENT'];
    if (responseParts.length === 0 && blockedReasons.includes(finishReason)) {
      throw new Error(`Gemini blocked the response due to: ${finishReason}. Try rephrasing your message.`);
    }
    
    // If parts are empty but finish reason is normal (STOP), return a graceful message
    if (responseParts.length === 0) {
      console.warn('Empty response parts with finishReason:', finishReason, '— raw:', JSON.stringify(data.candidates[0]).substring(0, 500));
      return {
        statusCode: 200,
        body: JSON.stringify({
          role: "assistant",
          content: "I processed your request but my response came back empty. Could you try rephrasing or sending that again?",
          actions: [],
        }),
      };
    }
    
    let toolResults = [];
    let frontendActions = [];
    let finalText = "";
    let leadSearchDone = false; // prevent duplicate lead count messages

    for (const part of responseParts) {
      if (part.text) {
        // Strip out ReAct reasoning and mock tool code that Gemini sometimes leaks
        let cleanText = part.text.replace(/```(?:thought|tool_code)[\s\S]*?```/gi, '');
        cleanText = cleanText.replace(/^(?:thought|tool_code)\s*\n[\s\S]*?(?=\n\n|\n[A-Z]|$)/gim, '');
        finalText += cleanText;
      }
      if (part.functionCall) {
        const call = part.functionCall;

        // --- SEARCH_FOR_LEADS: Apollo-style 3-tier lead discovery ---
        // Tier 1: Google Places API  → structured data (name, phone, address, website) — Apollo equivalent
        // Tier 2: Gemini google_search grounding → live web search fallback
        // Tier 3: Gemini knowledge base → always returns something
        if (call.name === 'search_for_leads') {
          const searchQuery = call.args.query + (call.args.context ? '. ' + call.args.context : '');
          const placesKey = process.env.GOOGLE_PLACES_KEY;
          let leads = [];
          let searchSource = '';

          // ─── TIER 1: Google Places API (Apollo-equivalent for local/SMB) ───
          // Returns structured JSON: name, phone, address, website — no parsing needed.
          // Free tier: 10,000 Text Search requests/month.
          // Skip if agent explicitly flagged this as web_only (non-physical lead type).
          const isPlacesCompatible = !call.args.lead_type || call.args.lead_type !== 'web_only';
          if (placesKey && isPlacesCompatible && leads.length === 0) {
            try {
              // Step 1: Text Search to get place IDs + basic info
              const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(call.args.query)}&key=${placesKey}`;
              const ctrl1 = new AbortController();
              const t1 = setTimeout(() => ctrl1.abort(), 5000);
              const placesRes = await fetch(textSearchUrl, { signal: ctrl1.signal });
              clearTimeout(t1);

              if (placesRes.ok) {
                const placesData = await placesRes.json();
                const places = placesData.results || [];
                console.log(`Google Places returned ${places.length} results for: ${call.args.query}`);

                // Step 2: Get full details (phone, website) for top 8 results in parallel.
                // Using Promise.all so all detail calls run simultaneously (~2-3s total, not sequential).
                const topPlaces = places.slice(0, 8);
                const detailPromises = topPlaces.map(async (place) => {
                  try {
                    const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,formatted_address,website,business_status&key=${placesKey}`;
                    const ctrl2 = new AbortController();
                    const t2 = setTimeout(() => ctrl2.abort(), 4000);
                    const detailRes = await fetch(detailUrl, { signal: ctrl2.signal });
                    clearTimeout(t2);
                    if (detailRes.ok) {
                      const detail = await detailRes.json();
                      const r = detail.result || {};
                      // Skip permanently closed businesses
                      if (r.business_status === 'CLOSED_PERMANENTLY') return null;
                      return {
                        name: r.name || place.name || '',
                        phone: r.formatted_phone_number || '',
                        address: r.formatted_address || place.formatted_address || '',
                        website: r.website || '',
                        description: place.types ? place.types.slice(0, 3).join(', ').replace(/_/g, ' ') : 'Local business'
                      };
                    }
                  } catch(_) {}
                  // Fallback to basic text search data if detail call times out
                  return { name: place.name || '', phone: '', address: place.formatted_address || '', website: '', description: 'Local business' };
                });

                const detailedPlaces = await Promise.all(detailPromises);
                leads = detailedPlaces.filter(p => p && p.name);
                if (leads.length > 0) searchSource = 'Google Places';
              }
            } catch (e) {
              console.error('Tier 1 (Google Places) failed:', e.name, e.message);
            }
          }

          // ─── TIER 2: Gemini google_search grounding (live web search) ───
          if (leads.length === 0) {
            try {
              const searchEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
              const searchPayload = {
                contents: [{ role: 'user', parts: [{ text: `Search Google for real businesses matching: "${searchQuery}"

Return ONLY a JSON array. No markdown, no explanation.
Format: [{"name":"Business Name","phone":"(555) 123-4567","address":"City, State","website":"https://url","description":"What they do"}]
Find 7-10+ real businesses. Use "" for missing fields. Never invent businesses.` }] }],
                tools: [{ google_search: {} }],
                generationConfig: { temperature: 0.2, maxOutputTokens: 3000 }
              };
              const ctrl3 = new AbortController();
              const t3 = setTimeout(() => ctrl3.abort(), 8000);
              const res = await fetch(searchEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(searchPayload), signal: ctrl3.signal });
              clearTimeout(t3);
              if (res.ok) {
                const d = await res.json();
                const txt = (d?.candidates?.[0]?.content?.parts || []).filter(p => p.text).map(p => p.text).join('\n');
                leads = parseLeadsFromText(txt);
                if (leads.length > 0) searchSource = 'Google Search';
              } else {
                const errInfo = await res.text().catch(() => '');
                console.error(`Tier 2 (google_search grounding) failed (${res.status}):`, errInfo.substring(0, 200));
              }
            } catch (e) {
              console.error('Tier 2 (google_search) failed:', e.name, e.message);
            }
          }

          // ─── TIER 3: Gemini Knowledge Fallback (always returns something) ───
          if (leads.length === 0) {
            try {
              console.log('Falling back to Gemini knowledge base for leads...');
              const fallbackPayload = {
                contents: [{ role: 'user', parts: [{ text: `List REAL businesses matching: "${searchQuery}"

Return ONLY a valid JSON array — no markdown, no commentary.
Format: [{"name":"Real Business Name","phone":"","address":"City, State","website":"","description":"What they do"}]
List 7-10 real companies that actually exist. No fabrications.` }] }],
                generationConfig: { temperature: 0.4, maxOutputTokens: 3000, thinkingConfig: { thinkingBudget: 0 } }
              };
              const ctrl4 = new AbortController();
              const t4 = setTimeout(() => ctrl4.abort(), 6000);
              const res2 = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fallbackPayload), signal: ctrl4.signal });
              clearTimeout(t4);
              if (res2.ok) {
                const d2 = await res2.json();
                const txt2 = (d2?.candidates?.[0]?.content?.parts || []).filter(p => p.text).map(p => p.text).join('\n');
                leads = parseLeadsFromText(txt2);
                if (leads.length > 0) searchSource = 'AI Knowledge Base';
              }
            } catch (e2) {
              console.error('Tier 3 (knowledge fallback) failed:', e2.message);
            }
          }

          // ─── Deduplicate against existing pipeline leads ───
          const totalFoundBeforeDedup = leads.length;
          if (existingNormalized.size > 0 && leads.length > 0) {
            leads = leads.filter(l => {
              const norm = normalizeLeadName(l.name);
              return norm && !existingNormalized.has(norm);
            });
          }
          const duplicatesSkipped = totalFoundBeforeDedup - leads.length;

          // ─── Push to pipeline ───
          if (leads.length > 0) {
            frontendActions.push({
              type: 'add_multiple_leads',
              payload: {
                leads: leads.map(l => ({
                  name: l.name || 'Unknown',
                  contact: l.phone || l.website || l.address || '',
                  phone: l.phone || '',
                  website: l.website || '',
                  address: l.address || '',
                  email: l.email || '',
                  stage: 'Qualifying',
                  value: '$0',
                  prob: '0%',
                  next_step: 'Research & send intro email'
                }))
              }
            });
            let resultMsg = `${leads.length} new leads found via ${searchSource} and added to the pipeline.`;
            if (duplicatesSkipped > 0) {
              resultMsg += ` (${duplicatesSkipped} already in your pipeline were skipped — those are NOT repeated.)`;
            }
            if (leads.length < 4 && duplicatesSkipped > 0) {
              resultMsg += ` ⚠️ You are running low on fresh leads in this area. Consider expanding to nearby cities or a different business type for more results.`;
            }
            toolResults.push(resultMsg);
            leadSearchDone = true;
          } else if (totalFoundBeforeDedup > 0) {
            // All results were duplicates — area is exhausted
            toolResults.push(`🔴 AREA EXHAUSTED: All ${totalFoundBeforeDedup} results found via ${searchSource} are already in your pipeline. This area has been fully tapped for this business type. Suggest the user expand to nearby cities or boroughs, or pivot to a different target market for fresh leads.`);
          } else {
            toolResults.push(`Searched for "${call.args.query}" across all available sources but couldn't retrieve results this time. Please try again or adjust your search criteria (different area or business type).`);
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
            // Only log if this wasn't already reported by search_for_leads (avoid duplicate message)
            if (!leadSearchDone) {
              toolResults.push(`${call.args.leads?.length || 0} leads added to pipeline.`);
            }
          }
          else if (call.name === "send_outreach") {
            const outreachArgs = call.args;
            
            // Draft mode — just show the message for approval, don't send
            if (outreachArgs.send_mode === 'draft') {
              frontendActions.push({ type: 'send_outreach', payload: { ...outreachArgs, status: 'draft' } });
              const recipientNames = (outreachArgs.recipients || []).map(r => r.name).join(', ');
              toolResults.push(`📝 **Draft prepared** for: ${recipientNames}\nSubject: "${outreachArgs.subject}"\n\nPlease review the message above. Say **"send it"** to deliver, or tell me what to change.`);
            } else {
              // Send mode — actually deliver via Gmail
              try {
                const senderName = userProfile?.company_name || 'AMP Center';
                const outreachPayload = {
                  recipients: outreachArgs.recipients || [],
                  subject: outreachArgs.subject,
                  message: outreachArgs.message,
                  sender_name: senderName,
                  userId: userId
                };

                // Call the outreach function
                const outreachUrl = `https://${event.headers.host || event.headers.Host || 'localhost'}/.netlify/functions/outreach`;
                const outreachRes = await fetch(outreachUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(outreachPayload)
                });

                if (outreachRes.ok) {
                  const outreachData = await outreachRes.json();
                  const { summary, results: emailResults } = outreachData;
                  
                  // Build detailed status report for the agent
                  let statusReport = '';
                  if (summary.sent > 0) {
                    const sentNames = emailResults.filter(r => r.status === 'sent').map(r => r.name).join(', ');
                    statusReport += `✅ **${summary.sent} email${summary.sent > 1 ? 's' : ''} delivered** to: ${sentNames}\n`;
                  }
                  if (summary.failed > 0) {
                    const failedDetails = emailResults.filter(r => r.status === 'failed').map(r => `${r.name} (${r.reason})`).join(', ');
                    statusReport += `❌ **${summary.failed} failed**: ${failedDetails}\n`;
                  }
                  if (summary.skipped > 0) {
                    const skippedNames = emailResults.filter(r => r.status === 'skipped').map(r => `${r.name} (${r.reason})`).join(', ');
                    statusReport += `⏭️ **${summary.skipped} skipped**: ${skippedNames}\n`;
                  }
                  statusReport += `\nSubject: "${outreachArgs.subject}"`;
                  
                  frontendActions.push({ 
                    type: 'send_outreach', 
                    payload: { ...outreachArgs, status: 'sent', deliveryResults: outreachData } 
                  });
                  toolResults.push(statusReport);
                } else {
                  const errText = await outreachRes.text();
                  console.error('[Agent] Outreach function error:', errText);
                  frontendActions.push({ type: 'send_outreach', payload: { ...outreachArgs, status: 'error' } });
                  toolResults.push(`❌ Email delivery failed: ${errText}. The Gmail integration may need to be reconfigured in Netlify environment variables.`);
                }
              } catch (outreachErr) {
                console.error('[Agent] Outreach call failed:', outreachErr.message);
                frontendActions.push({ type: 'send_outreach', payload: { ...outreachArgs, status: 'error' } });
                toolResults.push(`❌ Could not reach the email server: ${outreachErr.message}`);
              }
            }
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


