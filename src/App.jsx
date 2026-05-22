import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import supabase from './supabase.js'
import InfoPage from './InfoPage.jsx'

const AMBER = 'var(--c-amber)'
const AMBER_DIM = 'var(--c-amber-dim)'
const BG = 'var(--c-bg)'
const SURFACE = 'var(--c-surface)'
const CARD = 'var(--c-card)'
const BORDER = 'var(--c-border)'
const BORDER2 = 'var(--c-border2)'
const TEXT = 'var(--c-text)'
const MUTED = 'var(--c-muted)'
const MUTED2 = 'var(--c-muted2)'
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
    .replace(/\{,\}/g, ',')
    .replace(/\\([%$#&_])/g, '$1')
    .replace(/\$([^$]+)\$/g, (match, inner) => '$' + inner.replace(/\\times/g, '×').replace(/\\sqrt/g, '√') + '$')
  cleaned = cleaned.replace(/(?<![a-zA-Z0-9])\$(?!\$)(?![^$]*\$)/g, '')
  const parts = cleaned.split(/(```[\s\S]*?```|\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g)
  return (
    <div style={{ fontSize: 15, lineHeight: 1.85, color: TEXT }}>
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3).replace(/^\w+\n/, '')
          return (
            <div key={i} style={{ background: CARD, border: `1px solid var(--c-border3)`, borderRadius: 8, padding: '14px 20px', margin: '14px 0', fontFamily: 'monospace', fontSize: 13, color: AMBER, overflowX: 'auto', borderLeft: '2px solid var(--c-amber-a30)' }}>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: 'var(--c-muted3)', letterSpacing: '0.1em', marginBottom: 8 }}>CODE</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{code}</pre>
            </div>
          )
        }
        if ((part.startsWith('$$') && part.endsWith('$$')) || (part.startsWith('$') && part.endsWith('$'))) {
          const math = part.replace(/^\$+|\$+$/g, '')
          const isBlock = part.startsWith('$$')
          if (isBlock) return (
            <div key={i} style={{ background: CARD, border: `1px solid var(--c-border3)`, borderRadius: 8, padding: '14px 20px', margin: '14px 0', fontFamily: 'monospace', fontSize: 15, color: AMBER, textAlign: 'center', borderLeft: '2px solid var(--c-amber-a30)' }}>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: 'var(--c-muted3)', letterSpacing: '0.1em', marginBottom: 8 }}>FORMULA</div>
              {math}
            </div>
          )
          const superscript = math.replace(/\^2/g,'²').replace(/\^3/g,'³').replace(/\^n/g,'ⁿ')
          return <span key={i} style={{ background: AMBER_DIM, border: `1px solid var(--c-border4)`, borderRadius: 5, padding: '2px 8px', fontFamily: 'monospace', fontSize: 14, color: AMBER, display: 'inline', margin: '0 2px' }}>{superscript}</span>
        }
        return (
          <span key={i}>
            <ReactMarkdown components={{
              p: ({children}) => <span>{children}</span>,
              strong: ({children}) => <strong style={{ color: TEXT, fontWeight: 600 }}>{children}</strong>,
              em: ({children}) => <em style={{ color: 'var(--c-muted5)' }}>{children}</em>,
              h1: ({children}) => <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, margin: '20px 0 10px' }}>{children}</div>,
              h2: ({children}) => <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--c-text-h2)', margin: '18px 0 8px' }}>{children}</div>,
              h3: ({children}) => <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--c-text-h3)', margin: '14px 0 6px' }}>{children}</div>,
              ul: ({children}) => <ul style={{ paddingLeft: 20, margin: '8px 0' }}>{children}</ul>,
              ol: ({children}) => <ol style={{ paddingLeft: 20, margin: '8px 0' }}>{children}</ol>,
              li: ({children}) => <li style={{ color: 'var(--c-muted5)', marginBottom: 4, fontSize: 14 }}>{children}</li>,
              code: ({children}) => <span style={{ background: AMBER_DIM, border: `1px solid var(--c-border4)`, borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace', fontSize: 13, color: AMBER }}>{children}</span>,
              blockquote: ({children}) => <div style={{ borderLeft: `2px solid ${MUTED2}`, paddingLeft: 16, margin: '12px 0', color: 'var(--c-muted4)' }}>{children}</div>,
            }}>{part}</ReactMarkdown>
          </span>
        )
      })}
    </div>
  )
}

function calcAgreementScore(content, resolution) {
  if (resolution) {
    if (resolution.type === 'consensus') return 94
    if (resolution.type === 'majority') return 68
    return 42
  }
  const agreed = content?.agreed?.length || 0
  const partial = content?.partial?.length || 0
  const conflicted = content?.conflicted?.length || 0
  const total = agreed + partial + conflicted
  if (total === 0) {
    if (content?.confidence === 'High') return 85
    if (content?.confidence === 'Medium') return 58
    return 32
  }
  return Math.round((agreed + partial * 0.5) / total * 100)
}

function ModelAgreementBar({ content, resolution, isPremium }) {
  const score = calcAgreementScore(content, resolution)
  const isHigh = score >= 80
  const isMed = score >= 50
  const color = isHigh ? GREEN : isMed ? YELLOW : RED
  const label = isHigh ? 'High' : isMed ? 'Medium' : 'Low'
  const tooltip = isPremium
    ? resolution?.type === 'consensus' ? '3 or more models voted for the same answer'
      : resolution?.type === 'majority' ? 'A majority of models agreed on this answer'
      : 'Models were split — Claude resolved the tie'
    : `${content?.agreed?.length || 0} consensus · ${content?.partial?.length || 0} partial · ${content?.conflicted?.length || 0} conflict`

  return (
    <div title={tooltip} style={{ marginBottom: 16, padding: '12px 16px', background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 10, cursor: 'default' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, letterSpacing: '0.1em' }}>MODEL AGREEMENT</div>
        <div style={{ fontSize: 11, fontFamily: 'monospace', color, fontWeight: 600 }}>{score}% · {label}</div>
      </div>
      <div style={{ height: 5, background: BORDER2, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: `linear-gradient(90deg, ${color}99, ${color})`, borderRadius: 3, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
      <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED2, marginTop: 6 }}>Based on 4 model responses · hover for details</div>
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
          <span style={{ fontSize: 13, color: 'var(--c-muted5)', lineHeight: 1.6 }}><FormattedText text={point} /></span>
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
      {winnerModel && <div style={{ marginBottom: 16, fontSize: 12, color: 'var(--c-muted5)' }}>
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
              <div style={{ fontSize: 22, fontWeight: 700, color: isWinner ? m.color : 'var(--c-secondary)' }}>{count}</div>
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
            <div key={voterIdx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, marginBottom: 4, color: 'var(--c-subtle)' }}>
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
                    <div style={{ fontSize: 12, color: 'var(--c-subtle)', lineHeight: 1.6, maxHeight: 300, overflowY: 'auto' }}>
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

function FeatureCard({ feature, isMobile }) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  return (
    <div onClick={() => setOpen(!open)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: open ? CARD : hovered ? CARD : SURFACE, border: `1px solid ${open ? BORDER : BORDER2}`, borderRadius: 10, padding: isMobile ? '10px 11px' : '14px 16px', borderLeft: `2px solid ${open ? AMBER : 'var(--c-amber-a30)'}`, cursor: 'pointer', transition: 'all 0.15s', gridColumn: open ? 'span 2' : 'span 1' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: open ? 8 : 4 }}>
        <div style={{ fontSize: isMobile ? 9 : 11, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.06em', lineHeight: 1.3 }}>{feature.label.toUpperCase()}</div>
        <div style={{ fontSize: 9, color: MUTED2, fontFamily: 'monospace', flexShrink: 0, marginLeft: 4 }}>{open ? '▲' : '▼'}</div>
      </div>
      <div style={{ fontSize: isMobile ? 11 : 12, color: MUTED, lineHeight: 1.45, marginBottom: open ? 10 : 0, overflow: open ? 'visible' : 'hidden', display: open ? 'block' : '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{feature.desc}</div>
      {open && <div style={{ fontSize: 12, color: 'var(--c-secondary)', lineHeight: 1.65, borderTop: `1px solid ${BORDER2}`, paddingTop: 10, marginTop: 2 }}>{feature.detail}</div>}
    </div>
  )
}

function ChatItem({ chat, active, onSelect, onRename, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(chat.title)
  function save() { if (val.trim()) onRename(val.trim()); setEditing(false) }
  if (editing) return (
    <div style={{ padding: '4px 6px', marginBottom: 2 }}>
      <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
        style={{ width: '100%', background: AMBER_DIM, border: `1px solid ${MUTED2}`, borderRadius: 5, color: TEXT, fontSize: 12, padding: '5px 8px', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )
  return (
    <div onDoubleClick={() => { setVal(chat.title); setEditing(true) }} onClick={onSelect}
      style={{ padding: '8px 10px', borderRadius: 7, cursor: 'pointer', marginBottom: 2, background: active ? AMBER_DIM : 'none', color: active ? TEXT : MUTED, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', borderLeft: active ? `2px solid ${AMBER}` : '2px solid transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: chat.mode === 'premium' ? PURPLE : TEXT, flexShrink: 0 }}>◆</span>
        {chat.title}
      </span>
      {active && (
        <span style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); setVal(chat.title); setEditing(true) }}
            title="Rename"
            style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', padding: '2px 3px', display: 'flex', alignItems: 'center', borderRadius: 4, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--c-muted)'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
              <line x1="3" y1="22" x2="21" y2="22"/>
            </svg>
          </button>
          <button onClick={e => { e.stopPropagation(); if (window.confirm('Delete this chat? This cannot be undone.')) onDelete() }}
            title="Delete"
            style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', padding: '2px 3px', display: 'flex', alignItems: 'center', borderRadius: 4, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = 'var(--c-muted)'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </span>
      )}
    </div>
  )
}

function ModelRow({ label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }}/>
      <span style={{ fontSize: 12, color: 'var(--c-secondary)', fontFamily: 'monospace' }}>{label}</span>
    </div>
  )
}

function ModeToggle({ mode, setMode, disabled }) {
  return (
    <div className="mode-toggle-wrap" style={{ display: 'inline-flex', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 7, padding: 2, fontSize: 11, fontFamily: 'monospace' }}>
      <button onClick={() => !disabled && setMode('standard')} disabled={disabled} className="mode-btn"
        style={{ padding: '5px 12px', borderRadius: 5, border: 'none', background: mode === 'standard' ? AMBER : 'transparent', color: mode === 'standard' ? BG : MUTED, cursor: disabled ? 'default' : 'pointer', fontWeight: 600, letterSpacing: '0.05em', transition: 'all 0.15s' }}>
        STANDARD
      </button>
      <button onClick={() => !disabled && setMode('premium')} disabled={disabled} className="mode-btn"
        style={{ padding: '5px 12px', borderRadius: 5, border: 'none', background: mode === 'premium' ? PURPLE : 'transparent', color: mode === 'premium' ? '#fff' : MUTED, cursor: disabled ? 'default' : 'pointer', fontWeight: 600, letterSpacing: '0.05em', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span className="premium-diamond">◆ </span>PREMIUM
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
            <div key={s.key} style={{ flex: 1, padding: '8px 6px', borderRadius: 6, background: isDone ? `${PURPLE}20` : isActive ? `${PURPLE}10` : 'var(--c-surface-deep)', border: `1px solid ${isDone ? PURPLE + '60' : isActive ? PURPLE : BORDER2}`, textAlign: 'center', transition: 'all 0.3s' }}>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: isDone || isActive ? PURPLE : MUTED2, marginBottom: 2 }}>{isDone ? '✓' : isActive ? '●' : '○'}</div>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: isDone || isActive ? 'var(--c-bright)' : MUTED2 }}>{s.label}</div>
            </div>
          )
        })}
      </div>
      {currentStatus && <div style={{ marginTop: 14, fontSize: 11, fontFamily: 'monospace', color: 'var(--c-secondary)' }}>{currentStatus}</div>}
    </div>
  )
}

function FeedbackModal({ onClose, user }) {
  const isMobile = window.innerWidth <= 768
  const [email, setEmail] = useState(user?.email || '')
  const [feedback, setFeedback] = useState('')
  const [status, setStatus] = useState(null) // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit() {
    if (feedback.trim().length < 10) { setErrorMsg('Feedback must be at least 10 characters.'); return }
    setStatus('loading')
    setErrorMsg('')
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const res = await fetch('https://consensusai-production-0e01.up.railway.app/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: email.trim(), feedback: feedback.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error || 'Something went wrong.'); setStatus('error'); return }
      setStatus('success')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: isMobile ? 24 : 36, width: '100%', maxWidth: 460, borderTop: `2px solid ${PURPLE}`, animation: 'msgSlideIn 250ms ease-out both' }}>
        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>✓</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Feedback sent!</div>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 28 }}>Thanks for helping improve VELE AI.</div>
            <button onClick={onClose} style={{ padding: '10px 28px', borderRadius: 8, background: PURPLE, border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.15em', marginBottom: 10 }}>FEEDBACK</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT, margin: '0 0 20px' }}>Send Feedback</h3>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, letterSpacing: '0.1em', marginBottom: 6 }}>EMAIL (OPTIONAL)</div>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, background: 'var(--c-input-bg)', color: TEXT, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, letterSpacing: '0.1em', marginBottom: 6 }}>FEEDBACK <span style={{ color: RED }}>*</span></div>
              <textarea value={feedback} onChange={e => { setFeedback(e.target.value); setErrorMsg('') }} placeholder="What's on your mind? Bug reports, feature ideas, general thoughts..."
                rows={5} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${errorMsg ? RED : BORDER}`, background: 'var(--c-input-bg)', color: TEXT, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {errorMsg ? <span style={{ fontSize: 11, color: RED, fontFamily: 'monospace' }}>{errorMsg}</span> : <span />}
                <span style={{ fontSize: 11, color: feedback.length > 4800 ? RED : MUTED2, fontFamily: 'monospace' }}>{feedback.length}/5000</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} disabled={status === 'loading'}
                style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'none', border: `1px solid ${BORDER}`, color: MUTED, fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={status === 'loading' || feedback.trim().length < 10}
                style={{ flex: 2, padding: '10px', borderRadius: 8, background: feedback.trim().length >= 10 ? PURPLE : MUTED2, border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: feedback.trim().length >= 10 ? 'pointer' : 'default', transition: 'background 0.15s' }}>
                {status === 'loading' ? 'Sending...' : 'Send Feedback'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function UpdateAnnouncementModal({ onDismiss }) {
  const isMobile = window.innerWidth <= 768
  const updates = [
    { title: 'VELE AI Rebrand', desc: 'New name, logo, and branding throughout the app' },
    { title: 'Settings Menu', desc: 'New gear icon with Account, Credits, Appearance, and Delete All Chats options' },
    { title: 'Dark / Light Mode', desc: 'Choose your preferred theme in Settings → Appearance' },
    { title: 'Send Feedback', desc: 'Share your thoughts directly with us through the new feedback feature' },
    { title: 'Confidence Bar', desc: 'See how much the AI models agree on each answer with a visual indicator' },
    { title: 'Improved Chat Management', desc: 'Cleaner delete and rename icons with consistent design across the sidebar' },
    { title: 'Bug Fixes', desc: 'Fixed promo code Apply button and improved error handling throughout' },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.75)' }}>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, width: '100%', maxWidth: 480, borderTop: `2px solid ${PURPLE}`, animation: 'msgSlideIn 300ms ease-out both', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: isMobile ? '28px 28px 20px' : '36px 44px 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src="/android-chrome-192x192.png" alt="VELE AI" style={{ width: 52, height: 52, borderRadius: 14, marginBottom: 16 }} />
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.15em', marginBottom: 8 }}>UPDATE</div>
            <h2 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: TEXT, margin: 0, marginBottom: 4, textAlign: 'center' }}>What's New in VELE AI</h2>
            <p style={{ fontSize: 13, color: MUTED, margin: 0, marginBottom: 4, textAlign: 'center' }}>Version 1.0</p>
            <p style={{ fontSize: 10, color: MUTED2, margin: 0, fontFamily: 'monospace', letterSpacing: '0.06em', textAlign: 'center' }}>Latest update: 19. May 2026</p>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '0 28px' : '0 44px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {updates.map((u, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '11px 14px', background: CARD, borderRadius: 9, border: `1px solid ${BORDER2}` }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: PURPLE, flexShrink: 0, marginTop: 4 }} />
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{u.title} </span>
                  <span style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{u.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: isMobile ? '20px 28px 28px' : '20px 44px 36px', flexShrink: 0 }}>
          <button onClick={onDismiss}
            style={{ width: '100%', padding: '13px', borderRadius: 10, background: PURPLE, border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}

function BuyCreditsModal({ onClose, user, onPurchase }) {
  const [loading, setLoading] = useState(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoStatus, setPromoStatus] = useState(null)
  const [promoMessage, setPromoMessage] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const isMobile = window.innerWidth <= 768

  async function handleBuy(packType) {
    setLoading(packType)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const res = await fetch('https://consensusai-production-0e01.up.railway.app/api/checkout', {
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
    if (!promoCode.trim() || promoLoading || promoStatus === 'success') return
    setPromoLoading(true)
    setPromoStatus(null)
    setPromoMessage('')
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const res = await fetch('https://consensusai-production-0e01.up.railway.app/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code: promoCode.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setPromoStatus('success')
        setPromoMessage(data.message)
        onPurchase && onPurchase()
        setTimeout(() => onClose(), 2000)
      } else {
        setPromoStatus('error')
        setPromoMessage(data.error || 'Invalid promo code')
      }
    } catch {
      setPromoStatus('error')
      setPromoMessage('Network error — please try again')
    } finally {
      setPromoLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: isMobile ? 20 : 36, width: isMobile ? 'calc(100vw - 32px)' : 480, borderTop: `2px solid ${AMBER}`, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.15em', marginBottom: 12 }}>BUY CREDITS</div>
        <h3 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 600, marginBottom: 6, color: TEXT }}>Get more queries</h3>
        <p style={{ color: MUTED, fontSize: 13, marginBottom: isMobile ? 16 : 28, lineHeight: 1.6 }}>Credits never expire. Use them whenever you need.</p>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.1em', marginBottom: 8 }}>STANDARD</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 4 }}>$1.99</div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>10 queries</div>
            <div style={{ fontSize: 11, color: 'var(--c-secondary)', marginBottom: 16, lineHeight: 1.6 }}>4 AI models answer simultaneously. Claude synthesizes the result.</div>
            <button onClick={() => handleBuy('standard')} disabled={!!loading}
              style={{ width: '100%', padding: '10px', borderRadius: 8, background: AMBER, border: 'none', color: BG, fontSize: 13, fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading === 'premium' ? 0.5 : 1 }}>
              {loading === 'standard' ? 'Loading...' : 'Buy Standard'}
            </button>
          </div>

          <div style={{ background: `${PURPLE}10`, border: `1px solid ${PURPLE}40`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.1em', marginBottom: 8 }}>◆ PREMIUM</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 4 }}>$4.99</div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>10 queries</div>
            <div style={{ fontSize: 11, color: 'var(--c-secondary)', marginBottom: 16, lineHeight: 1.6 }}>4 models debate in 2 rounds, vote blindly on the best answer.</div>
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
              style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: `1px solid ${promoStatus === 'error' ? RED : promoStatus === 'success' ? GREEN : BORDER}`, background: 'var(--c-input-bg)', color: TEXT, fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
            />
            <button onClick={handlePromo}
              disabled={promoLoading || promoStatus === 'success' || !promoCode.trim()}
              style={{ padding: '9px 16px', borderRadius: 8, background: promoStatus === 'success' ? GREEN + '20' : CARD, border: `1px solid ${promoStatus === 'success' ? GREEN : promoCode.trim() ? AMBER : BORDER}`, color: promoStatus === 'success' ? GREEN : promoCode.trim() ? AMBER : MUTED, fontSize: 12, cursor: promoLoading || !promoCode.trim() ? 'default' : 'pointer', fontFamily: 'monospace', fontWeight: 600, transition: 'all 0.15s', opacity: promoLoading ? 0.6 : 1 }}>
              {promoLoading ? '...' : promoStatus === 'success' ? '✓' : 'APPLY'}
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
  const [authMode, setAuthMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [focused, setFocused] = useState(null)
  const isMobile = window.innerWidth <= 768

  async function handleGoogleLogin() {
    setLoading('google')
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  async function handleEmailSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) { setError('Email and password are required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading('email')
    setError(null)
    const { error } = authMode === 'signup'
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('invalid login')) setError('Incorrect email or password')
      else if (msg.includes('already registered') || msg.includes('already exists')) setError('An account with this email already exists. Try signing in instead.')
      else if (msg.includes('invalid email')) setError('Please enter a valid email address')
      else setError(error.message)
      setLoading(false)
    }
  }

  const inputStyle = (field) => ({
    width: '100%', padding: '13px 15px', borderRadius: 9,
    border: `1.5px solid ${focused === field ? PURPLE : BORDER}`,
    background: 'var(--c-input-bg)', color: TEXT, fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    transition: 'border-color 0.15s',
  })

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', padding: '20px 20px 40px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Hero header — outside the card */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/android-chrome-192x192.png" alt="VELE AI" style={{ width: 64, height: 64, borderRadius: 18, marginBottom: 16, boxShadow: `0 0 32px ${PURPLE}30` }} />
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.2em', marginBottom: 14 }}>VELE AI</div>
          <h1 style={{ fontSize: isMobile ? 34 : 40, fontWeight: 800, color: TEXT, margin: 0, marginBottom: 12, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            {authMode === 'signup' ? 'Create account.' : 'The honest AI.'}
          </h1>
          <p style={{ color: 'var(--c-readable)', fontSize: 15, lineHeight: 1.65, margin: '0 auto', maxWidth: 340 }}>
            {authMode === 'signup'
              ? 'Get 3 free standard queries. No credit card required.'
              : '4 models answer simultaneously. One synthesized, honest answer.'}
          </p>
        </div>

        {/* Model strip — sign-in only */}
        {authMode === 'signin' && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            {MODEL_META.map(m => (
              <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 20, background: CARD, border: `1px solid ${BORDER2}` }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--c-readable)', letterSpacing: '0.04em' }}>{m.label}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 20, background: `${PURPLE}15`, border: `1px solid ${PURPLE}40` }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: PURPLE, flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.04em' }}>Synthesis</span>
            </div>
          </div>
        )}

        {/* Form card */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: isMobile ? '28px 24px' : '36px 36px', borderTop: `2px solid ${PURPLE}` }}>

          {error && (
            <div style={{ background: 'var(--c-red-bg)', border: '1px solid var(--c-red-border)', borderRadius: 9, padding: '11px 14px', fontSize: 13, color: RED, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSubmit}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--c-readable)', letterSpacing: '0.1em', marginBottom: 7 }}>EMAIL</div>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                placeholder="you@example.com" autoComplete="email" disabled={!!loading}
                style={inputStyle('email')}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--c-readable)', letterSpacing: '0.1em', marginBottom: 7 }}>PASSWORD</div>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                placeholder={authMode === 'signup' ? 'At least 6 characters' : 'Your password'}
                autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                disabled={!!loading}
                style={inputStyle('password')}
              />
            </div>
            <button type="submit" disabled={!!loading}
              style={{ width: '100%', padding: '14px', borderRadius: 10, background: loading ? MUTED2 : PURPLE, border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer', letterSpacing: '0.01em', transition: 'opacity 0.15s' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              {loading === 'email' ? (authMode === 'signup' ? 'Creating account...' : 'Signing in...') : (authMode === 'signup' ? 'Create account' : 'Sign in')}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: BORDER }} />
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--c-readable)', letterSpacing: '0.15em' }}>OR</div>
            <div style={{ flex: 1, height: 1, background: BORDER }} />
          </div>

          <button onClick={handleGoogleLogin} disabled={!!loading}
            style={{ width: '100%', padding: '13px', borderRadius: 10, background: loading ? MUTED2 : '#fff', border: 'none', color: '#000', fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'opacity 0.15s' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M47.5 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.2 7.3-10.5 7.3-17.3z"/>
              <path fill="#34A853" d="M24 48c6.6 0 12.2-2.2 16.2-5.9l-7.9-6c-2.2 1.5-5 2.3-8.3 2.3-6.4 0-11.8-4.3-13.7-10.1H2.1v6.2C6.1 42.6 14.5 48 24 48z"/>
              <path fill="#FBBC05" d="M10.3 28.3c-.5-1.5-.8-3-.8-4.6s.3-3.2.8-4.6v-6.2H2.1C.8 15.9 0 19.9 0 24s.8 8.1 2.1 11.1l8.2-6.8z"/>
              <path fill="#EA4335" d="M24 9.5c3.6 0 6.8 1.2 9.3 3.6l7-7C36.2 2.2 30.6 0 24 0 14.5 0 6.1 5.4 2.1 13.3l8.2 6.2C12.2 13.8 17.6 9.5 24 9.5z"/>
            </svg>
            {loading === 'google' ? 'Redirecting...' : 'Continue with Google'}
          </button>
        </div>

        {/* Sign up / sign in toggle — outside card */}
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--c-readable)', marginTop: 20, lineHeight: 1.6 }}>
          {authMode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => { setAuthMode(authMode === 'signup' ? 'signin' : 'signup'); setError(null) }}
            style={{ background: 'none', border: 'none', color: PURPLE, cursor: 'pointer', padding: 0, fontSize: 13, fontWeight: 600, transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            {authMode === 'signup' ? 'Sign in' : 'Sign up →'}
          </button>
        </p>
      </div>
    </div>
  )
}

function Lightbox({ src, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      <img onClick={e => e.stopPropagation()} src={src} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 10, objectFit: 'contain' }} />
    </div>
  )
}

function HoldToDelete({ onConfirm }) {
  const HOLD_MS = 5000
  const [holding, setHolding] = useState(false)
  const [fill, setFill] = useState(0)
  const [countdown, setCountdown] = useState(5)
  const timerRef = useRef(null)
  const intervalRef = useRef(null)
  const startRef = useRef(null)

  function start() {
    setHolding(true)
    startRef.current = Date.now()
    setFill(0)
    setCountdown(5)

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min((elapsed / HOLD_MS) * 100, 100)
      setFill(pct)
      setCountdown(Math.max(1, Math.ceil((HOLD_MS - elapsed) / 1000)))
    }, 50)

    timerRef.current = setTimeout(() => {
      cleanup()
      onConfirm()
    }, HOLD_MS)
  }

  function cancel() {
    cleanup()
    setHolding(false)
    setFill(0)
    setCountdown(5)
  }

  function cleanup() {
    clearTimeout(timerRef.current)
    clearInterval(intervalRef.current)
  }

  useEffect(() => () => cleanup(), [])

  const label = holding ? (countdown <= 4 ? `Keep holding... ${countdown}s` : 'Keep holding...') : 'Hold to delete all chats'

  return (
    <button
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      style={{ position: 'relative', overflow: 'hidden', width: '100%', padding: '11px', borderRadius: 8, background: 'transparent', border: `1px solid ${RED}`, color: RED, fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.04em', textAlign: 'center', userSelect: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: RED, width: `${fill}%`, transition: holding ? 'none' : 'width 0.15s', zIndex: 0 }} />
      <span style={{ position: 'relative', zIndex: 1, color: holding ? '#fff' : RED, transition: 'color 0.1s' }}>{label}</span>
    </button>
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
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [showWhatsNew, setShowWhatsNew] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsView, setSettingsView] = useState('menu')
  const [deleteAllError, setDeleteAllError] = useState('')
  const [lightboxImage, setLightboxImage] = useState(null)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = e => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  const [name, setName] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [attachment, setAttachment] = useState(null)
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [settingsHovered, setSettingsHovered] = useState(false)
  const [noCreditsError, setNoCreditsError] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const [useWebSearch, setUseWebSearch] = useState(() => {
  return localStorage.getItem('useWebSearch') === 'true'
})

useEffect(() => {
  localStorage.setItem('useWebSearch', useWebSearch)
}, [useWebSearch])

  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('theme') || 'system')

  useEffect(() => {
    localStorage.setItem('theme', themeMode)
    if (themeMode !== 'system') {
      document.documentElement.setAttribute('data-theme', themeMode)
      return
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light')
    const handler = e => document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [themeMode])

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
      const savedAppearance = session?.user?.user_metadata?.appearance
      if (savedAppearance) setThemeMode(savedAppearance)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setName(session.user.user_metadata?.full_name?.split(' ')[0] || '')
        loadUserData(session.user)
        const savedAppearance = session.user.user_metadata?.appearance
        if (savedAppearance) setThemeMode(savedAppearance)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Check for payment success in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      window.history.replaceState({}, '', '/')
      setPaymentSuccess(true)
      setTimeout(() => setPaymentSuccess(false), 5000)
      setTimeout(() => loadUserData(user), 2000) // wait for webhook to process
    }
  }, [user])

  async function loadUserData(currentUser) {
    if (!currentUser) return
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const res = await fetch('https://consensusai-production-0e01.up.railway.app/api/me', {
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
            sources: m.content?.sources || [],
            isPremium: chat.mode === 'premium',
          }))
        }))
        setChats(formatted)
        
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
      attachment: attachment ? { name: attachment.name, type: attachment.type, data: attachment.type?.startsWith('image/') ? attachment.data : null } : null
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
     body: JSON.stringify({ prompt: userMessage, attachment, useWebSearch })
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
              sources: parsed.sources || [],
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
    setPrompt('')
    setStreamingText('')
    setStatusText('')
    setLiveRounds(null)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function switchChat(chat) {
    setActiveChatId(chat.id)
    setMessages(chat.messages)
  }

  async function handleDeleteAllChats() {
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const res = await fetch('https://consensusai-production-0e01.up.railway.app/api/chats/all', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed')
      setChats([])
      setMessages([])
      setActiveChatId(null)
      setShowSettings(false)
      setSettingsView('menu')
    } catch (err) {
      setDeleteAllError(err.message)
    }
  }

  async function handleDeleteChat(chatId) {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    await fetch(`https://consensusai-production-0e01.up.railway.app/api/chats/${chatId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    setChats(prev => prev.filter(c => c.id !== chatId))
    if (activeChatId === chatId) {
      setActiveChatId(null)
      setMessages([])
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  function exportPDF(msg, question) {
    const content = `VELE AI Export\n${'='.repeat(50)}\n\nMode: ${msg.isPremium ? 'Premium' : 'Standard'}\nQuestion: ${question}\n\nAnswer:\n${msg.content.summary}\n\nGPT-4o:\n${msg.individual?.openai || ''}\n\nClaude:\n${msg.individual?.claude || ''}\n\nDeepSeek:\n${msg.individual?.deepseek || ''}\n\nGrok:\n${msg.individual?.grok || ''}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `vele-ai-${Date.now()}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })

  if (authLoading) return (
    <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--c-readable)', letterSpacing: '0.1em' }}>LOADING...</div>
    </div>
  )

  if (!user) return <LoginPage />

  return (
    <div style={{ display: 'flex', height: '100vh', height: '100dvh', overflow: 'hidden', background: 'transparent', color: TEXT, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      <input type="file" accept="image/*,.pdf,.txt,.md" style={{ display: 'none' }} id="file-input" onChange={e => handleFile(e.target.files[0])} />

      {/* Ambient orb layer — fixed, full viewport, behind all UI chrome */}
      <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none', overflow: 'visible', opacity: themeMode === 'light' || (themeMode === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches) ? 0 : 1 }}>
        <div style={{ position: 'absolute', width: 500, height: 500, background: 'radial-gradient(circle, rgba(167,139,250,0.30) 0%, transparent 70%)', top: '10%', left: '10%', filter: 'blur(80px)', borderRadius: '50%', animation: 'orb1 15s ease-in-out infinite', willChange: 'transform' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, background: 'radial-gradient(circle, rgba(167,139,250,0.30) 0%, transparent 70%)', top: '40%', left: '60%', filter: 'blur(80px)', borderRadius: '50%', animation: 'orb2 18s ease-in-out infinite', willChange: 'transform' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, background: 'radial-gradient(circle, rgba(167,139,250,0.30) 0%, transparent 70%)', top: '60%', left: '20%', filter: 'blur(80px)', borderRadius: '50%', animation: 'orb3 12s ease-in-out infinite', willChange: 'transform' }} />
      </div>

      {showWhatsNew && <UpdateAnnouncementModal onDismiss={() => setShowWhatsNew(false)} />}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} user={user} />}
      {showInfo && (
        <InfoPage onClose={() => setShowInfo(false)} />
      )}

      {showBuyModal && <BuyCreditsModal onClose={() => setShowBuyModal(false)} user={user} onPurchase={() => loadUserData(user)} />}

      {paymentSuccess && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 200, background: SURFACE, border: `1px solid ${GREEN}`, borderRadius: 10, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 0 24px ${GREEN}20`, animation: 'msgSlideIn 300ms ease-out both' }}>
          <span style={{ color: GREEN, fontSize: 16 }}>✓</span>
          <span style={{ fontSize: 13, fontFamily: 'monospace', color: TEXT }}>Credits added to your account!</span>
          <button onClick={() => setPaymentSuccess(false)} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: 14, padding: 0, marginLeft: 4 }}>✕</button>
        </div>
      )}

      {lightboxImage && <Lightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />}

      {showSettings && (() => {
        const closeSettings = () => { setShowSettings(false); setSettingsView('menu'); setDeleteAllError('') }
        const menuRow = (label, icon, onClick, danger = false) => (
          <button key={label} onClick={onClick}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 10, background: 'none', border: `1px solid ${BORDER2}`, color: danger ? RED : TEXT, fontSize: 13, cursor: 'pointer', marginBottom: 8, textAlign: 'left', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = danger ? RED : BORDER; e.currentTarget.style.background = danger ? 'var(--c-red-bg)' : CARD }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER2; e.currentTarget.style.background = 'none' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
            {!danger && <span style={{ color: MUTED, fontSize: 12 }}>›</span>}
          </button>
        )
        const backBtn = (label) => (
          <button onClick={() => setSettingsView('menu')}
            style={{ background: 'none', border: 'none', color: MUTED, fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.05em' }}>
            ‹ {label}
          </button>
        )
        return (
          <div onClick={closeSettings} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ position: 'relative', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: isMobile ? 20 : 32, width: isMobile ? 'calc(100vw - 32px)' : 400, borderTop: `2px solid ${AMBER}`, animation: 'msgSlideIn 200ms ease-out both' }}>
              <button onClick={closeSettings} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: MUTED, fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 4 }}>✕</button>

              {settingsView === 'menu' && (
                <>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.15em', marginBottom: 20 }}>SETTINGS</div>
                  {menuRow('Account', '⊙', () => setSettingsView('account'))}
                  {menuRow('Credits', '⬡', () => setSettingsView('credits'))}
                  {menuRow('Appearance', '◑', () => setSettingsView('appearance'))}
                  <div style={{ borderTop: `1px solid var(--c-danger-sep)`, paddingTop: 12, marginTop: 4 }}>
                    <div style={{ fontSize: 9, fontFamily: 'monospace', color: 'var(--c-red-a99)', letterSpacing: '0.15em', marginBottom: 10 }}>DANGER ZONE</div>
                    {menuRow('Delete All Chats', '⊘', () => setSettingsView('delete'), true)}
                  </div>

                  <div style={{ borderTop: `1px solid ${BORDER2}`, paddingTop: 12, marginTop: 4 }}>
                    <button
                      onClick={async () => {
                        if (!window.confirm('Sign out of VELE AI?')) return
                        closeSettings()
                        await supabase.auth.signOut()
                      }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 10, background: 'none', border: `1px solid ${BORDER2}`, color: RED, fontSize: 13, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = RED; e.currentTarget.style.background = 'var(--c-red-bg)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER2; e.currentTarget.style.background = 'none' }}
                    >
                      <span style={{ flex: 1 }}>Sign Out</span>
                    </button>
                  </div>

                </>
              )}

              {settingsView === 'account' && (
                <>
                  {backBtn('SETTINGS')}
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.15em', marginBottom: 16 }}>ACCOUNT</div>
                  <div style={{ background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, letterSpacing: '0.08em', marginBottom: 6 }}>SIGNED IN AS</div>
                    <div style={{ fontSize: 14, color: TEXT, wordBreak: 'break-all' }}>{user.email}</div>
                  </div>
                  <button onClick={async () => { await supabase.auth.signOut(); closeSettings() }}
                    style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'none', border: `1px solid ${BORDER}`, color: MUTED, fontSize: 13, cursor: 'pointer' }}>
                    Sign Out
                  </button>
                </>
              )}

              {settingsView === 'credits' && (
                <>
                  {backBtn('SETTINGS')}
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.15em', marginBottom: 16 }}>CREDITS</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                    <div style={{ background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: AMBER }}>{credits.standard_credits}</div>
                      <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED2, marginTop: 4 }}>STANDARD</div>
                    </div>
                    <div style={{ background: `${PURPLE}10`, border: `1px solid ${PURPLE}30`, borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: PURPLE }}>{credits.premium_credits}</div>
                      <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED2, marginTop: 4 }}>PREMIUM</div>
                    </div>
                  </div>
                  <button onClick={() => { closeSettings(); setShowBuyModal(true) }}
                    style={{ width: '100%', padding: '12px', borderRadius: 10, background: AMBER, border: 'none', color: BG, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Buy More Credits
                  </button>
                </>
              )}

              {settingsView === 'appearance' && (
                <>
                  {backBtn('SETTINGS')}
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.15em', marginBottom: 16 }}>APPEARANCE</div>
                  <div style={{ background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 10, overflow: 'hidden' }}>
                    {[{ label: 'Dark', icon: '◑', value: 'dark' }, { label: 'Light', icon: '○', value: 'light' }, { label: 'System', icon: '◎', value: 'system' }].map((opt, idx, arr) => (
                      <div key={opt.value} onClick={() => { setThemeMode(opt.value); supabase.auth.updateUser({ data: { appearance: opt.value } }) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: idx < arr.length - 1 ? `1px solid ${BORDER2}` : 'none', cursor: 'pointer', background: themeMode === opt.value ? `${PURPLE}10` : 'transparent', transition: 'background 0.15s' }}>
                        <span style={{ fontSize: 15 }}>{opt.icon}</span>
                        <span style={{ flex: 1, fontSize: 13, color: TEXT }}>{opt.label}</span>
                        {themeMode === opt.value && <div style={{ width: 18, height: 18, borderRadius: '50%', background: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }}/></div>}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {settingsView === 'delete' && (
                <>
                  {backBtn('SETTINGS')}
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: RED, letterSpacing: '0.15em', marginBottom: 16 }}>DELETE ALL CHATS</div>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 24 }}>This will permanently delete all your chats and message history. Hold the button below to confirm.</p>
                  <HoldToDelete onConfirm={handleDeleteAllChats} />
                  {deleteAllError && <div style={{ marginTop: 10, fontSize: 11, color: RED, fontFamily: 'monospace' }}>{deleteAllError}</div>}
                </>
              )}
            </div>
          </div>
        )
      })()}

      {isMobile && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 49, opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'auto' : 'none', transition: 'opacity 250ms ease-out' }} />
      )}
      {(sidebarOpen || isMobile) && (
        <div style={isMobile ? { position: 'fixed', top: 0, left: 0, height: '100dvh', width: '85vw', maxWidth: 320, background: SURFACE, borderRight: `1px solid ${BORDER2}`, display: 'flex', flexDirection: 'column', zIndex: 50, overflowY: 'auto', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 320ms cubic-bezier(0.4, 0, 0.2, 1)' } : { width: 240, background: SURFACE, borderRight: `1px solid ${BORDER2}`, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${BORDER2}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/android-chrome-192x192.png" alt="VELE AI" style={{ width: 32, height: 32, borderRadius: 8 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>VELE AI</div>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.08em', marginTop: 2 }}>MULTI-MODEL SYNTHESIS</div>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: 16, padding: 4, lineHeight: 1 }}>✕</button>
            </div>
            <button onClick={() => { newChat(); if (isMobile) setSidebarOpen(false) }} style={{ width: '100%', padding: '8px 12px', borderRadius: 7, background: AMBER_DIM, border: '1px solid var(--c-amber-a30)', color: AMBER, fontSize: 12, cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}>
              + New chat
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: MUTED2, letterSpacing: '0.12em', padding: '0 8px', marginBottom: 6 }}>SESSIONS</div>
            {chats.map(chat => (
              <ChatItem key={chat.id} chat={chat} active={chat.id === activeChatId}
                onSelect={() => { switchChat(chat); if (isMobile) setSidebarOpen(false) }}
                onRename={newTitle => setChats(prev => prev.map(c => c.id === chat.id ? { ...c, title: newTitle } : c))}
                onDelete={() => handleDeleteChat(chat.id)} />
            ))}
          </div>

          <div style={{ padding: '12px 16px', borderTop: `1px solid ${BORDER2}` }}>
            <div style={{ marginTop: 0, marginBottom: 8, display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: AMBER }}>{credits.standard_credits}</div>
                <div style={{ fontSize: 9, fontFamily: 'monospace', color: MUTED2 }}>STD</div>
              </div>
              <div style={{ flex: 1, background: `${PURPLE}10`, border: `1px solid ${PURPLE}30`, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: PURPLE, textShadow: mode === 'premium' ? `0 0 8px ${PURPLE}60` : 'none', transition: 'text-shadow 0.2s' }}>{credits.premium_credits}</div>
                <div style={{ fontSize: 9, fontFamily: 'monospace', color: MUTED2 }}>PREMIUM</div>
              </div>
              <button onClick={() => setShowBuyModal(true)}
                style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '6px 10px', color: MUTED, fontSize: 12, cursor: 'pointer' }}>
                +
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button onClick={() => { setShowSettings(true); setDeleteAllError(''); setSettingsView('menu') }}
                onMouseEnter={() => setSettingsHovered(true)} onMouseLeave={() => setSettingsHovered(false)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, background: settingsHovered ? CARD : 'none', border: `1px solid ${settingsHovered ? BORDER : BORDER2}`, color: settingsHovered ? TEXT : MUTED, fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.04em' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Settings
              </button>

              <button onClick={() => setShowFeedback(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, background: 'none', border: `1px solid ${BORDER2}`, color: MUTED, fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.04em' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = PURPLE; e.currentTarget.style.color = PURPLE }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER2; e.currentTarget.style.color = MUTED }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Send Feedback
              </button>

              <button onClick={() => setShowInfo(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, background: 'none', border: `1px solid ${BORDER2}`, color: MUTED, fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.04em' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = PURPLE; e.currentTarget.style.color = PURPLE }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER2; e.currentTarget.style.color = MUTED }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                Info
              </button>
            </div>

            <div style={{ marginTop: 12, fontSize: 10, color: MUTED2, fontFamily: 'monospace', lineHeight: 1.8 }}>
              by Constantin Riegler
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${BORDER2}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, background: BG }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: 6, color: MUTED, cursor: 'pointer', fontSize: 12, padding: '4px 10px', fontFamily: 'monospace' }}>☰</button>
          )}
          <div style={{ flex: 1 }}/>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED2, letterSpacing: '0.08em' }}>{timeStr}</div>
          <button onClick={() => setShowWhatsNew(true)}
            style={{ position: 'relative', background: 'none', border: `1px solid ${BORDER}`, borderRadius: 6, color: MUTED, cursor: 'pointer', fontSize: 11, fontFamily: 'monospace', padding: '4px 8px', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = PURPLE; e.currentTarget.style.color = PURPLE }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED }}>
            ✦ WHAT'S NEW
            <span style={{ position: 'absolute', top: -4, right: -4, width: 7, height: 7, borderRadius: '50%', background: PURPLE, border: `1px solid ${BG}` }} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '48px 0', position: 'relative', zIndex: 1 }}>
          {messages.length === 0 && !loading && (
            <div style={{ maxWidth: 600, margin: '0 auto', padding: isMobile ? '0 16px' : '0 32px', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.15em', marginBottom: 16 }}>VELE AI / TERMINAL</div>
              <div style={{ fontSize: isMobile ? 26 : 36, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 12 }}>
                {getGreeting()}{name ? `, ${name}` : ''}.
              </div>
              <div style={{ fontSize: 15, color: MUTED, marginBottom: mode === 'premium' ? 16 : 48, lineHeight: 1.7 }}>
                <div>{mode === 'premium'
                  ? 'Ask anything. 4 AI models debate your question in multiple rounds, then vote blindly on the best answer.'
                  : 'Ask anything. Your question goes to 4 AI models simultaneously.'}</div>
                {credits.standard_credits > 0 && <div style={{ color: GREEN }}>{credits.standard_credits} standard {credits.standard_credits === 1 ? 'query' : 'queries'} remaining.</div>}
                {credits.premium_credits > 0 && <div style={{ color: PURPLE }}>{credits.premium_credits} premium {credits.premium_credits === 1 ? 'query' : 'queries'} remaining.</div>}
              </div>
              {mode === 'premium' && (
                <div style={{ fontSize: 12, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.08em', marginBottom: 48, display: 'flex', alignItems: 'center', gap: 8, opacity: 0.85 }}>
                  <span>◆</span>
                  <span>PREMIUM MODE — DEEPER REASONING · BLIND VOTING · HIGHEST QUALITY ANSWER</span>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 8 : 10, marginBottom: 24 }}>
                {FEATURE_DETAILS.map((f, i) => <FeatureCard key={i} feature={f} isMobile={isMobile} />)}
              </div>
              <div style={{ fontSize: 11, color: MUTED2, fontFamily: 'monospace', marginBottom: 32, letterSpacing: '0.06em' }}>CREATED BY CONSTANTIN RIEGLER</div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="chat-message" style={{ maxWidth: 720, margin: '0 auto 48px', padding: isMobile ? '0 16px' : '0 32px', position: 'relative', zIndex: 1 }}>
              {msg.role === 'user' ? (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED2, letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>QUERY</span>
                    {msg.isPremium && <span style={{ color: PURPLE }}>◆ PREMIUM</span>}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, lineHeight: 1.3, borderLeft: `3px solid ${msg.isPremium ? PURPLE : AMBER}`, paddingLeft: 16 }}>
                    {msg.content}
                  </div>
                  {msg.attachment?.type?.startsWith('image/') && msg.attachment.data && (
                    <div style={{ paddingLeft: 19, marginTop: 10 }}>
                      <img
                        src={`data:${msg.attachment.type};base64,${msg.attachment.data}`}
                        onClick={() => setLightboxImage(`data:${msg.attachment.type};base64,${msg.attachment.data}`)}
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: `1px solid ${BORDER}`, cursor: 'pointer', display: 'block' }}
                      />
                    </div>
                  )}
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

                  <ModelAgreementBar content={msg.content} resolution={msg.isPremium ? msg.resolution : null} isPremium={msg.isPremium} />

                  {msg.isPremium && msg.votes && <VoteTally votes={msg.votes} counts={msg.resolution?.counts} resolution={msg.resolution} />}

                  {!msg.isPremium && (
                    <div style={{ marginBottom: 16, padding: isMobile ? '14px 16px' : '20px 24px', background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 10 }}>
                      <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, letterSpacing: '0.12em', marginBottom: 18 }}>SIGNAL ANALYSIS</div>
                      <ConfidenceBar color={GREEN} points={msg.content.agreed} label="Consensus" />
                      <ConfidenceBar color={YELLOW} points={msg.content.partial} label="Partial agreement" />
                      <ConfidenceBar color={RED} points={msg.content.conflicted} label="Conflicting signals" />
                    </div>
                  )}

                  {msg.sources?.length > 0 && (
                    <div style={{ marginBottom: 16, padding: isMobile ? '14px 16px' : '16px 20px', background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 10 }}>
                      <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, letterSpacing: '0.12em', marginBottom: 12 }}>SOURCES</div>
                      {msg.sources.map((src, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 10, fontFamily: 'monospace', color: AMBER, flexShrink: 0, marginTop: 1 }}>[{idx + 1}]</span>
                          <div>
                            <a href={src.url} target="_blank" rel="noopener noreferrer" className="source-link"
                              style={{ fontSize: 12, color: TEXT, textDecoration: 'none', display: 'block', lineHeight: 1.4 }}
                              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                              {src.title}
                            </a>
                            <span style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, display: 'block', marginTop: 2 }}>
                              {(() => { try { return new URL(src.url).hostname.replace('www.', '') } catch { return src.url } })()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <IndividualAnswers individual={msg.individual} />
                  {msg.isPremium && <DebateHistory rounds={msg.rounds} />}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '0 16px' : '0 32px' }}>
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
          @keyframes msgSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          textarea::placeholder { color: var(--c-placeholder) !important; }
          .chat-message { animation: msgSlideIn 250ms ease-out both; }
          @media (max-width: 768px) {
            .source-link { word-break: break-all !important; }
            .mode-toggle-wrap { padding: 1px !important; }
            .mode-btn { height: 30px !important; padding: 0 10px !important; font-size: 10px !important; border-radius: 4px !important; box-sizing: border-box !important; transition: all 150ms ease-out !important; }
            .premium-diamond { display: none !important; }
            button { transition: opacity 150ms ease-out, transform 150ms ease-out, background 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out !important; }
            button:active { opacity: 0.72 !important; transform: scale(0.95) !important; }
          }
        `}</style>

        <div style={{ padding: isMobile ? '12px 16px' : '16px 32px', paddingBottom: isMobile ? 'max(env(safe-area-inset-bottom), 12px)' : '16px', borderTop: `1px solid ${BORDER2}`, background: BG, position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {attachment && (
              attachment.type?.startsWith('image/') ? (
                <div style={{ marginBottom: 10, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={`data:${attachment.type};base64,${attachment.data}`}
                      onClick={() => setLightboxImage(`data:${attachment.type};base64,${attachment.data}`)}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: `1px solid ${BORDER}`, cursor: 'pointer', display: 'block' }}
                    />
                    <button onClick={() => setAttachment(null)} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.75)', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1 }}>✕</button>
                  </div>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, marginTop: 4, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachment.name}</span>
                </div>
              ) : (
                <div style={{ marginBottom: 10, padding: '6px 12px', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 7, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: AMBER }}>+</span>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--c-muted5)', flex: 1 }}>{attachment.name}</span>
                  <button onClick={() => setAttachment(null)} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: 14, padding: 0 }}>✕</button>
                </div>
              )
            )}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ModeToggle mode={mode} setMode={setMode} disabled={loading} />
                  {isMobile && (
                    <button onClick={() => setUseWebSearch(!useWebSearch)}
                      title={useWebSearch ? 'Web search ON' : 'Web search OFF'}
                      style={{ background: useWebSearch ? (mode === 'premium' ? `${PURPLE}20` : 'var(--c-amber-a20)') : CARD, border: `1px solid ${useWebSearch ? (mode === 'premium' ? PURPLE : AMBER) : BORDER}`, borderRadius: 7, height: 32, padding: '0 10px', cursor: 'pointer', color: useWebSearch ? (mode === 'premium' ? PURPLE : AMBER) : MUTED, fontSize: 10, fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', transition: 'all 0.15s', flexShrink: 0 }}>WEB</button>
                  )}
                </div>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED2, textAlign: 'right' }}>
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
            </div>
            <div style={{ position: 'relative' }}>
              <textarea
                ref={inputRef}
                autoFocus
                placeholder={mode === 'premium' ? 'Ask anything — models will debate' : 'Ask anything...'}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={e => { const file = e.clipboardData.files[0]; if (file) handleFile(file) }}
                rows={1}
                style={{ width: '100%', padding: isMobile ? '12px 92px 12px 14px' : '14px 90px 14px 80px', borderRadius: 10, border: `1px solid ${mode === 'premium' ? (prompt ? `${PURPLE}90` : `${PURPLE}50`) : (prompt ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)')}`, background: SURFACE, color: TEXT, fontSize: 15, resize: 'none', lineHeight: 1.6, boxSizing: 'border-box', transition: 'border-color 0.2s', outline: 'none', caretColor: mode === 'premium' ? PURPLE : AMBER }}
              />
              {!isMobile && (
                <button onClick={() => setUseWebSearch(!useWebSearch)}
                  title={useWebSearch ? 'Web search ON' : 'Web search OFF'}
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: useWebSearch ? (mode === 'premium' ? `${PURPLE}20` : 'var(--c-amber-a20)') : CARD, border: `1px solid ${useWebSearch ? (mode === 'premium' ? PURPLE : AMBER) : BORDER}`, borderRadius: 7, height: 36, padding: '0 12px', cursor: 'pointer', color: useWebSearch ? (mode === 'premium' ? PURPLE : AMBER) : MUTED, fontSize: 10, fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>WEB</button>
              )}
              <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 6 }}>
                <button onClick={() => document.getElementById('file-input').click()}
                  style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 7, width: isMobile ? 40 : 36, height: isMobile ? 40 : 36, cursor: 'pointer', color: MUTED, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⊕</button>
                <button onClick={handleSubmit} disabled={loading}
                  style={{ background: prompt && !loading ? (mode === 'premium' ? PURPLE : AMBER) : MUTED2, border: 'none', borderRadius: 7, width: isMobile ? 40 : 36, height: isMobile ? 40 : 36, cursor: !loading && prompt ? 'pointer' : 'default', color: prompt ? (mode === 'premium' ? '#fff' : BG) : MUTED, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', fontWeight: 700 }}>↑</button>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: 10, fontFamily: 'monospace', color: MUTED2, marginTop: 8, letterSpacing: '0.05em' }}>
            ENTER TO SEND · PASTE OR CLICK ⊕ TO ATTACH · WEB FOR LIVE SEARCH
          </div>
        </div>
      </div>
    </div>
  )
}// v2 force rebuild
