import { useState, useEffect, useRef } from 'react'

// June 15 2026, 15:00 CEST = 13:00 UTC
const TARGET = new Date('2026-06-15T13:00:00Z')
const CODE   = 'CR2010'

const PURPLE = '#7C3AED'
const BG     = '#0a0a0a'
const SURFACE = '#0f0f0f'
const BORDER  = '#222'
const TEXT    = '#e8e6e0'
const MUTED   = '#555'
const RED     = '#ef4444'

function getTimeLeft() {
  const diff = Math.max(0, TARGET - Date.now())
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: diff <= 0,
  }
}

function pad(n) { return String(n).padStart(2, '0') }

export default function EarlyAccessGate({ onGranted }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)
  const [code, setCode]         = useState('')
  const [error, setError]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const id = setInterval(() => {
      const t = getTimeLeft()
      setTimeLeft(t)
      if (t.expired) onGranted()
    }, 1000)
    return () => clearInterval(id)
  }, [onGranted])

  function handleSubmit(e) {
    e.preventDefault()
    if (code.trim().toUpperCase() === CODE) {
      setSubmitting(true)
      localStorage.setItem('earlyAccessGranted', 'true')
      onGranted()
    } else {
      setError('Invalid access code.')
      setCode('')
      inputRef.current?.focus()
    }
  }

  const unit = (value, label) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 64 }}>
      <div style={{
        fontSize: 'clamp(32px, 8vw, 52px)',
        fontFamily: 'monospace',
        fontWeight: 700,
        color: TEXT,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {pad(value)}
      </div>
      <div style={{ fontSize: 9, fontFamily: 'monospace', color: MUTED, letterSpacing: '0.18em' }}>
        {label}
      </div>
    </div>
  )

  const separator = (
    <div style={{ fontSize: 'clamp(24px, 6vw, 40px)', fontFamily: 'monospace', color: MUTED, fontWeight: 300, lineHeight: 1, marginBottom: 18, userSelect: 'none' }}>:</div>
  )

  return (
    <div style={{
      minHeight: '100dvh',
      background: BG,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px 48px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>

      {/* Ambient orb */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute',
          width: 600, height: 600,
          background: `radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)`,
          top: '20%', left: '50%', transform: 'translateX(-50%)',
          filter: 'blur(80px)', borderRadius: '50%',
          animation: 'orb1 15s ease-in-out infinite',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Logo */}
        <img
          src="/android-chrome-192x192.png"
          alt="VELE AI"
          style={{ width: 56, height: 56, borderRadius: 16, marginBottom: 20, boxShadow: `0 0 32px ${PURPLE}40` }}
        />

        {/* Early Access label */}
        <div style={{
          fontSize: 12,
          fontFamily: 'monospace',
          color: PURPLE,
          letterSpacing: '0.25em',
          marginBottom: 10,
          fontWeight: 700,
        }}>
          EARLY ACCESS
        </div>

        {/* Countdown */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(8px, 3vw, 20px)',
          marginBottom: 32,
        }}>
          {unit(timeLeft.days, 'DAYS')}
          {separator}
          {unit(timeLeft.hours, 'HOURS')}
          {separator}
          {unit(timeLeft.minutes, 'MINUTES')}
          {separator}
          {unit(timeLeft.seconds, 'SECONDS')}
        </div>

        {/* Subtext */}
        <p style={{
          fontSize: 14,
          color: MUTED,
          margin: '0 0 28px',
          textAlign: 'center',
          lineHeight: 1.6,
          letterSpacing: '0.01em',
        }}>
          Enter your access code to continue.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            ref={inputRef}
            value={code}
            onChange={e => { setCode(e.target.value); setError('') }}
            placeholder="Access code"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            style={{
              width: '100%',
              padding: '13px 15px',
              borderRadius: 10,
              border: `1.5px solid ${error ? RED : BORDER}`,
              background: SURFACE,
              color: TEXT,
              fontSize: 15,
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
              textTransform: 'uppercase',
            }}
            onFocus={e => { if (!error) e.target.style.borderColor = PURPLE }}
            onBlur={e => { if (!error) e.target.style.borderColor = BORDER }}
          />

          {error && (
            <div style={{ fontSize: 12, color: RED, fontFamily: 'monospace', letterSpacing: '0.04em', marginTop: -4 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !code.trim()}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 10,
              background: code.trim() ? PURPLE : '#2a1a4a',
              border: 'none',
              color: code.trim() ? '#fff' : '#6b5a8a',
              fontSize: 14,
              fontWeight: 600,
              cursor: code.trim() ? 'pointer' : 'default',
              letterSpacing: '0.02em',
              transition: 'all 0.15s',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}
            onMouseEnter={e => { if (code.trim()) e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {submitting ? 'Verifying...' : 'Continue'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: 40, fontSize: 10, fontFamily: 'monospace', color: '#333', letterSpacing: '0.1em' }}>
          VELE AI — MULTI-MODEL SYNTHESIS
        </div>
      </div>
    </div>
  )
}
