import './env.js'
import express from 'express'
import cors from 'cors'
import { Resend } from 'resend'
import { router } from './orchestrator/router.js'
import { premiumRouter } from './orchestrator/premium.js'
import { requireAuth, getCredits, addCredits, deductCredit, saveChat, saveMessages, getUserChats, deleteChat, deleteAllChats } from './auth.js'
import { stripe, PACKS } from './stripe.js'
import supabase from './supabase.js'

const resend = new Resend(process.env.RESEND_API_KEY)

const requiredEnv = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'DEEPSEEK_API_KEY', 'XAI_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'STRIPE_SECRET_KEY']
for (const name of requiredEnv) {
  if (!process.env[name]) {
    console.error(`Missing required env var: ${name}`)
    process.exit(1)
  }
}

const app = express()

// Stripe webhook needs raw body — must be before express.json()
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, packId } = session.metadata
    const pack = PACKS[packId]

    if (!pack || !userId) {
      console.error('Missing metadata in webhook:', session.metadata)
      return res.status(400).json({ error: 'Invalid metadata' })
    }

    const creditType = packId.startsWith('premium') ? 'premium' : 'standard'
    await addCredits(userId, creditType, pack.credits)

    await supabase
      .from('payments')
      .insert({
        user_id: userId,
        stripe_payment_id: session.payment_intent || session.id,
        pack_type: packId,
        credits_added: pack.credits,
        amount_cents: pack.amount_cents,
      })

    console.log(`✅ Added ${pack.credits} ${creditType} credits to user ${userId} (${packId})`)
  }

  res.json({ received: true })
})

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://consensusai-three.vercel.app'
  ]
}))
app.use(express.json({ limit: '100mb' }))

// Promo code redemption
app.post('/api/promo', async (req, res) => {
  const authHeader = req.headers.authorization
  let userId = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    userId = user?.id
  }

  if (!userId) {
    return res.status(401).json({ error: 'Please log in first' })
  }

  const { code } = req.body
  if (!code || code.trim().toUpperCase() !== 'CR2010') {
    return res.status(400).json({ error: 'Invalid promo code' })
  }

  // Check if already applied
  const { data: existing } = await supabase
    .from('credits')
    .select('standard_credits, premium_credits')
    .eq('user_id', userId)
    .single()

  if (existing && existing.standard_credits >= 99999) {
    return res.status(400).json({ error: 'This code has already been applied to your account' })
  }

  const { error } = await supabase
    .from('credits')
    .upsert(
      { user_id: userId, standard_credits: 99999, premium_credits: 99999 },
      { onConflict: 'user_id' }
    )

  if (error) return res.status(500).json({ error: 'Failed to apply promo code' })

  res.json({ success: true, message: 'Promo code applied — unlimited queries unlocked!' })

 
})
// Get user credits + chats
app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const [credits, chats] = await Promise.all([
      getCredits(req.user.id),
      getUserChats(req.user.id),
    ])
    res.json({ credits, chats })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// In-memory rate limiter: max 5 feedback submissions per user per hour
const feedbackRateLimit = new Map()
function checkFeedbackRateLimit(key) {
  const now = Date.now()
  const window = 60 * 60 * 1000 // 1 hour
  const max = 5
  const timestamps = (feedbackRateLimit.get(key) || []).filter(t => now - t < window)
  if (timestamps.length >= max) return false
  feedbackRateLimit.set(key, [...timestamps, now])
  return true
}

// Feedback endpoint
app.post('/api/feedback', requireAuth, async (req, res) => {
  const { feedback, email } = req.body
  const userId = req.user.id
  const userEmail = email || req.user.email || 'Anonymous'

  if (!feedback || feedback.trim().length < 10) {
    return res.status(400).json({ error: 'Feedback must be at least 10 characters' })
  }
  if (feedback.trim().length > 5000) {
    return res.status(400).json({ error: 'Feedback must be under 5000 characters' })
  }
  if (!checkFeedbackRateLimit(userId)) {
    return res.status(429).json({ error: 'Too many submissions. Please wait before sending more feedback.' })
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured')
    return res.status(500).json({ error: 'Email service not configured — add RESEND_API_KEY to Railway env vars' })
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: 'constantin.n.riegler@gmail.com',
      subject: `VELE AI Feedback from ${userEmail}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#a855f7">VELE AI Feedback</h2>
          <p><strong>From:</strong> ${userEmail}</p>
          <p><strong>User ID:</strong> ${userId}</p>
          <hr style="border:1px solid #eee;margin:20px 0">
          <p style="white-space:pre-wrap;font-size:15px;line-height:1.6">${feedback.trim()}</p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ error: 'Failed to send email' })
    }

    console.log(`Feedback sent from ${userEmail} (${userId})`)
    res.json({ ok: true })
  } catch (err) {
    console.error('Feedback send error:', err)
    res.status(500).json({ error: 'Failed to send feedback' })
  }
})

// Delete all chats for authenticated user
app.delete('/api/chats/all', requireAuth, async (req, res) => {
  try {
    await deleteAllChats(req.user.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete a chat
app.delete('/api/chats/:id', requireAuth, async (req, res) => {
  try {
    await deleteChat(req.user.id, req.params.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(err.message === 'Chat not found or access denied' ? 403 : 500).json({ error: err.message })
  }
})

// Create Stripe checkout session
app.post('/api/checkout', requireAuth, async (req, res) => {
  const { packId } = req.body
  const pack = PACKS[packId]
  if (!pack) return res.status(400).json({ error: 'Invalid pack' })

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: pack.name },
          unit_amount: pack.amount_cents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://consensusai-three.vercel.app?payment=success',
      cancel_url: 'https://consensusai-three.vercel.app?payment=cancelled',
      metadata: {
        userId: req.user.id,
        packId,
      },
    })
    res.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Standard query
app.post('/api/query', requireAuth, async (req, res) => {
 const { prompt, attachment, useWebSearch, conversationHistory = [] } = req.body
 const history = conversationHistory.slice(-20)

  try {
    await deductCredit(req.user.id, 'standard')
  } catch (err) {
    if (err.message === 'INSUFFICIENT_CREDITS') {
      return res.status(402).json({ error: 'INSUFFICIENT_CREDITS' })
    }
    return res.status(500).json({ error: err.message })
  }

  try {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.write(`data: ${JSON.stringify({ type: 'status', message: 'Asking GPT-4o, Claude, DeepSeek, and Grok simultaneously...' })}\n\n`)

   const result = await router(prompt, attachment, (chunk) => {
  res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`)
}, useWebSearch, history)

    // Save to DB in background
    saveChat(req.user.id, prompt.slice(0, 40), 'standard')
      .then(chatId => saveMessages(chatId, prompt, result, 'standard'))
      .catch(e => console.error('Save error:', e))

    res.write(`data: ${JSON.stringify({ type: 'done', answer: result.synthesis, individual: result.individual, sources: result.sources || [] })}\n\n`)
    res.end()
  } catch (err) {
    console.error('FULL ERROR:', err)
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`)
    res.end()
  }
})

// Premium query
app.post('/api/query/premium', requireAuth, async (req, res) => {
  const { prompt, attachment, useWebSearch, conversationHistory = [] } = req.body
  const history = conversationHistory.slice(-20)

  try {
    await deductCredit(req.user.id, 'premium')
  } catch (err) {
    if (err.message === 'INSUFFICIENT_CREDITS') {
      return res.status(402).json({ error: 'INSUFFICIENT_CREDITS' })
    }
    return res.status(500).json({ error: err.message })
  }

  try {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const result = await premiumRouter(prompt, attachment, (event) => {
  res.write(`data: ${JSON.stringify(event)}\n\n`)
}, useWebSearch, history)

    // Save to DB in background
    saveChat(req.user.id, prompt.slice(0, 40), 'premium')
      .then(chatId => saveMessages(chatId, prompt, result, 'premium'))
      .catch(e => console.error('Save error:', e))

    res.write(`data: ${JSON.stringify({
      type: 'done',
      answer: result.synthesis,
      individual: result.individual,
      rounds: result.rounds,
      votes: result.votes,
      voteResponses: result.voteResponses,
      resolution: result.resolution,
      sources: result.sources || [],
    })}\n\n`)
    res.end()
  } catch (err) {
    console.error('PREMIUM ERROR:', err)
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`)
    res.end()
  }
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
})

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})