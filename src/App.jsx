import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import supabase from './supabase.js'

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
  { label: 'Multi-model', desc: '4 models answer in parallel', detail: 'Your prompt is sent simultaneously to GPT-4o, Claude, DeepSeek, and Grok. Each answers independently before synthesis begins.' },
  { label: 'Consensus', desc: 'Agreement and conflict mapped visually', detail: 'A synthesis pass analyzes where models agreed, partially overlapped, or conflicted. Color-coded: green for consensus, yellow for partial, red for conflict.' },
  { label: 'Debate (Premium)', desc: '4 models debate and vote blindly', detail: 'In Premium mode, models go through 2 rounds of debate, then vote blindly on the best answer. Majority wins, ties broken by Claude.' },
  { label: 'Transparency', desc: 'See every response and vote', detail: 'Every answer shows each model\'s individual output. Premium also shows the full debate history and how each model voted.' },
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
    .replace(/\$([^$]+)\$/g, (match, inner) => '$' + inner.replace(/\\times/g, '×').replace(/\\sqrt/g, '√') + '$')
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
          if (isBlock) return (
            <div key={i} style={{ background: '#141414', border: '1px solid #252525', borderRadius: 8, padding: '14px 20px', margin: '14px 0', fontFamily: 'monospace', fontSize: 15, color: '#e8e8e8', textAlign: 'center', borderLeft: '2px solid #e8e8e830' }}>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#444', letterSpacing: '0.1em', marginBottom: 8 }}>FORMULA</div>
              {math}
            </div>
          )
          const superscript = math.replace(/\^2/g,'²').replace(/\^3/g,'³').replace(/\^n/g,'ⁿ')
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
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
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
    consensus: { label: 'CONSENSUS', color: GREEN },
    majority: { label: 'MAJORITY', color: YELLOW },
    tie: { label: 'TIEBREAKER', color: RED },
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
      {winnerModel && <div style={{ marginBottom: 16, fontSize: 12, color: '#aaa' }}>
        Winner: <span style={{ color: winnerModel.color, fontWeight: 600 }}>{winnerModel.label}</span>
      </div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        {MODEL_META.map((m, i) => {
          const letter = 'ABCD'[i]
          const count = counts[letter] || 0
          const isWinner = resolution?.winner === letter
          return (
            <div key={m.key} style={{ background: isWinner ? `${m.color}15` : SURFACE, border: `1px solid ${isWinner ? m.color + '60' : BORDER2}`, borderRadius: 7, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: m.color, marginBottom: 4 }}>{m.label.toUpperCase()}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: isWinner ? m.color : '#888' }}>{count}</div>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: MUTED2 }}>{count === 1 ? 'VOTE' : 'VOTES'}</div>
            </div>
          )
        })}
      </div>
      <div style={{ paddingTop: 12, borderTop: `1px solid ${BORDER2}` }}>
        {votes.map((votedLetter, voterIdx) => {
          const voter = MODEL_META[voterIdx]
          const votedIdx = 'ABCD'.indexOf(votedLetter)
          const votedFor = votedIdx >= 0 ? MODEL_META[votedIdx] : null
          return (
            <div key={voterIdx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, marginBottom: 4, color: '#999' }}>
              <span style={{ color: voter.color, fontFamily: 'monospace', fontSize: 11, minWidth: 72 }}>{voter.label}</span>
              <span style={{ color: MUTED2 }}>→</span>
              {votedFor ? <span style={{ color: votedFor.color, fontFamily: 'monospace', fontSize: 11 }}>{votedFor.label}</span>
                : <span style={{ color: MUTED2, fontFamily: 'monospace', fontSize: 11 }}>(no vote)</span>}
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
  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={() => setOpen(!open)}
        style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: 6, color: MUTED, fontSize: 11, fontFamily: 'monospace', padding: '5px 12px', cursor: 'pointer', letterSpacing: '0.05em' }}>
        {open ? '[ hide debate history ]' : '[ view debate history ]'}
      </button>
      {open && (
        <div style={{ marginTop: 12 }}>
          {Object.keys(rounds).sort().map(rk => (
            <div key={rk} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.15em', marginBottom: 12 }}>
                ROUND {rk}{rk === '0' ? ' — INITIAL' : rk === '2' ? ' — FINAL' : ' — DEBATE'}
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
  if (editing) return (
    <div style={{ padding: '4px 6px', marginBottom: 2 }}>
      <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
        style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 5, color: '#e8e6e0', fontSize: 12, padding: '5px 8px', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )
  return (
    <div onDoubleClick={() => { setVal(chat.title); setEditing(true) }} onClick={onSelect}
      style={{ padding: '8px 10px', borderRadius: 7, cursor: 'pointer', marginBottom: 2, background: active ? '#1a1a1a' : 'none', color: active ? TEXT : MUTED, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', borderLeft: active ? `2px solid ${AMBER}` : '2px solid transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {chat.mode === 'premium' && <span style={{ color: PURPLE, marginRight: 4 }}>◆</span>}
        {chat.title}
      </span>
      {active && <button onClick={e => { e.stopPropagation(); setVal(chat.title); setEditing(true) }} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 11, padding: '0 2px', flexShrink: 0 }}>✎</button>}
    </div>
  )
}

function ModelRow({ label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }}/>
      <span style={{ fontSize: 12, color: '#888', fontFamily: 'monospace' }}>{label}</span>
    </div>
  )
}

function ModeToggle({ mode, setMode, disabled }) {
  return (
    <div style={{ display: 'inline-flex', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 7, padding: 2, fontSize: 11, fontFamily: 'monospace' }}>
      <button onClick={() => !disabled && setMode('standard')} disabled={disabled}
        style={{ padding: '5px 12px', borderRadius: 5, border: 'none', background: mode === 'standard' ? AMBER : 'transparent', color: mode === 'standard' ? '#000' : MUTED, cursor: disabled ? 'default' : 'pointer', fontWeight: 600, letterSpacing: '0.05em', transition: 'all 0.15s' }}>
        STANDARD
      </button>
      <button onClick={() => !disabled && setMode('premium')} disabled={disabled}
        style={{ padding: '5px 12px', borderRadius: 5, border: 'none', background: mode === 'premium' ? PURPLE : 'transparent', color: mode === 'premium' ? '#fff' : MUTED, cursor: disabled ? 'default' : 'pointer', fontWeight: 600, letterSpacing: '0.05em', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5 }}>
        ◆ PREMIUM
      </button>
    </div>
  )
}

function PremiumProgress({ currentStatus, rounds }) {
  const stages = [
    { key: 'round-0', label: 'Initial answers' },
    { key: 'round-1', label: 'Round 1 of 2' },
    { key: 'round-2', label: 'Round 2 of 2' },
    { key: 'voting', label: 'Blind vote' },
    { key: 'resolve', label: 'Resolving' },
  ]
  const status = (currentStatus || '').toLowerCase()
  let active = 0
  if (status.includes('round 0') || status.includes('initial')) active = 0
  else if (status.includes('round 1')) active = 1
  else if (status.includes('round 2')) active = 2
  else if (status.includes('voting') || status.includes('blind')) active = 3
  else if (status.includes('tiebreak')) active = 4
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
            <div key={s.key} style={{ flex: 1, padding: '8px 6px', borderRadius: 6, background: isDone ? `${PURPLE}20` : isActive ? `${PURPLE}10` : '#0a0a0a', border: `1px solid ${isDone ? PURPLE + '60' : isActive ? PURPLE : BORDER2}`, textAlign: 'center', transition: 'all 0.3s' }}>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: isDone || isActive ? PURPLE : MUTED2, marginBottom: 2 }}>{isDone ? '✓' : isActive ? '●' : '○'}</div>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: isDone || isActive ? '#ccc' : MUTED2 }}>{s.label}</div>
            </div>
          )
        })}
      </div>
      {currentStatus && <div style={{ marginTop: 14, fontSize: 11, fontFamily: 'monospace', color: '#888' }}>{currentStatus}</div>}
    </div>
  )
}

function BuyCreditsModal({ onClose, user, onPurchase }) {
  const [loading, setLoading] = useState(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoStatus, setPromoStatus] = useState(null)
  const [promoMessage, setPromoMessage] = useState('')

  async function handleBuy(packType) {
    setLoading(packType)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const res = await fetch('https://consensusai-production-0e01.up.railway.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ packType })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
    }
    setLoading(null)
  }

  async function handlePromo() {
    if (!promoCode.trim()) return
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const res = await fetch('https://consensusai-production-0e01.up.railway.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code: promoCode.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        setPromoStatus('success')
        setPromoMessage(data.message)
        setTimeout(() => { onPurchase && onPurchase(); onClose() }, 1500)
      } else {
        setPromoStatus('error')
        setPromoMessage(data.error || 'Invalid promo code')
      }
    } catch (err) {
      setPromoStatus('error')
      setPromoMessage('Something went wrong')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0f0f0f', border: `1px solid ${BORDER}`, borderRadius: 16, padding: 36, width: 480, borderTop: `2px solid ${AMBER}` }}>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.15em', marginBottom: 12 }}>BUY CREDITS</div>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6, color: TEXT }}>Get more queries</h3>
        <p style={{ color: MUTED, fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>Credits never expire. Use them whenever you need.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.1em', marginBottom: 8 }}>STANDARD</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 4 }}>$1.99</div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>10 queries</div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>4 AI models answer simultaneously. Claude synthesizes the result.</div>
            <button onClick={() => handleBuy('standard')} disabled={!!loading}
              style={{ width: '100%', padding: '10px', borderRadius: 8, background: AMBER, border: 'none', color: '#000', fontSize: 13, fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading === 'premium' ? 0.5 : 1 }}>
              {loading === 'standard' ? 'Loading...' : 'Buy Standard'}
            </button>
          </div>

          <div style={{ background: `${PURPLE}10`, border: `1px solid ${PURPLE}40`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.1em', marginBottom: 8 }}>◆ PREMIUM</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 4 }}>$4.99</div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>10 queries</div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>4 models debate in 2 rounds, vote blindly on the best answer.</div>
            <button onClick={() => handleBuy('premium')} disabled={!!loading}
              style={{ width: '100%', padding: '10px', borderRadius: 8, background: PURPLE, border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading === 'standard' ? 0.5 : 1 }}>
              {loading === 'premium' ? 'Loading...' : 'Buy Premium'}
            </button>
          </div>
        </div>

        {/* Promo code */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, letterSpacing: '0.1em', marginBottom: 8 }}>PROMO CODE</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="Enter code..."
              value={promoCode}
              onChange={e => { setPromoCode(e.target.value); setPromoStatus(null) }}
              onKeyDown={e => e.key === 'Enter' && handlePromo()}
              style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: `1px solid ${promoStatus === 'error' ? RED : promoStatus === 'success' ? GREEN : BORDER}`, background: '#0a0a0a', color: TEXT, fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
            />
            <button onClick={handlePromo}
              style={{ padding: '9px 16px', borderRadius: 8, background: CARD, border: `1px solid ${BORDER}`, color: MUTED, fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
              APPLY
            </button>
          </div>
          {promoStatus && (
            <div style={{ marginTop: 6, fontSize: 11, fontFamily: 'monospace', color: promoStatus === 'success' ? GREEN : RED }}>
              {promoStatus === 'success' ? '✓ ' : '✕ '}{promoMessage}
            </div>
          )}
        </div>

        <button onClick={onClose}
          style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'none', border: `1px solid ${BORDER}`, color: MUTED, fontSize: 13, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}
    

function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ width: 400, padding: 48, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, borderTop: `2px solid ${AMBER}` }}>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.15em', marginBottom: 16 }}>CONSENSUSAI</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 8, letterSpacing: '-0.02em' }}>The honest AI.</h1>
        <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, marginBottom: 40 }}>
          4 AI models answer your question simultaneously. See where they agree, disagree, and why.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 32 }}>
          {[
            { icon: '⚡', text: '4 models in parallel' },
            { icon: '🗳️', text: 'Blind debate voting' },
            { icon: '🔍', text: 'Full transparency' },
            { icon: '📊', text: 'Conflict mapping' },
          ].map(f => (
            <div key={f.text} style={{ background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>{f.icon}</span>
              <span style={{ fontSize: 11, color: '#888', fontFamily: 'monospace' }}>{f.text}</span>
            </div>
          ))}
        </div>

        {error && <div style={{ background: '#1a0a0a', border: '1px solid #3a1a1a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: RED, marginBottom: 16 }}>{error}</div>}

        <button onClick={handleGoogleLogin} disabled={loading}
          style={{ width: '100%', padding: '14px', borderRadius: 10, background: loading ? MUTED2 : '#fff', border: 'none', color: '#000', fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'background 0.2s' }}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M47.5 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.2 7.3-10.5 7.3-17.3z"/>
            <path fill="#34A853" d="M24 48c6.6 0 12.2-2.2 16.2-5.9l-7.9-6c-2.2 1.5-5 2.3-8.3 2.3-6.4 0-11.8-4.3-13.7-10.1H2.1v6.2C6.1 42.6 14.5 48 24 48z"/>
            <path fill="#FBBC05" d="M10.3 28.3c-.5-1.5-.8-3-.8-4.6s.3-3.2.8-4.6v-6.2H2.1C.8 15.9 0 19.9 0 24s.8 8.1 2.1 11.1l8.2-6.8z"/>
            <path fill="#EA4335" d="M24 9.5c3.6 0 6.8 1.2 9.3 3.6l7-7C36.2 2.2 30.6 0 24 0 14.5 0 6.1 5.4 2.1 13.3l8.2 6.2C12.2 13.8 17.6 9.5 24 9.5z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: MUTED2, marginTop: 20, lineHeight: 1.6 }}>
          5 free queries on signup. No credit card required.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [credits, setCredits] = useState({ standard_credits: 0, premium_credits: 0 })
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [statusText, setStatusText] = useState('')
  const [liveRounds, setLiveRounds] = useState(null)
  const [mode, setMode] = useState('standard')
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [name, setName] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [attachment, setAttachment] = useState(null)
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [keyHovered, setKeyHovered] = useState(false)
  const [noCreditsError, setNoCreditsError] = useState(false)
  const messagesEndRef = useRef(null)

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setName(session.user.user_metadata?.full_name?.split(' ')[0] || '')
        loadUserData(session.user)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Check for payment success in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      window.history.replaceState({}, '', '/')
      setTimeout(() => loadUserData(user), 2000) // wait for webhook
    }
  }, [user])

  async function loadUserData(currentUser) {
    if (!currentUser) return
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const res = await fetch('https://consensusai-production-0e01.up.railway.app', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.credits) setCredits(data.credits)
      if (data.chats) {
        const formatted = data.chats.map(chat => ({
          id: chat.id,
          title: chat.title,
          mode: chat.mode,
          messages: (chat.messages || []).map(m => ({
            role: m.role,
            content: m.role === 'user' ? m.content.text : m.content,
            individual: m.individual,
            rounds: m.rounds,
            votes: m.votes,
            resolution: m.resolution,
            isPremium: chat.mode === 'premium',
          }))
        }))
        setChats(formatted)
        if (formatted.length > 0 && !activeChatId) {
          setActiveChatId(formatted[0].id)
          setMessages(formatted[0].messages)
        }
      }
    } catch (err) {
      console.error('Failed to load user data:', err)
    }
  }

  function handleFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAttachment({ data: reader.result.split(',')[1], type: file.type, name: file.name })
    reader.readAsDataURL(file)
  }

  async function getAuthHeader() {
    const session = await supabase.auth.getSession()
    return `Bearer ${session.data.session?.access_token}`
  }

  async function handleSubmit() {
    if (!prompt.trim() || loading) return
    const isPremium = mode === 'premium'

    // Check credits locally first
    const availableCredits = isPremium ? credits.premium_credits : credits.standard_credits
    if (availableCredits <= 0) {
      setShowBuyModal(true)
      return
    }

    const userMessage = prompt
    setPrompt('')
    const newMessages = [...messages, {
      role: 'user', content: userMessage, isPremium,
      attachment: attachment ? { name: attachment.name, type: attachment.type } : null
    }]
    setMessages(newMessages)
    setLoading(true)
    setStreamingText('')
    setStatusText('Connecting...')
    setLiveRounds(null)
    setNoCreditsError(false)
    setAttachment(null)

    const token = await getAuthHeader()
    const endpoint = isPremium ? '/api/query/premium' : '/api/query'

    const res = await fetch(`https://consensusai-production-0e01.up.railway.app${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify({ prompt: userMessage, attachment })
    })

    // Handle insufficient credits (402)
    if (res.status === 402) {
      setLoading(false)
      setMessages(messages) // revert
      setShowBuyModal(true)
      return
    }

    // Deduct from local state optimistically
    setCredits(prev => ({
      ...prev,
      [isPremium ? 'premium_credits' : 'standard_credits']:
        prev[isPremium ? 'premium_credits' : 'standard_credits'] - 1
    }))

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
              role: 'assistant', isPremium,
              content: parsed.answer,
              individual: parsed.individual,
              rounds: parsed.rounds,
              votes: parsed.votes,
              resolution: parsed.resolution,
            }
            const finalMessages = [...newMessages, assistantMsg]
            setMessages(finalMessages)
            // Add new chat to sidebar
            const newChat = {
              id: Date.now(),
              title: userMessage.slice(0, 28) + (userMessage.length > 28 ? '...' : ''),
              mode: isPremium ? 'premium' : 'standard',
              messages: finalMessages,
            }
            setChats(prev => [newChat, ...prev])
            setActiveChatId(newChat.id)
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

  function newChat() {
    setActiveChatId(null)
    setMessages([])
  }

  function switchChat(chat) {
    setActiveChatId(chat.id)
    setMessages(chat.messages)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  function exportPDF(msg, question) {
    const content = `ConsensusAI Export\n${'='.repeat(50)}\n\nMode: ${msg.isPremium ? 'Premium' : 'Standard'}\nQuestion: ${question}\n\nAnswer:\n${msg.content.summary}\n\nGPT-4o:\n${msg.individual?.openai || ''}\n\nClaude:\n${msg.individual?.claude || ''}\n\nDeepSeek:\n${msg.individual?.deepseek || ''}\n\nGrok:\n${msg.individual?.grok || ''}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `consensusai-${Date.now()}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })

  if (authLoading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <div style={{ fontSize: 11, fontFamily: 'monospace', color: MUTED, letterSpacing: '0.1em' }}>LOADING...</div>
    </div>
  )

  if (!user) return <LoginPage />

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: BG, color: TEXT, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      <input type="file" accept="image/*,.pdf,.txt,.md" style={{ display: 'none' }} id="file-input" onChange={e => handleFile(e.target.files[0])} />

      {showBuyModal && <BuyCreditsModal onClose={() => setShowBuyModal(false)} user={user} />}

      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0f0f0f', border: `1px solid ${BORDER}`, borderRadius: 16, padding: 36, width: 440, borderTop: `2px solid ${AMBER}` }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.15em', marginBottom: 12 }}>SETTINGS</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: TEXT }}>Account</h3>
            <div style={{ background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Signed in as</div>
              <div style={{ fontSize: 14, color: TEXT }}>{user.email}</div>
            </div>
            <div style={{ background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 10, padding: 16, marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: MUTED, letterSpacing: '0.1em', marginBottom: 12 }}>CREDITS</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: AMBER }}>{credits.standard_credits}</div>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED2 }}>STANDARD</div>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: PURPLE }}>{credits.premium_credits}</div>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED2 }}>PREMIUM</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowSettings(false); setShowBuyModal(true) }}
                style={{ flex: 1, padding: '11px', borderRadius: 8, background: AMBER, border: 'none', color: '#000', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Buy Credits
              </button>
              <button onClick={async () => { await supabase.auth.signOut(); setShowSettings(false) }}
                style={{ padding: '11px 18px', borderRadius: 8, background: 'none', border: `1px solid ${BORDER}`, color: MUTED, fontSize: 14, cursor: 'pointer' }}>
                Sign out
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
            {chats.map(chat => (
              <ChatItem key={chat.id} chat={chat} active={chat.id === activeChatId}
                onSelect={() => switchChat(chat)}
                onRename={newTitle => setChats(prev => prev.map(c => c.id === chat.id ? { ...c, title: newTitle } : c))} />
            ))}
          </div>

          <div style={{ padding: '12px 16px', borderTop: `1px solid ${BORDER2}` }}>
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: MUTED2, letterSpacing: '0.12em', marginBottom: 10 }}>MODELS ONLINE</div>
            {MODEL_META.map(m => <ModelRow key={m.key} label={m.label} color={GREEN} />)}
            <ModelRow label="Synthesis (Claude)" color={GREEN} />

            {/* Credits display */}
            <div style={{ marginTop: 12, marginBottom: 8, display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: AMBER }}>{credits.standard_credits}</div>
                <div style={{ fontSize: 9, fontFamily: 'monospace', color: MUTED2 }}>STD</div>
              </div>
              <div style={{ flex: 1, background: `${PURPLE}10`, border: `1px solid ${PURPLE}30`, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: PURPLE }}>{credits.premium_credits}</div>
                <div style={{ fontSize: 9, fontFamily: 'monospace', color: MUTED2 }}>PRO</div>
              </div>
              <button onClick={() => setShowBuyModal(true)}
                style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '6px 10px', color: MUTED, fontSize: 12, cursor: 'pointer' }}>
                +
              </button>
            </div>

            <button onClick={() => setShowSettings(true)}
              onMouseEnter={() => setKeyHovered(true)} onMouseLeave={() => setKeyHovered(false)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 7, background: keyHovered ? '#0f2a0f' : '#0a1a0a', border: `1px solid ${keyHovered ? '#2a5a2a' : '#1a3a1a'}`, color: GREEN, fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, flexShrink: 0 }}/>
              {name ? name.toUpperCase() : user.email?.split('@')[0].toUpperCase()}
            </button>

            <div style={{ marginTop: 12, fontSize: 10, color: MUTED2, fontFamily: 'monospace', lineHeight: 1.8 }}>
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
            {[GREEN, GREEN, GREEN, GREEN].map((c, i) => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: c }}/>)}
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
                Ask anything. Your question goes to 4 AI models simultaneously.
                {credits.standard_credits > 0 && <span style={{ color: GREEN }}> {credits.standard_credits} standard {credits.standard_credits === 1 ? 'query' : 'queries'} remaining.</span>}
                {credits.premium_credits > 0 && <span style={{ color: PURPLE }}> {credits.premium_credits} premium {credits.premium_credits === 1 ? 'query' : 'queries'} remaining.</span>}
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

                  {msg.isPremium && msg.votes && <VoteTally votes={msg.votes} counts={msg.resolution?.counts} resolution={msg.resolution} />}

                  {!msg.isPremium && (
                    <div style={{ marginBottom: 16, padding: '20px 24px', background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 10 }}>
                      <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, letterSpacing: '0.12em', marginBottom: 18 }}>SIGNAL ANALYSIS</div>
                      <ConfidenceBar color={GREEN} points={msg.content.agreed} label="Consensus" />
                      <ConfidenceBar color={YELLOW} points={msg.content.partial} label="Partial agreement" />
                      <ConfidenceBar color={RED} points={msg.content.conflicted} label="Conflicting signals" />
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
                  {['GPT-4o', 'Claude', 'DeepSeek', 'Grok', 'Synthesis'].map(m => (
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
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED2 }}>
                {mode === 'standard'
                  ? `${credits.standard_credits} standard ${credits.standard_credits === 1 ? 'query' : 'queries'} left`
                  : `${credits.premium_credits} premium ${credits.premium_credits === 1 ? 'query' : 'queries'} left`}
                {(mode === 'standard' ? credits.standard_credits : credits.premium_credits) === 0 && (
                  <button onClick={() => setShowBuyModal(true)} style={{ marginLeft: 8, background: 'none', border: 'none', color: AMBER, fontSize: 10, fontFamily: 'monospace', cursor: 'pointer', textDecoration: 'underline' }}>
                    buy more
                  </button>
                )}
              </div>
            </div>
            {attachment && (
              <div style={{ marginBottom: 8, padding: '6px 12px', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 7, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: AMBER }}>+</span>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#aaa', flex: 1 }}>{attachment.name}</span>
                <button onClick={() => setAttachment(null)} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: 14, padding: 0 }}>✕</button>
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