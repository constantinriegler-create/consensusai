export async function callDeepSeek(prompt, attachment, history = []) {
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

  const historyMessages = history.map(m => ({ role: m.role, content: m.content }))

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [...historyMessages, { role: 'user', content }]
    })
  })
  const data = await response.json()
  return {
    text:  data.choices[0].message.content,
    usage: {
      input:  data.usage?.prompt_tokens     ?? 0,
      output: data.usage?.completion_tokens ?? 0,
    },
  }
}