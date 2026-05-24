import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'

const API = 'https://consensusai-production-0e01.up.railway.app'
const PURPLE = '#a855f7'
const AMBER = '#f59e0b'
const BG = 'var(--c-bg)'
const SURFACE = 'var(--c-surface)'
const CARD = 'var(--c-card)'
const BORDER = 'var(--c-border)'
const BORDER2 = 'var(--c-border2)'
const TEXT = 'var(--c-text)'
const MUTED = 'var(--c-muted)'
const MUTED2 = 'var(--c-muted2)'

export default function SharePage({ shareId }) {
  const { t } = useTranslation()
  const [chat, setChat] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/share/${shareId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { setNotFound(true); return }
        setChat(data)
      })
      .catch(() => setNotFound(true))
  }, [shareId])

  // Allow body to scroll — the main app sets overflow:hidden globally
  useEffect(() => {
    document.body.style.overflow = 'auto'
    document.body.style.height = 'auto'
    document.documentElement.style.overflow = 'auto'
    document.documentElement.style.height = 'auto'
    return () => {
      document.body.style.overflow = ''
      document.body.style.height = ''
      document.documentElement.style.overflow = ''
      document.documentElement.style.height = ''
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('themeMode')
    let htmlTheme
    if (!saved) {
      htmlTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      const resolvedTheme = saved === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : saved
      htmlTheme = resolvedTheme === 'dark-plain' ? 'dark-plain' : resolvedTheme === 'dark' ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-theme', htmlTheme)
  }, [])

  const messages = chat?.messages
    ? [...chat.messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    : []

  return (
    <div style={{ minHeight: '100dvh', background: BG, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: BG, borderBottom: `1px solid ${BORDER2}`,
        padding: '0 24px', height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/android-chrome-192x192.png" alt="VELE AI" style={{ width: 24, height: 24, borderRadius: 6 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, lineHeight: 1 }}>VELE AI</div>
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: AMBER, letterSpacing: '0.1em', marginTop: 2 }}>
              {t('sharedConversation')}
            </div>
          </div>
        </div>
        <a
          href="https://consensusai-three.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: PURPLE, color: '#fff', fontSize: 12,
            fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.06em',
            padding: '7px 16px', borderRadius: 7, textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {t('tryVeleAI')}
        </a>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
        {notFound && (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◈</div>
            <div style={{ fontSize: 15, color: MUTED, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              {t('shareNotAvailable')}
            </div>
          </div>
        )}

        {!notFound && !chat && (
          <div style={{ textAlign: 'center', paddingTop: 80, color: MUTED, fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.08em' }}>
            ...
          </div>
        )}

        {chat && messages.map((msg, i) => (
          <div key={msg.id || i} style={{ marginBottom: 48 }}>
            {msg.role === 'user' ? (
              <div>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED2, letterSpacing: '0.1em', marginBottom: 10 }}>
                  {t('queryLabel')}
                  {chat.mode === 'premium' && <span style={{ marginLeft: 8, color: PURPLE }}>◆ PREMIUM</span>}
                </div>
                <div style={{
                  fontSize: 22, fontWeight: 700, color: TEXT, lineHeight: 1.3,
                  borderLeft: `3px solid ${chat.mode === 'premium' ? PURPLE : AMBER}`,
                  paddingLeft: 16,
                }}>
                  {typeof msg.content === 'object' ? msg.content.text : msg.content}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: chat.mode === 'premium' ? PURPLE : AMBER, letterSpacing: '0.1em' }}>
                    {chat.mode === 'premium' ? t('debateWinner') : t('synthesis')}
                  </div>
                  <div style={{ flex: 1, height: 1, background: BORDER2 }} />
                </div>
                <div style={{
                  padding: '24px 28px',
                  background: SURFACE, border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  borderLeft: `3px solid ${chat.mode === 'premium' ? PURPLE : AMBER}`,
                }}>
                  <div style={{ fontSize: 15, color: TEXT, lineHeight: 1.75 }}>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p style={{ margin: '0 0 12px' }}>{children}</p>,
                        code: ({ inline, children }) => inline
                          ? <code style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '1px 6px', fontSize: 13, fontFamily: 'monospace', color: PURPLE }}>{children}</code>
                          : <pre style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '14px 16px', overflowX: 'auto', margin: '12px 0' }}><code style={{ fontSize: 13, fontFamily: 'monospace', color: TEXT }}>{children}</code></pre>,
                        ul: ({ children }) => <ul style={{ paddingLeft: 20, margin: '8px 0' }}>{children}</ul>,
                        ol: ({ children }) => <ol style={{ paddingLeft: 20, margin: '8px 0' }}>{children}</ol>,
                        li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
                        strong: ({ children }) => <strong style={{ color: TEXT, fontWeight: 600 }}>{children}</strong>,
                        h1: ({ children }) => <h1 style={{ fontSize: 20, fontWeight: 700, color: TEXT, margin: '16px 0 8px' }}>{children}</h1>,
                        h2: ({ children }) => <h2 style={{ fontSize: 17, fontWeight: 600, color: TEXT, margin: '14px 0 6px' }}>{children}</h2>,
                        h3: ({ children }) => <h3 style={{ fontSize: 15, fontWeight: 600, color: TEXT, margin: '12px 0 4px' }}>{children}</h3>,
                      }}
                    >
                      {typeof msg.content === 'object'
                        ? (msg.content?.summary || '')
                        : String(msg.content)}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {chat && (
          <div style={{
            marginTop: 32, paddingTop: 24, borderTop: `1px solid ${BORDER2}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <img src="/android-chrome-192x192.png" alt="VELE AI" style={{ width: 18, height: 18, borderRadius: 4, opacity: 0.4 }} />
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED2, letterSpacing: '0.1em' }}>
              VELE AI — MULTI-MODEL SYNTHESIS
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
