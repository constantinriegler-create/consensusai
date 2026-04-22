import './env.js'
import express from 'express'
import cors from 'cors'
import { router } from './orchestrator/router.js'
import { premiumRouter } from './orchestrator/premium.js'
import { requireAuth, getCredits, deductCredit, saveChat, saveMessages, getUserChats } from './auth.js'
import { stripe, PACKS } from './stripe.js'
import supabase from './supabase.js'

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
    const { userId, packType } = session.metadata
    const pack = PACKS[packType]

    if (!pack || !userId) {
      console.error('Missing metadata in webhook:', session.metadata)
      return res.status(400).json({ error: 'Invalid metadata' })
    }

    const col = packType === 'premium' ? 'premium_credits' : 'standard_credits'
    const { data: credits } = await supabase
      .from('credits')
      .select(col)
      .eq('user_id', userId)
      .single()

    await supabase
      .from('credits')
      .update({ [col]: (credits?.[col] || 0) + pack.credits })
      .eq('user_id', userId)

    await supabase
      .from('payments')
      .insert({
        user_id: userId,
        stripe_payment_id: session.payment_intent || session.id,
        pack_type: packType,
        credits_added: pack.credits,
        amount_cents: pack.amount_cents,
      })

    console.log(`✅ Added ${pack.credits} ${packType} credits to user ${userId}`)
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

 const { error } = await supabase
    .from('credits')
    .upsert(
      { user_id: userId, standard_credits: 99999, premium_credits: 99999 },
      { onConflict: 'user_id' }
    )

  if (error) return res.status(500).json({ error: 'Failed to apply promo code' })

  res.json({ success: true, message: 'Promo code applied - unlimited queries unlocked!' })

 
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

// Create Stripe checkout session
app.post('/api/checkout', requireAuth, async (req, res) => {
  const { packType } = req.body
  const pack = PACKS[packType]
  if (!pack) return res.status(400).json({ error: 'Invalid pack type' })

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
        packType,
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
  const { prompt, attachment } = req.body

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
    })

    // Save to DB in background
    saveChat(req.user.id, prompt.slice(0, 40), 'standard')
      .then(chatId => saveMessages(chatId, prompt, result, 'standard'))
      .catch(e => console.error('Save error:', e))

    res.write(`data: ${JSON.stringify({ type: 'done', answer: result.synthesis, individual: result.individual })}\n\n`)
    res.end()
  } catch (err) {
    console.error('FULL ERROR:', err)
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`)
    res.end()
  }
})

// Premium query
app.post('/api/query/premium', requireAuth, async (req, res) => {
  const { prompt, attachment } = req.body

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
    })

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