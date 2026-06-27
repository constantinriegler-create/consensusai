import { callOpenAI } from '../providers/openai.js'
import { callAnthropic } from '../providers/anthropic.js'
import { callDeepSeek } from '../providers/deepseek.js'
import { callGrok } from '../providers/grok.js'
import { synthesize } from '../synthesizer/synthesize.js'
import { searchWeb, formatSearchContext } from '../tavily.js'
import { computeCost, printCostReport } from '../utils/costs.js'

const MODEL_LABELS   = ['GPT-4o', 'Claude', 'DeepSeek', 'Grok']
const PROVIDER_KEYS  = ['openai', 'anthropic', 'deepseek', 'grok']

export async function router(prompt, attachment, onChunk, useWebSearch = false, history = [], debug = false) {
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

  // 4 parallel model calls — usage captured from each response
  const raw = await Promise.all([
    callOpenAI(augmentedPrompt, attachment, history).catch(e => ({ text: `OpenAI error: ${e.message}`,    usage: { input: 0, output: 0 } })),
    callAnthropic(augmentedPrompt, attachment, history).catch(e => ({ text: `Anthropic error: ${e.message}`, usage: { input: 0, output: 0 } })),
    callDeepSeek(augmentedPrompt, attachment, history).catch(e => ({ text: `DeepSeek error: ${e.message}`,  usage: { input: 0, output: 0 } })),
    callGrok(augmentedPrompt, attachment, history).catch(e => ({ text: `Grok error: ${e.message}`,         usage: { input: 0, output: 0 } })),
  ])
  const results = raw.map(r => r.text)

  const costEntries = raw.map((r, i) => {
    const cost = computeCost(PROVIDER_KEYS[i], r.usage.input, r.usage.output)
    return { label: `Model — ${MODEL_LABELS[i]}`, provider: PROVIDER_KEYS[i], inputTokens: r.usage.input, outputTokens: r.usage.output, cost }
  })

  onChunk('All models responded. Synthesizing...')

  // 1 synthesis call (Claude streaming) — usage from SSE events via _synthUsage
  const combined = await synthesize(prompt, results, onChunk, history)
  if (combined._synthUsage) {
    const su = combined._synthUsage
    costEntries.push({
      label: 'Synthesis     (Claude)',
      provider: 'anthropic',
      inputTokens:  su.input,
      outputTokens: su.output,
      cost: computeCost('anthropic', su.input, su.output),
    })
    delete combined._synthUsage
  }

  // Log cost breakdown to Railway console
  const { totalIn, totalOut, totalCost } = printCostReport(costEntries)

  if (sources.length) combined.sources = sources

  const result = {
    synthesis: combined,
    individual: {
      openai:   results[0],
      claude:   results[1],
      deepseek: results[2],
      grok:     results[3],
    },
    sources,
  }

  if (debug) {
    result.debug_cost = { entries: costEntries, totalIn, totalOut, totalCostUSD: totalCost }
  }

  return result
}