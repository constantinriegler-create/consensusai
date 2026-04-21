import './env.js'
import express from 'express'
import cors from 'cors'
import { router } from './orchestrator/router.js'
import { premiumRouter } from './orchestrator/premium.js'

// Fail fast if keys are missing
const requiredEnv = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'DEEPSEEK_API_KEY', 'XAI_API_KEY']
for (const name of requiredEnv) {
  if (!process.env[name]) {
    console.error(`Missing required env var: ${name}`)
    process.exit(1)
  }
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '100mb' }))

// Standard tier (unchanged)
app.post('/api/query', async (req, res) => {
  const { prompt, attachment } = req.body
  try {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.write(`data: ${JSON.stringify({ type: 'status', message: 'Asking GPT-4o, Claude, DeepSeek, and Grok simultaneously...' })}\n\n`)

    const result = await router(prompt, attachment, (chunk) => {
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`)
    })

    res.write(`data: ${JSON.stringify({ type: 'done', answer: result.synthesis, individual: result.individual })}\n\n`)
    res.end()
  } catch (err) {
    console.error('FULL ERROR:', err)
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`)
    res.end()
  }
})

// Premium tier — debate + vote
app.post('/api/query/premium', async (req, res) => {
  const { prompt, attachment } = req.body
  try {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const result = await premiumRouter(prompt, attachment, (event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`)
    })

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