import { callOpenAI } from '../providers/openai.js'
import { callAnthropic } from '../providers/anthropic.js'
import { synthesize } from '../synthesizer/synthesize.js'

export async function router(prompt, keys) {
  const results = await Promise.all([
    callOpenAI(prompt, keys.openai).catch(e => `OpenAI error: ${e.message}`),
    callAnthropic(prompt, keys.anthropic).catch(e => `Anthropic error: ${e.message}`),
  ])

  const combined = await synthesize(prompt, results, keys.anthropic)
  return { synthesis: combined, individual: { openai: results[0], claude: results[1] } }
}