export async function callDeepSeek(prompt, attachment) {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

  let content
  if (attachment && attachment.type.startsWith('image/')) {
    // DeepSeek V3.2 doesn't support image input in chat — fall back to text-only prompt
    content = `${prompt}\n\n[Note: an image was attached but DeepSeek does not support images]`
  } else if (attachment) {
    content = `${prompt}\n\nAttached file (${attachment.name}):\n${atob(attachment.data)}`
  } else {
    content = prompt
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content }]
    })
  })
  const data = await response.json()
  return data.choices[0].message.content
}