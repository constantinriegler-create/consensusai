// Debate helpers — each model argues for its answer + critiques others,
// returns an updated answer for the next round.

const MODEL_NAMES = ['GPT-4o', 'Claude', 'DeepSeek', 'Grok']

function buildDebatePrompt(originalQuestion, myAnswer, otherAnswers, myName, round) {
  const others = otherAnswers
    .map((a, i) => `${MODEL_NAMES.filter(n => n !== myName)[i]}:\n${a}`)
    .join('\n\n---\n\n')

  return `You are ${myName}. You previously answered this question:

ORIGINAL QUESTION: ${originalQuestion}

YOUR PREVIOUS ANSWER:
${myAnswer}

The other AI models gave these answers:

${others}

This is debate round ${round} of 2. Your task:

1. Identify the strongest point in the OTHER answers that your own answer missed or got wrong.
2. If another answer is clearly better on any point, genuinely incorporate it. Do NOT cling to your original answer out of pride.
3. If your answer is genuinely better on a point, briefly explain why.
4. Output your UPDATED answer — incorporating the best insights from everyone, including yourself. Your updated answer should stand alone as a complete response to the original question.

Be honest. Intellectual humility matters more than winning.

Respond with ONLY your updated answer. No preamble, no "After considering..." — just the answer itself, as if you were answering the original question again with better information.`
}

export function makeDebatePrompt(originalQuestion, myAnswer, otherAnswers, myName, round) {
  return buildDebatePrompt(originalQuestion, myAnswer, otherAnswers, myName, round)
}

export function makeVotePrompt(originalQuestion, myName, finalAnswers) {
  const labeled = finalAnswers
    .map((a, i) => `[${'ABCD'[i]}] ${MODEL_NAMES[i]}:\n${a}`)
    .join('\n\n---\n\n')

  return `You are ${myName}. You must vote for the best answer to this question, considering accuracy, completeness, and clarity.

ORIGINAL QUESTION: ${originalQuestion}

CANDIDATE ANSWERS:

${labeled}

IMPORTANT RULES:
- Vote honestly based on quality alone, NOT on which model wrote it.
- You are strongly biased to vote for your own answer (${myName}, option ${'ABCD'[MODEL_NAMES.indexOf(myName)]}). Fight this bias. Only vote for yourself if you are absolutely certain your answer is the best.
- If two answers are tied, pick the one most precise and factually accurate.

Respond in this EXACT format on a single line:
VOTE: X — [brief one-sentence justification]

Where X is A, B, C, or D. No other text before or after.`
}

export { MODEL_NAMES }