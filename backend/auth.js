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

export async function addCredits(userId, type, amount) {
  const col = type === 'premium' ? 'premium_credits' : 'standard_credits'
  const credits = await getCredits(userId)
  const current = credits[col] || 0

  const { error } = await supabase
    .from('credits')
    .update({ [col]: current + amount, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (error) throw new Error('Could not add credits')
  return current + amount
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

export async function deleteChat(userId, chatId) {
  // Verify ownership before deleting
  const { data, error: fetchError } = await supabase
    .from('chats')
    .select('id')
    .eq('id', chatId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !data) throw new Error('Chat not found or access denied')

  const { error: msgError } = await supabase
    .from('messages')
    .delete()
    .eq('chat_id', chatId)

  if (msgError) throw new Error('Could not delete messages')

  const { error: chatError } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)

  if (chatError) throw new Error('Could not delete chat')
}

export async function deleteAllChats(userId) {
  const { data: chats, error: fetchError } = await supabase
    .from('chats')
    .select('id')
    .eq('user_id', userId)

  if (fetchError) throw new Error('Could not fetch chats')

  const chatIds = (chats || []).map(c => c.id)
  if (chatIds.length === 0) return

  const { error: msgError } = await supabase
    .from('messages')
    .delete()
    .in('chat_id', chatIds)

  if (msgError) throw new Error('Could not delete messages')

  const { error: chatError } = await supabase
    .from('chats')
    .delete()
    .eq('user_id', userId)

  if (chatError) throw new Error('Could not delete chats')
}

export async function hasSeenAnnouncement(userId) {
  const { data, error } = await supabase
    .from('credits')
    .select('seen_rebrand_announcement')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    console.error('[announcement] check failed:', error.message)
    return false
  }
  const seen = data?.seen_rebrand_announcement === true
  console.log(`[announcement] user ${userId} seen=${seen}, raw=`, data?.seen_rebrand_announcement)
  return seen
}

export async function markAnnouncementSeen(userId) {
  // upsert so it works even if the credits row doesn't exist yet
  const { error } = await supabase
    .from('credits')
    .upsert(
      { user_id: userId, seen_rebrand_announcement: true },
      { onConflict: 'user_id' }
    )
  if (error) {
    console.error('[announcement] mark seen failed:', error.message)
    throw new Error('Could not update announcement status')
  }
  console.log(`[announcement] marked seen for user ${userId}`)
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