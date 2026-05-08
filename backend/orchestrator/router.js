import { callOpenAI } from '../providers/openai.js'
import { callAnthropic } from '../providers/anthropic.js'
import { callDeepSeek } from '../providers/deepseek.js'
import { callGrok } from '../providers/grok.js'
import { synthesize } from '../synthesizer/synthesize.js'
import { searchWeb, formatSearchContext } from '../tavily.js'

export async function router(prompt, attachment, onChunk, useWebSearch = false) {
  // Step 1: optionally fetch web context first
  let augmentedPrompt = prompt
  let sources = []
  if (useWebSearch) {
    onChunk('Searching the web...')
    const searchData = await searchWeb(prompt)
    sources = (searchData?.results || []).map(r => ({ title: r.title, url: r.url }))
    const webContext = formatSearchContext(searchData)
    augmentedPrompt = webContext ? `${prompt}${webContext}` : prompt
  }

  onChunk('Querying GPT-4o, Claude, DeepSeek, and Grok in parallel...')

  const results = await Promise.all([
    callOpenAI(augmentedPrompt, attachment).catch(e => `OpenAI error: ${e.message}`),
    callAnthropic(augmentedPrompt, attachment).catch(e => `Anthropic error: ${e.message}`),
    callDeepSeek(augmentedPrompt, attachment).catch(e => `DeepSeek error: ${e.message}`),
    callGrok(augmentedPrompt, attachment).catch(e => `Grok error: ${e.message}`),
  ])

  onChunk('All models responded. Synthesizing...')

  const combined = await synthesize(prompt, results, onChunk)
  if (sources.length) combined.sources = sources
  return {
    synthesis: combined,
    individual: {
      openai: results[0],
      claude: results[1],
      deepseek: results[2],
      grok: results[3],
    },
    sources,
  }
}