import fs from 'fs'
import path from 'path'

export async function synthesize(prompt, responses, onChunk, history = []) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

  const systemPrompt = fs.readFileSync(
    path.join(process.cwd(), 'prompts/synthesis.md'), 'utf8'
  )

  const historyContext = history.length > 0
    ? `Conversation so far:\n${history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}\n\n`
    : ''

  const userMessage = `
${historyContext}Original question: ${prompt}

GPT-4o: ${responses[0]}

Claude: ${responses[1]}

DeepSeek: ${responses[2]}

Grok: ${responses[3]}

Now synthesize these into one best answer.
`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      stream: true,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Anthropic API returned ${response.status}: ${errText}`)
  }

  let fullText = ''
  let streamingDone = false
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  // Capture token usage from Anthropic SSE events
  let synthUsage = { input: 0, output: 0 }

  while (!streamingDone) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') { streamingDone = true; break }
        try {
          const parsed = JSON.parse(data)
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            const text = parsed.delta.text
            fullText += text
            if (!fullText.includes('---JSON---')) {
              onChunk(text)
            }
          }
          // message_start carries input_tokens
          if (parsed.type === 'message_start' && parsed.message?.usage) {
            synthUsage.input = parsed.message.usage.input_tokens ?? 0
          }
          // message_delta carries output_tokens
          if (parsed.type === 'message_delta' && parsed.usage) {
            synthUsage.output = parsed.usage.output_tokens ?? 0
          }
          if (parsed.type === 'message_stop') { streamingDone = true; break }
        } catch(e) {}
      }
    }
  }

  const parts = fullText.split('---JSON---')
  const jsonPart = parts[1]?.trim()

  try {
    const clean = jsonPart.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    parsed.summary = parts[0].trim()
    parsed._synthUsage = synthUsage
    return parsed
  } catch(e) {
    console.log('Parse failed, raw:', fullText)
    return {
      agreed: [],
      partial: [],
      conflicted: [],
      summary: fullText,
      confidence: 'Low',
      _synthUsage: synthUsage,
    }
  }
}