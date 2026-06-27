// ─── Pricing table ────────────────────────────────────────────────────────────
// All prices in USD per 1,000,000 tokens.
// TODO: Replace placeholder values with current prices from each provider's
//       pricing page before using these numbers for real spend analysis.
//
//  OpenAI:    https://openai.com/api/pricing
//  Anthropic: https://www.anthropic.com/pricing#api
//  DeepSeek:  https://api-docs.deepseek.com/quick_start/pricing
//  xAI (Grok):https://x.ai/api
// ─────────────────────────────────────────────────────────────────────────────
export const PRICING = {
  openai: {
    model:  'gpt-4o',
    input:  2.50,   // TODO: verify current gpt-4o input price  ($/1M tokens)
    output: 10.00,  // TODO: verify current gpt-4o output price ($/1M tokens)
  },
  anthropic: {
    model:  'claude-sonnet-4-6',
    input:  3.00,   // TODO: verify current claude-sonnet-4-6 input price
    output: 15.00,  // TODO: verify current claude-sonnet-4-6 output price
  },
  deepseek: {
    model:  'deepseek-chat',
    input:  0.27,   // TODO: verify current deepseek-chat input price
    output: 1.10,   // TODO: verify current deepseek-chat output price
  },
  grok: {
    model:  'grok-4-1-fast-non-reasoning',
    input:  5.00,   // TODO: verify current grok-4 input price
    output: 15.00,  // TODO: verify current grok-4 output price
  },
}

// ─── Core cost calculator ─────────────────────────────────────────────────────
export function computeCost(providerKey, inputTokens, outputTokens) {
  const p = PRICING[providerKey]
  if (!p) return 0
  return (inputTokens / 1e6) * p.input + (outputTokens / 1e6) * p.output
}

// ─── Console report ───────────────────────────────────────────────────────────
// entries: [{ label, provider, inputTokens, outputTokens, cost }]
export function printCostReport(entries) {
  const line = '─'.repeat(72)
  const hr   = '═'.repeat(72)

  let totalIn = 0, totalOut = 0, totalCost = 0

  console.log(`\n${hr}`)
  console.log('  PREMIUM QUERY — COST BREAKDOWN')
  console.log(hr)
  console.log(
    '  ' + padR('Stage', 26) +
    padL('Input tok', 12) +
    padL('Output tok', 12) +
    padL('Cost (USD)', 13)
  )
  console.log(`  ${line}`)

  for (const e of entries) {
    totalIn   += e.inputTokens
    totalOut  += e.outputTokens
    totalCost += e.cost
    console.log(
      '  ' + padR(e.label, 26) +
      padL(e.inputTokens.toLocaleString(), 12) +
      padL(e.outputTokens.toLocaleString(), 12) +
      padL(`$${e.cost.toFixed(5)}`, 13)
    )
  }

  console.log(`  ${line}`)
  console.log(
    '  ' + padR('TOTAL', 26) +
    padL(totalIn.toLocaleString(), 12) +
    padL(totalOut.toLocaleString(), 12) +
    padL(`$${totalCost.toFixed(5)}`, 13)
  )
  console.log(`${hr}\n`)

  return { totalIn, totalOut, totalCost }
}

function padR(s, n) { return String(s).padEnd(n, ' ') }
function padL(s, n) { return String(s).padStart(n, ' ') }
