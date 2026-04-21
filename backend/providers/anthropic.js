export async function callAnthropic(prompt, attachment) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  let content

  if (attachment && attachment.type.startsWith('image/')) {
    content = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: attachment.type,
          data: attachment.data
        }
      },
      { type: 'text', text: prompt }
    ]
  } else if (attachment) {
    content = `${prompt}\n\nAttached file (${attachment.name}):\n${atob(attachment.data)}`
  } else {
    content = prompt
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content }]
    })
  })
  const data = await response.json()
  console.log('[anthropic] Response status:', response.status)
  console.log('[anthropic] Response body:', JSON.stringify(data).slice(0, 300))
  return data.content[0].text
}