const { GoogleGenerativeAI, FunctionDeclaration, SchemaType } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");

exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 1. Initialize Clients using Environment Variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    let supabase = null;
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey);
    }

    // 2. Parse the incoming message from the frontend
    const body = JSON.parse(event.body);
    const userMessage = body.message;

    // 3. Define the CEO Agent's Persona and Tools
    const systemInstruction = `You are the CEO Agent of the AMP Center, an elite AI orchestrator. 
Your job is to manage the business, oversee the other agents (CMO, CTO, Creative), and ensure everything runs smoothly. 
You are authoritative, highly efficient, and results-driven. 
If the user asks you to create a task, manage a project, or add something to the to-do list, you MUST use the 'create_task' tool to physically add it to the Kanban board database. Do not just say you will do it—actually use the tool.`;

    const createTaskDeclaration = {
      name: "create_task",
      description: "Creates a new task and adds it to the Kanban board database.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: {
            type: SchemaType.STRING,
            description: "The title or description of the task (e.g., 'Draft new marketing email')",
          },
          column_id: {
            type: SchemaType.STRING,
            description: "The column where the task belongs. Must be one of: 'todo', 'in_progress', 'review', 'done'.",
          },
        },
        required: ["title", "column_id"],
      },
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: { parts: [{ text: systemInstruction }] },
      tools: [{ functionDeclarations: [createTaskDeclaration] }],
    });

    // 4. Send the prompt to Gemini
    const chatSession = model.startChat();
    const result = await chatSession.sendMessage(userMessage);
    const response = result.response;

    // 5. Handle Tool Calls (If the AI decided to use 'create_task')
    let toolResults = [];
    let finalText = response.text();

    const functionCalls = response.functionCalls();
    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        if (call.name === "create_task") {
          const args = call.args;
          
          if (supabase) {
            // Actually insert the task into the Supabase 'tasks' table
            const { data, error } = await supabase
              .from('tasks')
              .insert([
                { title: args.title, status: args.column_id, agent: 'CEO' }
              ]);
              
            if (error) {
              console.error("Supabase Error:", error);
              toolResults.push(`Failed to create task: ${error.message}`);
            } else {
              toolResults.push(`Task '${args.title}' was successfully added to the Kanban board.`);
            }
          } else {
            // Mock response if Supabase isn't connected yet
            toolResults.push(`[SIMULATION MODE] Task '${args.title}' would have been added to the DB, but Supabase is not connected.`);
          }
        }
      }

      // Return a combined response to the frontend indicating tool usage
      return {
        statusCode: 200,
        body: JSON.stringify({
          role: "assistant",
          content: `I have executed your request.\n\nActions Taken:\n- ${toolResults.join('\n- ')}`,
        }),
      };
    }

    // 6. Return the standard text response to the frontend
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
      body: JSON.stringify({ error: "An error occurred inside the AI Agent backend. Check Netlify function logs for details." }),
    };
  }
};
