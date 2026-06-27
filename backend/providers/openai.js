export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-5.4'

export async function callOpenAI(prompt, attachment, history = []) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  let content

  if (attachment && attachment.type.startsWith('image/')) {
    content = [
      { type: 'text', text: prompt },
      {
        type: 'image_url',
        image_url: {
          url: `data:${attachment.type};base64,${attachment.data}`
        }
      }
    ]
  } else if (attachment) {
    content = `${prompt}\n\nAttached file (${attachment.name}):\n${atob(attachment.data)}`
  } else {
    content = prompt
  }

  const historyMessages = history.map(m => ({ role: m.role, content: m.content }))

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [...historyMessages, { role: 'user', content }]
    })
  })
  const data = await response.json()
  console.log('[openai] Response status:', response.status)
  console.log('[openai] Response body:', JSON.stringify(data).slice(0, 300))
  return {
    text:  data.choices[0].message.content,
    usage: {
      input:  data.usage?.prompt_tokens     ?? 0,
      output: data.usage?.completion_tokens ?? 0,
    },
  }
}