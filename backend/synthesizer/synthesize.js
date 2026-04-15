import fs from 'fs'
import path from 'path'

export async function synthesize(prompt, responses, apiKey) {
  const systemPrompt = fs.readFileSync(
    path.join(process.cwd(), 'prompts/synthesis.md'), 'utf8'
  )

  const userMessage = `
Original question: ${prompt}

AI responses:
GPT-4o: ${responses[0]}

Claude: ${responses[1]}

Now synthesize these into one best answer.
`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  })

const data = await response.json()
console.log('Anthropic raw response:', JSON.stringify(data))
const text = data.content[0].text
const clean = text.replace(/```json|```/g, '').trim()
try {
  return JSON.parse(clean)
} catch(e) {
  console.log('Parse failed, raw text:', text)
  return {
    agreed: ['Could not parse response'],
    partial: [],
    conflicted: [],
    summary: text,
    confidence: 'Low'
  }
}
}