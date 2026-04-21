import { callOpenAI } from '../providers/openai.js'
import { callAnthropic } from '../providers/anthropic.js'
import { callDeepSeek } from '../providers/deepseek.js'
import { callGrok } from '../providers/grok.js'
import { synthesize } from '../synthesizer/synthesize.js'
import { makeDebatePrompt, makeVotePrompt, MODEL_NAMES } from '../providers/debate.js'

const CALLERS = [callOpenAI, callAnthropic, callDeepSeek, callGrok]

async function callAll(prompts, attachment) {
  return Promise.all(
    CALLERS.map((caller, i) =>
      caller(prompts[i], attachment).catch(e => `[${MODEL_NAMES[i]} error: ${e.message}]`)
    )
  )
}

function otherAnswers(answers, excludeIndex) {
  return answers.filter((_, i) => i !== excludeIndex)
}

// Strip lines like "As GPT-4o," / "I am Claude" / "Grok here" so models can't
// identify their own answers during voting.
function stripIdentityMarkers(text) {
  if (!text) return text
  const patterns = [
    /\b(?:as|i'm|i am|this is|here is)\s+(?:gpt-?4o?|chatgpt|openai|claude|anthropic|deepseek|grok|xai)\b[,:.]?/gi,
    /\b(?:gpt-?4o?|chatgpt|openai|claude|anthropic|deepseek|grok|xai)(?:'s|\s+(?:answer|response|model|ai))\b/gi,
    /^\s*(?:GPT-?4o?|Claude|DeepSeek|Grok)\s*[:\-—]\s*/gim,
  ]
  let cleaned = text
  for (const pattern of patterns) {
    cleaned = cleaned.replace(pattern, '')
  }
  return cleaned.trim()
}

// Create a random permutation of [0, 1, 2, 3]
function randomPermutation() {
  const arr = [0, 1, 2, 3]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function parseVote(voteText) {
  const match = voteText.match(/VOTE:\s*([ABCD])/i)
  if (match) return match[1].toUpperCase()
  return null
}

function tallyVotes(votes) {
  const counts = { A: 0, B: 0, C: 0, D: 0 }
  votes.forEach(v => { if (v) counts[v]++ })
  return counts
}

function resolveWinner(counts) {
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const [topLetter, topCount] = sorted[0]
  const [, secondCount] = sorted[1]

  if (topCount >= 3) return { type: 'consensus', winner: topLetter, counts }
  if (topCount > secondCount) return { type: 'majority', winner: topLetter, counts }
  return { type: 'tie', counts }
}

export async function premiumRouter(prompt, attachment, onEvent) {
  // Round 0: initial answers
  onEvent({ type: 'status', message: 'Round 0: Getting initial answers from all 4 models...' })
  const round0 = await callAll(Array(4).fill(prompt), attachment)
  onEvent({ type: 'round', round: 0, answers: round0 })

  // Round 1: debate
  onEvent({ type: 'status', message: 'Round 1: Models debating and refining answers...' })
  const round1Prompts = round0.map((myAnswer, i) =>
    makeDebatePrompt(prompt, myAnswer, otherAnswers(round0, i), MODEL_NAMES[i], 1)
  )
  const round1 = await callAll(round1Prompts, null)
  onEvent({ type: 'round', round: 1, answers: round1 })

  // Round 2: final debate
  onEvent({ type: 'status', message: 'Round 2: Models locking in final answers...' })
  const round2Prompts = round1.map((myAnswer, i) =>
    makeDebatePrompt(prompt, myAnswer, otherAnswers(round1, i), MODEL_NAMES[i], 2)
  )
  const finalAnswers = await callAll(round2Prompts, null)
  onEvent({ type: 'round', round: 2, answers: finalAnswers })

  // Strip identity markers before voting
  const anonymizedAnswers = finalAnswers.map(stripIdentityMarkers)

  // Build per-voter shuffled prompts.
  // Each voter gets a private permutation: permutations[voterIdx][slotIdx] = realModelIdx
  // e.g., permutations[0] = [2, 0, 3, 1] means voter 0 sees DeepSeek as A, GPT-4o as B, Grok as C, Claude as D
  onEvent({ type: 'status', message: 'Voting (blind)...' })
  const permutations = MODEL_NAMES.map(() => randomPermutation())

  const votePrompts = MODEL_NAMES.map((voterName, voterIdx) => {
    const perm = permutations[voterIdx]
    // Show the voter the answers in their private order, without any model names
    const shuffledAnswers = perm.map(realIdx => anonymizedAnswers[realIdx])
    return makeBlindVotePrompt(prompt, shuffledAnswers)
  })

  const voteResponses = await callAll(votePrompts, null)

  // Each vote letter refers to the voter's private ordering.
  // Translate: voter i votes "A" → real model = permutations[i][0]
  const letterToIdx = { A: 0, B: 1, C: 2, D: 3 }
  const realVotes = voteResponses.map((resp, voterIdx) => {
    const letter = parseVote(resp)
    if (!letter) return null
    const slotIdx = letterToIdx[letter]
    const realIdx = permutations[voterIdx][slotIdx]
    return 'ABCD'[realIdx] // convert back to a stable letter referring to the real model
  })

  const counts = tallyVotes(realVotes)
  onEvent({
    type: 'votes',
    votes: realVotes,
    counts,
    voteResponses,
    permutations,
  })

  // Resolve winner
  const resolution = resolveWinner(counts)

  let finalSynthesis
  if (resolution.type === 'tie') {
    onEvent({ type: 'status', message: 'Split vote — Claude is resolving the tiebreaker...' })
    finalSynthesis = await synthesize(prompt, finalAnswers, (chunk) => {
      onEvent({ type: 'chunk', text: chunk })
    })
    finalSynthesis.confidence = finalSynthesis.confidence || 'Medium'
  } else {
    const winnerIndex = 'ABCD'.indexOf(resolution.winner)
    const winnerAnswer = finalAnswers[winnerIndex]
    finalSynthesis = {
      summary: winnerAnswer,
      agreed: [],
      partial: [],
      conflicted: [],
      confidence: resolution.type === 'consensus' ? 'High' : 'Medium',
    }
    for (const chunk of winnerAnswer.match(/.{1,10}/g) || []) {
      onEvent({ type: 'chunk', text: chunk })
      await new Promise(r => setTimeout(r, 5))
    }
  }

  return {
    synthesis: finalSynthesis,
    resolution,
    rounds: { 0: round0, 1: round1, 2: finalAnswers },
    votes: realVotes,
    voteResponses,
    individual: {
      openai: finalAnswers[0],
      claude: finalAnswers[1],
      deepseek: finalAnswers[2],
      grok: finalAnswers[3],
    },
  }
}

// Blind version of the vote prompt: no model names, no self-identification,
// just labeled answers A/B/C/D.
function makeBlindVotePrompt(originalQuestion, shuffledAnswers) {
  const labeled = shuffledAnswers
    .map((a, i) => `[${'ABCD'[i]}]\n${a}`)
    .join('\n\n---\n\n')

  return `You are evaluating four candidate answers to the question below. You do NOT know which AI wrote each answer — they are presented anonymously.

Vote for the BEST answer based on accuracy, completeness, and clarity. Judge only on the content of each answer. One of the answers may be the one you yourself wrote — you cannot tell, and it does not matter. Pick the best one.

ORIGINAL QUESTION: ${originalQuestion}

CANDIDATE ANSWERS:

${labeled}

Respond in this EXACT format on a single line:
VOTE: X — [brief one-sentence justification]

Where X is A, B, C, or D. No other text before or after.`
}