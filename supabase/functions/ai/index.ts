// @ts-ignore: Deno handles URL imports natively, but Node.js TS compiler doesn't.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// @ts-ignore: Suppress "Cannot find name 'Deno'" for Node.js TS compiler
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_MATCH_COUNT = 5;
const DEFAULT_THRESHOLD = 0.30;

// Helper to pad Gemini's 768-dim vector to match the 1536-dim Postgres schema
function padVector(vec: number[], targetLength: number): number[] {
  if (vec.length >= targetLength) return vec.slice(0, targetLength);
  return [...vec, ...Array(targetLength - vec.length).fill(0)];
}

const SYSTEM_PROMPT = `You are Clarify AI, an intelligent, privacy-first productivity assistant.
Your primary role is to help the user understand and organize their notes and tasks.
STRICT RULES:
1. ONLY answer questions using the provided context.
2. NEVER hallucinate or invent information.
3. If the answer is not in the context, explicitly state that you cannot find the information in the user's workspace.
4. When using information from context, ALWAYS cite the source using the provided identifier (e.g., "According to [Note #1]").
5. Keep responses concise, clear, and actionable. Do not be overly chatty.
6. Do not generate fake productivity metrics or analytics.`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? '';

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- WEBHOOK HANDLING FOR EMBEDDINGS ---
    // If the request is a database webhook from Supabase, it will contain a `type` and `record`
    if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
      // Verify that this is actually our service role key to prevent unauthorized webhook calls
      if (authHeader !== `Bearer ${supabaseServiceKey}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized Webhook Call' }), { status: 401 });
      }

      const { table, record, old_record } = payload;
      
      // Determine if we need to regenerate
      let needsEmbedding = false;
      let textToEmbed = '';

      if (table === 'notes') {
        const oldHash = old_record ? old_record.embedding_text_hash : null;
        if (record.embedding_text_hash !== oldHash || !record.embedding) {
          needsEmbedding = true;
          textToEmbed = `Title: ${record.title}\nBody: ${record.body}`;
        }
      } else if (table === 'todos') {
        // Embed todos if title/category changed
        const oldTitle = old_record ? old_record.title : null;
        if (record.title !== oldTitle || !record.embedding) {
          needsEmbedding = true;
          textToEmbed = `Task: ${record.title}\nPriority: ${record.priority}`;
        }
      }

      if (needsEmbedding && textToEmbed.trim()) {
        const embedRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'models/gemini-embedding-2',
            content: { parts: [{ text: textToEmbed }] }
          })
        });

        if (!embedRes.ok) {
          throw new Error(`Gemini Embedding Failed: ${embedRes.statusText}`);
        }
        
        const embedData = await embedRes.json();
        const embedding = padVector(embedData.embedding.values, 1536);

        // Initialize Supabase with service key to update the record
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from(table).update({ embedding }).eq('id', record.id);
      }

      return new Response(JSON.stringify({ success: true, embedded: needsEmbedding }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- CLIENT REQUEST HANDLING ---
    const { tool, prompt } = payload;

    // Validate Input
    if (!tool || typeof tool !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid tool' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return new Response(JSON.stringify({ error: 'Prompt must be a non-empty string' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Initialize Supabase Client with User's JWT to enforce RLS
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const jwt = authHeader.replace('Bearer ', '').trim();
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error('Auth Error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized user', details: userError?.message }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- TOOL ROUTING ---
    
    // 1. ASK AI (RAG CHAT)
    if (tool === 'chat') {
      // Get query embedding
      const embedRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/gemini-embedding-2',
          content: { parts: [{ text: prompt }] }
        })
      });
      if (!embedRes.ok) throw new Error(`Embedding generation failed: ${embedRes.statusText}`);
      const embedData = await embedRes.json();
      const queryEmbedding = padVector(embedData.embedding.values, 1536);

      // Vector Search
      let notesContext = '';
      let todosContext = '';

      const { data: notes, error: notesError } = await supabase.rpc('match_notes', {
        query_embedding: queryEmbedding,
        match_threshold: DEFAULT_THRESHOLD,
        match_count: DEFAULT_MATCH_COUNT,
        p_user_id: user.id
      });
      if (notesError) console.error("Notes RPC Error:", notesError);

      const { data: todos, error: todosError } = await supabase.rpc('match_todos', {
        query_embedding: queryEmbedding,
        match_threshold: DEFAULT_THRESHOLD,
        match_count: DEFAULT_MATCH_COUNT,
        p_user_id: user.id
      });
      if (todosError) console.error("Todos RPC Error:", todosError);

      // Build structured context
      if (notes && notes.length > 0) {
        notesContext = "Relevant Notes\n\n" + notes.map((n: any, i: number) => `[Note #${i+1}]\nTitle:\n${n.title}\nBody:\n${n.body}\nCreated:\n${n.created_at}`).join("\n---\n");
      }
      if (todos && todos.length > 0) {
        todosContext = "Relevant Todos\n\n" + todos.map((t: any, i: number) => `[Todo #${i+1}]\nTitle:\n${t.title}\nCompleted:\n${t.completed}\nPriority:\n${t.priority}`).join("\n---\n");
      }

      const finalContext = (notesContext + "\n\n" + todosContext).trim() || "No relevant notes or todos found in the workspace.";

      // Call Gemini
      const geminiPayload = {
        systemInstruction: { parts: { text: SYSTEM_PROMPT } },
        contents: [
          { role: 'user', parts: [{ text: `Context:\n${finalContext}\n\nUser Query: ${prompt}` }] }
        ]
      };

      const chatRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload)
      });
      
      if (!chatRes.ok) {
        const errText = await chatRes.text();
        throw new Error(`Gemini Chat Failed: ${errText}`);
      }

      const chatData = await chatRes.json();
      const responseText = chatData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        throw new Error("Invalid response from Gemini API");
      }

      // Return a standard JSON payload instead of streaming
      return new Response(JSON.stringify({ text: responseText }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. TASK BREAKDOWN & OTHERS
    if (tool === 'breakdown') {
      const geminiPayload = {
        systemInstruction: { parts: { text: "You are Clarify AI. Break down the user's task into smaller actionable steps. Output ONLY valid JSON in this format: { \"tasks\": [\"Task 1\", \"Task 2\"] }. Do not wrap in markdown code blocks." } },
        contents: [
          { role: 'user', parts: [{ text: `Break down this task: ${prompt}` }] }
        ],
        generationConfig: { responseMimeType: "application/json" }
      };

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload)
      });
      
      if (!res.ok) throw new Error(`Gemini Breakdown Failed: ${res.statusText}`);
      
      const data = await res.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      return new Response(responseText, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Invalid tool
    return new Response(JSON.stringify({ error: `Unknown tool: ${tool}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
