import { callOpenAI } from '../providers/openai.js'
import { callAnthropic } from '../providers/anthropic.js'
import { callDeepSeek } from '../providers/deepseek.js'
import { callGrok } from '../providers/grok.js'
import { synthesize } from '../synthesizer/synthesize.js'

export async function router(prompt, attachment, onChunk) {
  onChunk('Querying GPT-4o, Claude, DeepSeek, and Grok in parallel...')

  const results = await Promise.all([
    callOpenAI(prompt, attachment).catch(e => `OpenAI error: ${e.message}`),
    callAnthropic(prompt, attachment).catch(e => `Anthropic error: ${e.message}`),
    callDeepSeek(prompt, attachment).catch(e => `DeepSeek error: ${e.message}`),
    callGrok(prompt, attachment).catch(e => `Grok error: ${e.message}`),
  ])

  onChunk('All models responded. Synthesizing...')

  const combined = await synthesize(prompt, results, onChunk)
  return {
    synthesis: combined,
    individual: {
      openai: results[0],
      claude: results[1],
      deepseek: results[2],
      grok: results[3],
    }
  }
}