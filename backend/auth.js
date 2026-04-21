import supabase from './supabase.js'

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No auth token provided' })
  }

  const token = authHeader.replace('Bearer ', '')

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  req.user = user
  next()
}

export async function getCredits(userId) {
  const { data, error } = await supabase
    .from('credits')
    .select('standard_credits, premium_credits')
    .eq('user_id', userId)
    .single()

  if (error) throw new Error('Could not fetch credits')
  return data
}

export async function deductCredit(userId, type) {
  const col = type === 'premium' ? 'premium_credits' : 'standard_credits'
  const credits = await getCredits(userId)
  const current = credits[col]

  if (current <= 0) throw new Error('INSUFFICIENT_CREDITS')

  const { error } = await supabase
    .from('credits')
    .update({ [col]: current - 1, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (error) throw new Error('Could not deduct credit')
}

export async function saveChat(userId, title, mode) {
  const { data, error } = await supabase
    .from('chats')
    .insert({ user_id: userId, title, mode })
    .select('id')
    .single()

  if (error) throw new Error('Could not save chat')
  return data.id
}

export async function saveMessages(chatId, userPrompt, assistantResult, mode) {
  const { error } = await supabase
    .from('messages')
    .insert([
      {
        chat_id: chatId,
        role: 'user',
        content: { text: userPrompt },
      },
      {
        chat_id: chatId,
        role: 'assistant',
        content: assistantResult.synthesis,
        individual: assistantResult.individual,
        rounds: assistantResult.rounds || null,
        votes: assistantResult.votes || null,
        resolution: assistantResult.resolution || null,
      }
    ])

  if (error) throw new Error('Could not save messages')
}

export async function getUserChats(userId) {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      id, title, mode, created_at,
      messages (id, role, content, individual, rounds, votes, resolution, created_at)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error('Could not fetch chats')
  return data
}