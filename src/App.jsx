import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

const AMBER = '#e8e8e8'
const AMBER_DIM = '#1a1a1a'
const BG = '#080808'
const SURFACE = '#0f0f0f'
const CARD = '#141414'
const BORDER = '#222'
const BORDER2 = '#1a1a1a'
const TEXT = '#e8e6e0'
const MUTED = '#555'
const MUTED2 = '#333'
const GREEN = '#22c55e'
const YELLOW = '#888888'
const RED = '#ef4444'
const PURPLE = '#a855f7'

const MODEL_META = [
  { key: 'openai', label: 'GPT-4o', color: '#10a37f' },
  { key: 'claude', label: 'Claude', color: '#cc785c' },
  { key: 'deepseek', label: 'DeepSeek', color: '#4d6bfe' },
  { key: 'grok', label: 'Grok', color: '#e8e8e8' },
]

const FEATURE_DETAILS = [
  { label: 'Multi-model', desc: '4 models answer in parallel', detail: 'Your prompt is sent simultaneously to GPT-4o, Claude, DeepSeek, and Grok — four of the most capable AI models, from four different labs. Each answers independently before synthesis begins.' },
  { label: 'Consensus', desc: 'Agreement and conflict mapped visually', detail: 'A synthesis pass analyzes where the models agreed, partially overlapped, or genuinely conflicted. Color-coded: green for consensus, yellow for partial, red for conflict.' },
  { label: 'Debate (Premium)', desc: '4 models debate and vote blindly on the best answer', detail: 'In Premium mode, the four models go through 2 rounds of debate where each critiques the others and updates its own answer. Then they vote blindly — they don\'t know which answer is whose — on the best final response. Majority wins, ties broken by Claude.' },
  { label: 'Transparency', desc: 'See every response and every vote', detail: 'Every answer includes a "view source responses" button showing each model\'s individual output. In Premium, you also see the full debate history and how each model voted.' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function FormattedText({ text }) {
  if (!text) return null

  let cleaned = text
    .replace(/\\times/g, '×').replace(/\\cdot/g, '·').replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±').replace(/\\neq/g, '≠').replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt/g, '√').replace(/\\leq/g, '≤').replace(/\\geq/g, '≥')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\$([^$]+)\$/g, (match, inner) => {
      return '$' + inner.replace(/\\times/g, '×').replace(/\\sqrt/g, '√') + '$'
    })

  cleaned = cleaned.replace(/(?<![a-zA-Z0-9])\$(?!\$)(?![^$]*\$)/g, '')
  const parts = cleaned.split(/(```[\s\S]*?```|\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g)

  return (
    <div style={{ fontSize: 15, lineHeight: 1.85, color: '#e8e6e0' }}>
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3).replace(/^\w+\n/, '')
          return (
            <div key={i} style={{ background: '#141414', border: '1px solid #252525', borderRadius: 8, padding: '14px 20px', margin: '14px 0', fontFamily: 'monospace', fontSize: 13, color: '#e8e8e8', overflowX: 'auto', borderLeft: '2px solid #e8e8e830' }}>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#444', letterSpacing: '0.1em', marginBottom: 8 }}>CODE</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{code}</pre>
            </div>
          )
        }
        if ((part.startsWith('$$') && part.endsWith('$$')) || (part.startsWith('$') && part.endsWith('$'))) {
          const math = part.replace(/^\$+|\$+$/g, '')
          const isBlock = part.startsWith('$$')
          if (isBlock) {
            return (
              <div key={i} style={{ background: '#141414', border: '1px solid #252525', borderRadius: 8, padding: '14px 20px', margin: '14px 0', fontFamily: 'monospace', fontSize: 15, color: '#e8e8e8', textAlign: 'center', borderLeft: '2px solid #e8e8e830' }}>
                <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#444', letterSpacing: '0.1em', marginBottom: 8 }}>FORMULA</div>
                {math}
              </div>
            )
          }
          const superscript = math
            .replace(/\^2/g, '²').replace(/\^3/g, '³').replace(/\^4/g, '⁴')
            .replace(/\^5/g, '⁵').replace(/\^6/g, '⁶').replace(/\^7/g, '⁷')
            .replace(/\^8/g, '⁸').replace(/\^9/g, '⁹').replace(/\^0/g, '⁰')
            .replace(/\^1/g, '¹').replace(/\^n/g, 'ⁿ').replace(/\^x/g, 'ˣ')
          return <span key={i} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 5, padding: '2px 8px', fontFamily: 'monospace', fontSize: 14, color: '#e8e8e8', display: 'inline', margin: '0 2px' }}>{superscript}</span>
        }
        return (
          <span key={i}>
            <ReactMarkdown components={{
              p: ({children}) => <span>{children}</span>,
              strong: ({children}) => <strong style={{ color: '#fff', fontWeight: 600 }}>{children}</strong>,
              em: ({children}) => <em style={{ color: '#aaa' }}>{children}</em>,
              h1: ({children}) => <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '20px 0 10px' }}>{children}</div>,
              h2: ({children}) => <div style={{ fontSize: 17, fontWeight: 600, color: '#ddd', margin: '18px 0 8px' }}>{children}</div>,
              h3: ({children}) => <div style={{ fontSize: 15, fontWeight: 600, color: '#bbb', margin: '14px 0 6px' }}>{children}</div>,
              ul: ({children}) => <ul style={{ paddingLeft: 20, margin: '8px 0' }}>{children}</ul>,
              ol: ({children}) => <ol style={{ paddingLeft: 20, margin: '8px 0' }}>{children}</ol>,
              li: ({children}) => <li style={{ color: '#aaa', marginBottom: 4, fontSize: 14 }}>{children}</li>,
              code: ({children}) => <span style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace', fontSize: 13, color: '#e8e8e8' }}>{children}</span>,
              blockquote: ({children}) => <div style={{ borderLeft: '2px solid #333', paddingLeft: 16, margin: '12px 0', color: '#666' }}>{children}</div>,
            }}>{part}</ReactMarkdown>
          </span>
        )
      })}
    </div>
  )
}

function ConfidenceBar({ color, points, label }) {
  if (!points || points.length === 0) return null
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }}/>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      {points.map((point, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'flex-start', paddingLeft: 14 }}>
          <div style={{ width: 2, minHeight: 16, background: color, opacity: 0.4, flexShrink: 0, marginTop: 3, borderRadius: 1 }}/>
          <span style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6 }}><FormattedText text={point} /></span>
        </div>
      ))}
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: 6, color: copied ? GREEN : MUTED, fontSize: 10, fontFamily: 'monospace', padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.05em', transition: 'color 0.2s' }}>
      {copied ? 'COPIED' : 'COPY'}
    </button>
  )
}

function IndividualAnswers({ individual }) {
  const [open, setOpen] = useState(false)
  if (!individual) return null
  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={() => setOpen(!open)}
        style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: 6, color: MUTED, fontSize: 11, fontFamily: 'monospace', padding: '5px 12px', cursor: 'pointer', letterSpacing: '0.05em' }}>
        {open ? '[ hide sources ]' : '[ view source responses ]'}
      </button>
      {open && (
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {MODEL_META.map(({ key, label, color }) => (
            <div key={key} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, borderTop: `2px solid ${color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color, letterSpacing: '0.1em' }}>{label.toUpperCase()}</div>
                <CopyButton text={individual[key]} />
              </div>
              <FormattedText text={individual[key]} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function VoteTally({ votes, counts, resolution }) {
  if (!votes || !counts) return null

  const badgeMeta = {
    consensus: { label: 'CONSENSUS', color: GREEN, desc: '3+ models voted for the same answer' },
    majority:  { label: 'MAJORITY',  color: YELLOW, desc: 'Most models agreed — split vote' },
    tie:       { label: 'TIEBREAKER', color: RED, desc: 'Vote was split — Claude resolved' },
  }
  const badge = badgeMeta[resolution?.type] || badgeMeta.majority
  const winnerIdx = 'ABCD'.indexOf(resolution?.winner)
  const winnerModel = winnerIdx >= 0 ? MODEL_META[winnerIdx] : null

  return (
    <div style={{ marginBottom: 16, padding: '20px 24px', background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, letterSpacing: '0.12em' }}>VOTE RESULTS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: badge.color }}/>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: badge.color, letterSpacing: '0.12em', fontWeight: 600 }}>{badge.label}</span>
        </div>
      </div>

      {winnerModel && resolution?.type !== 'tie' && (
        <div style={{ marginBottom: 16, fontSize: 12, color: '#aaa' }}>
          Winner: <span style={{ color: winnerModel.color, fontWeight: 600 }}>{winnerModel.label}</span>
          <span style={{ color: MUTED2, marginLeft: 8, fontSize: 11 }}>— {badge.desc}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        {MODEL_META.map((m, i) => {
          const letter = 'ABCD'[i]
          const count = counts[letter] || 0
          const isWinner = resolution?.winner === letter
          return (
            <div key={m.key} style={{
              background: isWinner ? `${m.color}15` : SURFACE,
              border: `1px solid ${isWinner ? m.color + '60' : BORDER2}`,
              borderRadius: 7, padding: '10px 12px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: m.color, letterSpacing: '0.08em', marginBottom: 4 }}>{m.label.toUpperCase()}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: isWinner ? m.color : '#888' }}>{count}</div>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: MUTED2, letterSpacing: '0.08em' }}>{count === 1 ? 'VOTE' : 'VOTES'}</div>
            </div>
          )
        })}
      </div>

      <div style={{ paddingTop: 12, borderTop: `1px solid ${BORDER2}` }}>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED2, letterSpacing: '0.1em', marginBottom: 8 }}>INDIVIDUAL VOTES</div>
        {votes.map((votedLetter, voterIdx) => {
          const voter = MODEL_META[voterIdx]
          const votedIdx = 'ABCD'.indexOf(votedLetter)
          const votedFor = votedIdx >= 0 ? MODEL_META[votedIdx] : null
          return (
            <div key={voterIdx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, marginBottom: 4, color: '#999' }}>
              <span style={{ color: voter.color, fontFamily: 'monospace', fontSize: 11, minWidth: 72 }}>{voter.label}</span>
              <span style={{ color: MUTED2 }}>→</span>
              {votedFor
                ? <span style={{ color: votedFor.color, fontFamily: 'monospace', fontSize: 11 }}>{votedFor.label}</span>
                : <span style={{ color: MUTED2, fontFamily: 'monospace', fontSize: 11 }}>(no vote parsed)</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DebateHistory({ rounds }) {
  const [open, setOpen] = useState(false)
  if (!rounds) return null
  const roundKeys = Object.keys(rounds).sort()

  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={() => setOpen(!open)}
        style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: 6, color: MUTED, fontSize: 11, fontFamily: 'monospace', padding: '5px 12px', cursor: 'pointer', letterSpacing: '0.05em' }}>
        {open ? '[ hide debate history ]' : '[ view debate history ]'}
      </button>
      {open && (
        <div style={{ marginTop: 12 }}>
          {roundKeys.map(rk => (
            <div key={rk} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.15em', marginBottom: 12 }}>
                ROUND {rk}{rk === '0' ? ' — INITIAL ANSWERS' : rk === '2' ? ' — FINAL ANSWERS' : ' — DEBATE'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {MODEL_META.map((m, i) => (
                  <div key={m.key} style={{ background: SURFACE, border: `1px solid ${BORDER2}`, borderRadius: 8, padding: 14, borderLeft: `2px solid ${m.color}60` }}>
                    <div style={{ fontSize: 9, fontFamily: 'monospace', color: m.color, letterSpacing: '0.1em', marginBottom: 8 }}>{m.label.toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: '#999', lineHeight: 1.6, maxHeight: 300, overflowY: 'auto' }}>
                      <FormattedText text={rounds[rk]?.[i]} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FeatureCard({ feature }) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  return (
    <div onClick={() => setOpen(!open)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: open ? '#141414' : hovered ? '#141414' : SURFACE, border: `1px solid ${open ? BORDER : BORDER2}`, borderRadius: 10, padding: '14px 16px', borderLeft: `2px solid ${open ? AMBER : AMBER + '30'}`, cursor: 'pointer', transition: 'all 0.15s', gridColumn: open ? 'span 2' : 'span 1' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: open ? 10 : 4 }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.06em' }}>{feature.label.toUpperCase()}</div>
        <div style={{ fontSize: 10, color: MUTED2, fontFamily: 'monospace' }}>{open ? '▲' : '▼'}</div>
      </div>
      <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginBottom: open ? 12 : 0 }}>{feature.desc}</div>
      {open && <div style={{ fontSize: 13, color: '#888', lineHeight: 1.7, borderTop: `1px solid ${BORDER2}`, paddingTop: 12 }}>{feature.detail}</div>}
    </div>
  )
}

function ChatItem({ chat, active, onSelect, onRename }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(chat.title)
  function save() { if (val.trim()) onRename(val.trim()); setEditing(false) }
  if (editing) {
    return (
      <div style={{ padding: '4px 6px', marginBottom: 2 }}>
        <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={save}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
          style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 5, color: '#e8e6e0', fontSize: 12, padding: '5px 8px', outline: 'none', boxSizing: 'border-box' }} />
      </div>
    )
  }
  return (
    <div onDoubleClick={() => { setVal(chat.title); setEditing(true) }} onClick={onSelect}
      style={{ padding: '8px 10px', borderRadius: 7, cursor: 'pointer', marginBottom: 2, background: active ? '#1a1a1a' : 'none', color: active ? TEXT : MUTED, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', borderLeft: active ? `2px solid ${AMBER}` : '2px solid transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.title}{chat.isPremium && <span style={{ color: PURPLE, marginLeft: 6, fontSize: 10 }}>◆</span>}</span>
      {active && <button onClick={e => { e.stopPropagation(); setVal(chat.title); setEditing(true) }} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 11, padding: '0 2px', flexShrink: 0 }}>✎</button>}
    </div>
  )
}

function ModelRow({ label, color, active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: active ? color : MUTED2, flexShrink: 0 }}/>
      <span style={{ fontSize: 12, color: active ? '#888' : MUTED2, fontFamily: 'monospace' }}>{label}</span>
    </div>
  )
}

function ModeToggle({ mode, setMode, disabled }) {
  return (
    <div style={{ display: 'inline-flex', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 7, padding: 2, fontSize: 11, fontFamily: 'monospace' }}>
      <button onClick={() => !disabled && setMode('standard')} disabled={disabled}
        style={{
          padding: '5px 12px', borderRadius: 5, border: 'none',
          background: mode === 'standard' ? AMBER : 'transparent',
          color: mode === 'standard' ? '#000' : MUTED,
          cursor: disabled ? 'default' : 'pointer', fontWeight: 600, letterSpacing: '0.05em', transition: 'all 0.15s',
        }}>STANDARD</button>
      <button onClick={() => !disabled && setMode('premium')} disabled={disabled}
        style={{
          padding: '5px 12px', borderRadius: 5, border: 'none',
          background: mode === 'premium' ? PURPLE : 'transparent',
          color: mode === 'premium' ? '#fff' : MUTED,
          cursor: disabled ? 'default' : 'pointer', fontWeight: 600, letterSpacing: '0.05em', transition: 'all 0.15s',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>◆ PREMIUM</button>
    </div>
  )
}

function PremiumProgress({ currentStatus, rounds }) {
  const stages = [
    { key: 'round-0', label: 'Initial answers' },
    { key: 'round-1', label: 'Round 1 of 2' },
    { key: 'round-2', label: 'Round 2 of 2' },
    { key: 'voting',  label: 'Blind vote' },
    { key: 'resolve', label: 'Resolving' },
  ]
  // Figure out current stage from status text heuristically
  const status = (currentStatus || '').toLowerCase()
  let active = 0
  if (status.includes('round 0') || status.includes('initial')) active = 0
  else if (status.includes('round 1')) active = 1
  else if (status.includes('round 2')) active = 2
  else if (status.includes('voting') || status.includes('blind')) active = 3
  else if (status.includes('tiebreak') || status.includes('resolving')) active = 4

  // Also use rounds count as evidence
  const roundsReceived = rounds ? Object.keys(rounds).length : 0
  if (roundsReceived > active) active = Math.min(roundsReceived, 3)

  return (
    <div style={{ padding: '20px 24px', background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 10, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.15em' }}>◆ PREMIUM DEBATE</div>
        <div style={{ flex: 1, height: 1, background: BORDER2 }}/>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED2 }}>~30s</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {stages.map((s, i) => {
          const isDone = i < active
          const isActive = i === active
          return (
            <div key={s.key} style={{
              flex: 1,
              padding: '8px 6px',
              borderRadius: 6,
              background: isDone ? `${PURPLE}20` : isActive ? `${PURPLE}10` : '#0a0a0a',
              border: `1px solid ${isDone ? PURPLE + '60' : isActive ? PURPLE : BORDER2}`,
              textAlign: 'center',
              transition: 'all 0.3s',
            }}>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: isDone || isActive ? PURPLE : MUTED2, letterSpacing: '0.06em', marginBottom: 2 }}>
                {isDone ? '✓' : isActive ? '●' : '○'}
              </div>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: isDone || isActive ? '#ccc' : MUTED2 }}>
                {s.label}
              </div>
            </div>
          )
        })}
      </div>
      {currentStatus && (
        <div style={{ marginTop: 14, fontSize: 11, fontFamily: 'monospace', color: '#888', letterSpacing: '0.05em' }}>
          {currentStatus}
        </div>
      )}
    </div>
  )
}

function App() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [statusText, setStatusText] = useState('')
  const [liveRounds, setLiveRounds] = useState(null)
  const [mode, setMode] = useState('standard')

  const [name, setName] = useState(() => localStorage.getItem('consensusai_name') || '')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [attachment, setAttachment] = useState(null)
  const [chats, setChats] = useState([{ id: 1, title: 'New chat', messages: [] }])
  const [activeChatId, setActiveChatId] = useState(1)
  const [keyHovered, setKeyHovered] = useState(false)
  const messagesEndRef = useRef(null)

  function handleFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAttachment({ data: reader.result.split(',')[1], type: file.type, name: file.name })
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    if (!prompt.trim() || loading) return
    const userMessage = prompt
    const isPremium = mode === 'premium'
    setPrompt('')
    const newMessages = [...messages, { role: 'user', content: userMessage, isPremium, attachment: attachment ? { name: attachment.name, type: attachment.type } : null }]
    setMessages(newMessages)
    setLoading(true)
    setStreamingText('')
    setStatusText('Connecting...')
    setLiveRounds(null)
    setAttachment(null)

    const endpoint = isPremium ? '/api/query/premium' : '/api/query'

    const res = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userMessage, attachment })
    })

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let streaming = ''
    const collectedRounds = {}

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const parsed = JSON.parse(line.slice(6))
          if (parsed.type === 'status') setStatusText(parsed.message)
          if (parsed.type === 'chunk') { streaming += parsed.text; setStreamingText(streaming) }
          if (parsed.type === 'round') {
            collectedRounds[parsed.round] = parsed.answers
            setLiveRounds({ ...collectedRounds })
          }
          if (parsed.type === 'done') {
            const assistantMsg = {
              role: 'assistant',
              isPremium,
              content: parsed.answer,
              individual: parsed.individual,
              rounds: parsed.rounds,
              votes: parsed.votes,
              voteResponses: parsed.voteResponses,
              resolution: parsed.resolution,
            }
            const finalMessages = [...newMessages, assistantMsg]
            setMessages(finalMessages)
            setChats(prev => prev.map(c =>
              c.id === activeChatId
                ? { ...c, title: userMessage.slice(0, 28) + (userMessage.length > 28 ? '...' : ''), isPremium, messages: finalMessages }
                : c
            ))
            setStreamingText('')
            setStatusText('')
            setLiveRounds(null)
            setLoading(false)
          }
          if (parsed.type === 'error') {
            setLoading(false); setStreamingText(''); setStatusText(''); setLiveRounds(null)
          }
        } catch(e) {}
      }
    }
  }

  function exportPDF(msg, question) {
    const content = `ConsensusAI Export\n${'='.repeat(50)}\n\nMode: ${msg.isPremium ? 'Premium (Debate)' : 'Standard'}\n\nQuestion: ${question}\n\nCombined Answer:\n${msg.content.summary}\n\nConfidence: ${msg.content.confidence}\n\n${msg.resolution ? `Vote result: ${msg.resolution.type.toUpperCase()} — winner: ${msg.resolution.winner}\n\n` : ''}GPT-4o:\n${msg.individual?.openai || ''}\n\nClaude:\n${msg.individual?.claude || ''}\n\nDeepSeek:\n${msg.individual?.deepseek || ''}\n\nGrok:\n${msg.individual?.grok || ''}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `consensusai-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function newChat() {
    const id = Date.now()
    setChats(prev => [...prev, { id, title: 'New chat', messages: [] }])
    setActiveChatId(id)
    setMessages([])
  }

  function switchChat(chat) {
    setActiveChatId(chat.id)
    setMessages(chat.messages)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: BG, color: TEXT, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      <input type="file" accept="image/*,.pdf,.txt,.md" style={{ display: 'none' }} id="file-input" onChange={e => handleFile(e.target.files[0])} />

      {showKeyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0f0f0f', border: `1px solid ${BORDER}`, borderRadius: 16, padding: 36, width: 440, borderTop: `2px solid ${AMBER}` }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.15em', marginBottom: 12 }}>SETTINGS</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6, color: TEXT }}>Your profile</h3>
            <p style={{ color: MUTED, fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>Personalize your experience.</p>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, letterSpacing: '0.1em', marginBottom: 6 }}>YOUR NAME</div>
              <input placeholder="Constantin" value={name} onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${BORDER}`, background: '#0a0a0a', color: TEXT, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { localStorage.setItem('consensusai_name', name); setShowKeyModal(false) }}
                style={{ flex: 1, padding: '11px', borderRadius: 8, background: AMBER, border: 'none', color: '#000', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Save
              </button>
              <button onClick={() => setShowKeyModal(false)}
                style={{ padding: '11px 18px', borderRadius: 8, background: 'none', border: `1px solid ${BORDER}`, color: MUTED, fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div style={{ width: 240, background: SURFACE, borderRight: `1px solid ${BORDER2}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${BORDER2}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>ConsensusAI</div>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.08em', marginTop: 2 }}>MULTI-MODEL SYNTHESIS</div>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: 16, padding: 4, lineHeight: 1 }}>✕</button>
            </div>
            <button onClick={newChat} style={{ width: '100%', padding: '8px 12px', borderRadius: 7, background: AMBER_DIM, border: `1px solid ${AMBER}30`, color: AMBER, fontSize: 12, cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}>
              + New chat
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: MUTED2, letterSpacing: '0.12em', padding: '0 8px', marginBottom: 6 }}>SESSIONS</div>
            {chats.slice().reverse().map(chat => (
              <ChatItem key={chat.id} chat={chat} active={chat.id === activeChatId}
                onSelect={() => switchChat(chat)}
                onRename={newTitle => setChats(prev => prev.map(c => c.id === chat.id ? { ...c, title: newTitle } : c))} />
            ))}
          </div>

          <div style={{ padding: '12px 16px', borderTop: `1px solid ${BORDER2}` }}>
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: MUTED2, letterSpacing: '0.12em', marginBottom: 10 }}>MODELS ONLINE</div>
            {MODEL_META.map(m => <ModelRow key={m.key} label={m.label} color={GREEN} active={true} />)}
            <ModelRow label="Synthesis (Claude)" color={GREEN} active={true} />

            <button
              onClick={() => setShowKeyModal(true)}
              onMouseEnter={() => setKeyHovered(true)}
              onMouseLeave={() => setKeyHovered(false)}
              style={{
                marginTop: 10, width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 7,
                background: keyHovered ? '#0f2a0f' : '#0a1a0a',
                border: `1px solid ${keyHovered ? '#2a5a2a' : '#1a3a1a'}`,
                color: GREEN, fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', transition: 'all 0.15s',
                transform: keyHovered ? 'scale(1.02)' : 'scale(1)',
              }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, flexShrink: 0, boxShadow: keyHovered ? `0 0 8px ${GREEN}` : 'none', transition: 'box-shadow 0.15s' }}/>
              {name ? name.toUpperCase() : 'SETTINGS'}
            </button>

            <div style={{ marginTop: 16, fontSize: 10, color: MUTED2, fontFamily: 'monospace', lineHeight: 1.8 }}>
              by Constantin Riegler
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${BORDER2}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: 6, color: MUTED, cursor: 'pointer', fontSize: 12, padding: '4px 10px', fontFamily: 'monospace' }}>☰</button>
          )}
          <div style={{ flex: 1 }}/>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED2, letterSpacing: '0.08em' }}>{timeStr}</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN }}/>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN }}/>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN }}/>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN }}/>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '48px 0' }}>
          {messages.length === 0 && !loading && (
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 32px' }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.15em', marginBottom: 16 }}>CONSENSUSAI / TERMINAL</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 12 }}>
                {getGreeting()}{name ? `, ${name}` : ''}.
              </div>
              <div style={{ fontSize: 15, color: MUTED, marginBottom: 48, lineHeight: 1.7 }}>
                Ask anything. Your question goes to multiple AI models simultaneously. In Premium, they debate and vote on the best answer.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {FEATURE_DETAILS.map((f, i) => <FeatureCard key={i} feature={f} />)}
              </div>
              <div style={{ fontSize: 11, color: MUTED2, fontFamily: 'monospace', marginBottom: 32, letterSpacing: '0.06em' }}>CREATED BY CONSTANTIN RIEGLER</div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ maxWidth: 720, margin: '0 auto 48px', padding: '0 32px' }}>
              {msg.role === 'user' ? (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED2, letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>QUERY</span>
                    {msg.isPremium && <span style={{ color: PURPLE }}>◆ PREMIUM</span>}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, lineHeight: 1.3, borderLeft: `3px solid ${msg.isPremium ? PURPLE : AMBER}`, paddingLeft: 16 }}>
                    {msg.content}
                  </div>
                  {msg.attachment && <div style={{ marginTop: 8, paddingLeft: 19, fontSize: 11, fontFamily: 'monospace', color: MUTED }}>+ {msg.attachment.name}</div>}
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: msg.isPremium ? PURPLE : AMBER, letterSpacing: '0.1em' }}>
                      {msg.isPremium ? '◆ DEBATE WINNER' : 'SYNTHESIS'}
                    </div>
                    <div style={{ flex: 1, height: '1px', background: BORDER2 }}/>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED2, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '2px 8px' }}>
                      {msg.content.confidence?.toUpperCase()} CONFIDENCE
                    </div>
                  </div>
                  <div style={{ marginBottom: 24, padding: '24px 28px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, borderLeft: `3px solid ${msg.isPremium ? PURPLE : AMBER}` }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, gap: 8 }}>
                      <CopyButton text={msg.content.summary} />
                      <button onClick={() => exportPDF(msg, messages[i-1]?.content || '')}
                        style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: 6, color: MUTED, fontSize: 10, fontFamily: 'monospace', padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.05em' }}>
                        EXPORT
                      </button>
                    </div>
                    <FormattedText text={msg.content.summary} />
                  </div>

                  {msg.isPremium && msg.votes && (
                    <VoteTally votes={msg.votes} counts={msg.resolution?.counts} resolution={msg.resolution} />
                  )}

                  {!msg.isPremium && (
                    <div style={{ marginBottom: 16, padding: '20px 24px', background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 10 }}>
                      <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, letterSpacing: '0.12em', marginBottom: 18 }}>SIGNAL ANALYSIS</div>
                      <ConfidenceBar color={GREEN} points={msg.content.agreed} label="Consensus" />
                      <ConfidenceBar color={YELLOW} points={msg.content.partial} label="Partial agreement" />
                      <ConfidenceBar color={RED} points={msg.content.conflicted} label="Conflicting signals" />
                      <div style={{ display: 'flex', gap: 16, marginTop: 8, paddingTop: 12, borderTop: `1px solid ${BORDER2}` }}>
                        {[[GREEN, 'Consensus'], [YELLOW, 'Partial'], [RED, 'Conflict']].map(([c, l]) => (
                          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: c }}/>
                            <span style={{ fontSize: 10, color: MUTED2, fontFamily: 'monospace' }}>{l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <IndividualAnswers individual={msg.individual} />
                  {msg.isPremium && <DebateHistory rounds={msg.rounds} />}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 32px' }}>
              {mode === 'premium' && <PremiumProgress currentStatus={statusText} rounds={liveRounds} />}
              {mode === 'standard' && statusText && !streamingText && (
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, letterSpacing: '0.1em', marginBottom: 16 }}>{statusText.toUpperCase()}</div>
              )}
              {streamingText ? (
                <div style={{ padding: '24px 28px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, borderLeft: `3px solid ${mode === 'premium' ? PURPLE : AMBER}` }}>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: mode === 'premium' ? PURPLE : AMBER, letterSpacing: '0.1em', marginBottom: 12 }}>
                    {mode === 'premium' ? '◆ DEBATE WINNER — STREAMING' : 'SYNTHESIS — STREAMING'}
                  </div>
                  <FormattedText text={streamingText} />
                  <span style={{ display: 'inline-block', width: 2, height: 16, background: mode === 'premium' ? PURPLE : AMBER, marginLeft: 2, verticalAlign: 'middle', animation: 'blink 1s infinite' }}/>
                </div>
              ) : mode === 'standard' && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  {['GPT-4o', 'Claude', 'DeepSeek', 'Grok', 'Synthesis (Claude)'].map(m => (
                    <div key={m} style={{ fontSize: 11, fontFamily: 'monospace', color: MUTED, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 5, padding: '4px 10px' }}>{m} ···</div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <style>{`
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
          textarea::placeholder { color: #2a2a2a !important; }
        `}</style>

        <div style={{ padding: '16px 32px 20px', borderTop: `1px solid ${BORDER2}`, background: BG }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <ModeToggle mode={mode} setMode={setMode} disabled={loading} />
              {mode === 'premium' && (
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.08em' }}>
                  4 MODELS · 2 DEBATE ROUNDS · BLIND VOTE · ~30s
                </div>
              )}
            </div>
            {attachment && (
              <div style={{ marginBottom: 8, padding: '6px 12px', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 7, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: AMBER }}>+</span>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#aaa', flex: 1 }}>{attachment.name}</span>
                <button onClick={() => setAttachment(null)} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>✕</button>
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <textarea
                placeholder={mode === 'premium' ? 'Ask anything — models will debate it...' : 'Ask anything...'}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={e => { const file = e.clipboardData.files[0]; if (file) handleFile(file) }}
                rows={1}
                style={{ width: '100%', padding: '14px 100px 14px 20px', borderRadius: 10, border: `1px solid ${prompt ? (mode === 'premium' ? PURPLE : AMBER) + '40' : BORDER}`, background: SURFACE, color: TEXT, fontSize: 15, resize: 'none', lineHeight: 1.6, boxSizing: 'border-box', transition: 'border-color 0.2s', outline: 'none' }}
              />
              <div style={{ position: 'absolute', right: 10, bottom: 10, display: 'flex', gap: 6 }}>
                <button onClick={() => document.getElementById('file-input').click()}
                  style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 7, width: 36, height: 36, cursor: 'pointer', color: MUTED, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⊕</button>
                <button onClick={handleSubmit} disabled={loading}
                  style={{ background: prompt && !loading ? (mode === 'premium' ? PURPLE : AMBER) : MUTED2, border: 'none', borderRadius: 7, width: 36, height: 36, cursor: !loading && prompt ? 'pointer' : 'default', color: prompt ? '#fff' : '#555', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', fontWeight: 700 }}>↑</button>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: 10, fontFamily: 'monospace', color: MUTED2, marginTop: 8, letterSpacing: '0.05em' }}>
            ENTER TO SEND · PASTE OR CLICK ⊕ TO ATTACH
          </div>
        </div>
      </div>
    </div>
  )
}

export default App