export async function callGrok(prompt, attachment) {
  const XAI_API_KEY = process.env.XAI_API_KEY

  let content
  if (attachment && attachment.type.startsWith('image/')) {
    content = [
      { type: 'text', text: prompt },
      {
        type: 'image_url',
        image_url: { url: `data:${attachment.type};base64,${attachment.data}` }
      }
    ]
  } else if (attachment) {
    content = `${prompt}\n\nAttached file (${attachment.name}):\n${atob(attachment.data)}`
  } else {
    content = prompt
  }

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${XAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'grok-4-1-fast-non-reasoning',
      messages: [{ role: 'user', content }]
    })
  })
  const data = await response.json()
  return data.choices[0].message.content
}