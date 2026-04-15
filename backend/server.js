import express from 'express'
import cors from 'cors'
import { router } from './orchestrator/router.js'

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/query', async (req, res) => {
  const { prompt, keys } = req.body
  try {
    const result = await router(prompt, keys)
    console.log('Result type:', typeof result)
    console.log('Result:', JSON.stringify(result))
    res.json({ answer: result.synthesis, individual: result.individual })
  } catch (err) {
    console.error('FULL ERROR:', err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})