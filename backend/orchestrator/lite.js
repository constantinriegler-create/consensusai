import { callOpenAI }   from '../providers/openai.js'
import { callAnthropic } from '../providers/anthropic.js'
import { callDeepSeek }  from '../providers/deepseek.js'
import { callGrok }      from '../providers/grok.js'
import { searchWeb, formatSearchContext } from '../tavily.js'
import { computeCost, printCostReport }  from '../utils/costs.js'

const ROUTING_SYSTEM = `You are a model router. Given a user prompt, pick the single best model to answer it.

Rules:
- claude    → writing, editing, reasoning, nuanced/long-form text
- gpt       → general knowledge, broad/explanatory questions
- deepseek  → math, code, logic, technical tasks
- grok      → current events, casual tone, real-time/cultural topics

Respond with ONLY valid JSON, no markdown, no extra text:
{"model": "<claude|gpt|deepseek|grok>", "reason": "<one short phrase>"}`

const CALLERS = {
  claude:   callAnthropic,
  gpt:      callOpenAI,
  deepseek: callDeepSeek,
  grok:     callGrok,
}

const PROVIDER_KEYS = {
  claude:   'anthropic',
  gpt:      'openai',
  deepseek: 'deepseek',
  grok:     'grok',
}

const MODEL_LABELS = {
  claude:   'Claude',
  gpt:      'GPT-5.4',
  deepseek: 'DeepSeek',
  grok:     'Grok',
}

async function callDeepSeekRouting(prompt) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: ROUTING_SYSTEM },
        { role: 'user',   content: prompt },
      ],
      max_tokens: 60,
    }),
  })
  const data = await response.json()
  return {
    text:  data.choices?.[0]?.message?.content ?? '',
    usage: {
      input:  data.usage?.prompt_tokens     ?? 0,
      output: data.usage?.completion_tokens ?? 0,
    },
  }
}

export async function liteRouter(prompt, attachment, onChunk, useWebSearch = false, history = [], debug = false) {
  let augmentedPrompt = prompt
  let sources = []

  if (useWebSearch) {
    onChunk('Searching the web...')
    const searchData = await searchWeb(prompt)
    sources = (searchData?.results || []).map(r => ({ title: r.title, url: r.url }))
    const webContext = formatSearchContext(searchData)
    augmentedPrompt = webContext ? `${prompt}${webContext}` : prompt
  }

  // Step 1: route via DeepSeek
  onChunk('Routing to best model...')
  const routingRaw = await callDeepSeekRouting(prompt).catch(() => ({
    text: '{"model":"gpt","reason":"general knowledge"}',
    usage: { input: 0, output: 0 },
  }))

  let chosen = 'gpt'
  let reason = 'general knowledge'
  try {
    const parsed = JSON.parse(routingRaw.text.trim())
    if (parsed.model && CALLERS[parsed.model]) {
      chosen = parsed.model
      reason = parsed.reason || reason
    }
  } catch {
    // default to gpt
  }

  const modelLabel = MODEL_LABELS[chosen]
  onChunk(`Answering with ${modelLabel}...`)

  // Step 2: answer from chosen model
  const answerRaw = await CALLERS[chosen](augmentedPrompt, attachment, history)
    .catch(e => ({ text: `${modelLabel} error: ${e.message}`, usage: { input: 0, output: 0 } }))

  const costEntries = [
    {
      label:       'Routing      (DeepSeek)',
      provider:    'deepseek',
      inputTokens:  routingRaw.usage.input,
      outputTokens: routingRaw.usage.output,
      cost:         computeCost('deepseek', routingRaw.usage.input, routingRaw.usage.output),
    },
    {
      label:       `Answer       (${modelLabel})`,
      provider:    PROVIDER_KEYS[chosen],
      inputTokens:  answerRaw.usage.input,
      outputTokens: answerRaw.usage.output,
      cost:         computeCost(PROVIDER_KEYS[chosen], answerRaw.usage.input, answerRaw.usage.output),
    },
  ]

  // Normalize into the same synthesis shape used by standard/premium so
  // saveMessages and the frontend can use msg.content.summary without branching.
  const result = {
    synthesis: {
      summary:  answerRaw.text,
      routedTo: { model: chosen, label: modelLabel, reason },
    },
    individual: null,
    sources,
  }

  if (debug) {
    const { totalIn, totalOut, totalCost } = printCostReport(costEntries)
    result.debug_cost = { entries: costEntries, totalIn, totalOut, totalCostUSD: totalCost }
  }

  return result
}
