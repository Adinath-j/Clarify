import supabase from './supabase'

/**
 * Invokes the single /ai Edge Function
 */
export async function runAITool(payload) {
  try {
    const { data, error } = await supabase.functions.invoke('ai', {
      body: payload
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error(`[aiService] runAITool Error (${payload.tool}):`, error)
    throw error
  }
}

/**
 * Break down a task into actionable steps.
 * Returns an array of strings.
 */
export async function breakDownTask(taskString) {
  const data = await runAITool({
    tool: 'breakdown',
    prompt: taskString
  })
  
  return data.tasks || []
}

/**
 * Ask AI (RAG Chat). 
 * This uses a standard JSON fetch since streaming in React Native can be complex.
 */
export async function askAI(prompt, onChunk) {
  try {
    const session = await supabase.auth.getSession()
    const token = session?.data?.session?.access_token

    if (!token) throw new Error('Not authenticated')

    const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tool: 'chat', prompt })
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`AI Request failed (${res.status}): ${res.statusText}. Body: ${errText}`)
    }

    // Read JSON response
    const json = await res.json()
    const text = json.text || ''
    
    // Simulate streaming for the UI MVP
    if (onChunk) {
      onChunk(text)
    }
    
    return text
  } catch (err) {
    console.error('[aiService] askAI error:', err)
    throw err
  }
}
