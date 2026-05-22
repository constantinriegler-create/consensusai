import { useEffect, useRef } from 'react'

const PURPLE = '#a855f7'
const BG = 'var(--c-bg)'
const SURFACE = 'var(--c-surface)'
const CARD = 'var(--c-card)'
const BORDER = 'var(--c-border)'
const BORDER2 = 'var(--c-border2)'
const TEXT = 'var(--c-text)'
const MUTED = 'var(--c-muted)'
const MUTED2 = 'var(--c-muted2)'

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontFamily: 'monospace', color: PURPLE,
      letterSpacing: '0.18em', fontWeight: 700, marginBottom: 14,
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontSize: 22, fontWeight: 700, color: TEXT,
      margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.2,
    }}>
      {children}
    </h2>
  )
}

function BodyText({ children, style }) {
  return (
    <p style={{
      fontSize: 14, color: 'var(--c-readable)', lineHeight: 1.75,
      margin: 0, ...style,
    }}>
      {children}
    </p>
  )
}

function Divider() {
  return <div style={{ height: 1, background: BORDER2, margin: '48px 0' }} />
}

function StepList({ steps }) {
  return (
    <ol style={{ margin: '16px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {steps.map((step, i) => (
        <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%', background: `${PURPLE}20`,
            border: `1px solid ${PURPLE}50`, color: PURPLE, fontSize: 11,
            fontFamily: 'monospace', fontWeight: 700, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
          }}>
            {i + 1}
          </div>
          <span style={{ fontSize: 14, color: 'var(--c-muted5)', lineHeight: 1.6 }}>{step}</span>
        </li>
      ))}
    </ol>
  )
}

function BulletList({ items, color }) {
  const dotColor = color || PURPLE
  return (
    <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%', background: dotColor,
            flexShrink: 0, marginTop: 7,
          }} />
          <span style={{ fontSize: 14, color: 'var(--c-muted5)', lineHeight: 1.6 }}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function CostBadge({ label, price, color }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '10px 16px', borderRadius: 8,
      background: `${color}12`, border: `1px solid ${color}30`,
      marginTop: 20,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: 11, fontFamily: 'monospace', color, letterSpacing: '0.06em' }}>{label}</span>
      <div style={{ width: 1, height: 14, background: `${color}30` }} />
      <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{price}</span>
      <span style={{ fontSize: 11, color: MUTED }}>per 10 queries</span>
    </div>
  )
}

function ModelCard({ name, provider, color, description }) {
  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`,
      borderRadius: 12, padding: '18px 20px',
      borderTop: `2px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{name}</span>
        <span style={{ fontSize: 11, color: MUTED, fontFamily: 'monospace' }}>{provider}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--c-muted5)', lineHeight: 1.6, margin: 0 }}>{description}</p>
    </div>
  )
}

function InfoSection({ label, children, id }) {
  return (
    <section id={id} style={{ marginBottom: 0 }}>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </section>
  )
}

export default function InfoPage({ onClose }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: BG, overflowY: 'auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      }}
      ref={scrollRef}
    >
      {/* Fixed header bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: BG,
        borderBottom: `1px solid ${BORDER2}`,
        padding: '0 24px',
        height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/android-chrome-192x192.png" alt="VELE AI" style={{ width: 24, height: 24, borderRadius: 6 }} />
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.18em', fontWeight: 700 }}>
            VELE AI — INFO
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: 7, color: MUTED, fontSize: 13,
            cursor: 'pointer', padding: '5px 12px',
            fontFamily: 'monospace', letterSpacing: '0.06em',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = TEXT; e.currentTarget.style.borderColor = BORDER }}
          onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER2 }}
        >
          ESC
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '52px 24px 80px' }}>

        {/* ── ABOUT ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.18em', marginBottom: 20 }}>
            ABOUT VELE AI
          </div>
          <h1 style={{
            fontSize: 36, fontWeight: 800, color: TEXT,
            margin: '0 0 20px', letterSpacing: '-0.03em', lineHeight: 1.1,
          }}>
            Multi-model<br />intelligence.
          </h1>
          <p style={{ fontSize: 16, color: 'var(--c-readable)', lineHeight: 1.75, margin: '0 0 20px', maxWidth: 580 }}>
            VELE AI is a multi-model synthesis platform that queries multiple leading AI models
            simultaneously and synthesizes their responses into a single, high-quality answer.
            Instead of choosing one AI, you get the combined intelligence of many.
          </p>
          <div style={{
            display: 'flex', gap: 8, flexWrap: 'wrap',
          }}>
            {[
              { dot: '#10a37f', label: 'GPT-4o' },
              { dot: '#cc785c', label: 'Claude' },
              { dot: '#4d6bfe', label: 'DeepSeek' },
              { dot: '#e8e8e8', label: 'Grok' },
              { dot: PURPLE, label: 'Synthesis' },
            ].map(m => (
              <div key={m.label} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '5px 12px', borderRadius: 20,
                background: CARD, border: `1px solid ${BORDER2}`,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot }} />
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--c-readable)' }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── STANDARD MODE ─────────────────────────────────── */}
        <InfoSection label="STANDARD MODE">
          <SectionTitle>Fast, parallel synthesis</SectionTitle>
          <BodyText>
            All four AI models answer your question independently and simultaneously. VELE then
            synthesizes their responses into one cohesive, confident answer — with a score
            showing how much the models agreed.
          </BodyText>

          <div style={{ margin: '28px 0', borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER2}`, background: SURFACE }}>
            <img
              src="/info-standard.svg"
              alt="Standard mode diagram: query fans out to 4 models plus optional web search, then synthesized into one answer"
              style={{ width: '100%', display: 'block', padding: '8px 0' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 20px 16px' }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.14em', marginBottom: 14 }}>
                HOW IT WORKS
              </div>
              <StepList steps={[
                'You ask a question',
                'All 4 models answer simultaneously and independently',
                'VELE synthesizes their responses into one cohesive answer',
                'You see a confidence score showing how much the models agreed',
              ]} />
            </div>

            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 20px 16px' }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.14em', marginBottom: 14 }}>
                BEST FOR
              </div>
              <BulletList items={[
                'Quick research and general questions',
                'When you need one solid answer fast',
                'Everyday tasks and lookups',
                'Budget-conscious users',
              ]} />
            </div>
          </div>

          <CostBadge label="STANDARD" price="$1.99" color="var(--c-amber)" />
        </InfoSection>

        <Divider />

        {/* ── PREMIUM MODE ──────────────────────────────────── */}
        <InfoSection label="PREMIUM MODE">
          <SectionTitle>3-round debate with blind vote</SectionTitle>
          <BodyText>
            Premium takes multi-model AI to the next level. Models don't just answer — they
            debate. After seeing each other's reasoning, they vote blindly on the best response.
            You get the full debate transcript plus the winner.
          </BodyText>

          <div style={{ margin: '28px 0', borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER2}`, background: SURFACE }}>
            <img
              src="/info-premium.svg"
              alt="Premium mode diagram: 3-round debate — initial answers, opposition, then blind voting before synthesis"
              style={{ width: '100%', display: 'block', padding: '8px 0' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 20px 16px', borderTop: `2px solid ${PURPLE}` }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.14em', marginBottom: 14 }}>
                HOW IT WORKS
              </div>
              <StepList steps={[
                'You ask a question',
                'Round 1: All 4 models give their initial response',
                'Round 2: Models see each other\'s answers and refine their thinking',
                'Round 3: Models vote blindly on the best answer',
                'You see the full debate, all perspectives, and the winner',
              ]} />
            </div>

            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 20px 16px', borderTop: `2px solid ${PURPLE}` }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.14em', marginBottom: 14 }}>
                BEST FOR
              </div>
              <BulletList items={[
                'Important decisions that need multiple expert perspectives',
                'Complex topics where disagreement reveals insight',
                'Research and deep analysis',
                'Finding and catching errors (models debate each other)',
                'Understanding the reasoning behind answers',
              ]} color={PURPLE} />
            </div>
          </div>

          <CostBadge label="◆ PREMIUM" price="$4.99" color={PURPLE} />
        </InfoSection>

        <Divider />

        {/* ── MODELS ────────────────────────────────────────── */}
        <InfoSection label="MODELS">
          <SectionTitle>Curated frontier models</SectionTitle>
          <BodyText>
            VELE queries a hand-picked set of leading AI models. The synthesis engine weighs
            and merges their outputs to reduce individual model blind spots and hallucinations.
          </BodyText>

          <div style={{ margin: '28px 0', borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER2}`, background: SURFACE, padding: '4px 0' }}>
            <img
              src="/info-models.svg"
              alt="The four VELE AI models: GPT-4o, Claude, DeepSeek, and Grok"
              style={{ width: '100%', display: 'block' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            <ModelCard
              name="GPT-4o"
              provider="OpenAI"
              color="#10a37f"
              description="Best for creative writing, coding, and general intelligence tasks."
            />
            <ModelCard
              name="Claude 3.5 Sonnet"
              provider="Anthropic"
              color="#cc785c"
              description="Best for reasoning, nuance, careful analysis, and long-form understanding."
            />
            <ModelCard
              name="DeepSeek"
              provider="DeepSeek"
              color="#4d6bfe"
              description="Best for technical depth, math, and research-oriented queries."
            />
            <ModelCard
              name="Grok"
              provider="xAI"
              color="#9ca3af"
              description="Best for current events, unconventional thinking, and real-time context."
            />
          </div>
        </InfoSection>

        <Divider />

        {/* ── WHY MULTI-MODEL ───────────────────────────────── */}
        <InfoSection label="WHY MULTI-MODEL?">
          <SectionTitle>No single model is always right</SectionTitle>
          <BodyText style={{ marginBottom: 20 }}>
            Each AI model has unique strengths, training data, and failure modes. By running your
            query across multiple models and synthesizing the results, VELE delivers more balanced,
            accurate, and comprehensive answers than any single model alone.
          </BodyText>

          <div style={{
            background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: 12, padding: '20px 24px',
            borderLeft: `2px solid ${PURPLE}`,
          }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.14em', marginBottom: 16 }}>
              MULTI-MODEL SYNTHESIS CATCHES WHAT SINGLE MODELS MISS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {[
                { icon: '⊘', title: 'Factual errors', desc: 'Models disagree = red flag' },
                { icon: '◐', title: 'Biased perspectives', desc: 'See multiple viewpoints' },
                { icon: '◈', title: 'Incomplete analysis', desc: 'Combine different expertise' },
                { icon: '◎', title: 'Hallucinations', desc: 'Models fact-check each other' },
              ].map(item => (
                <div key={item.title} style={{
                  background: SURFACE, border: `1px solid ${BORDER2}`,
                  borderRadius: 9, padding: '14px 16px',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: 16, color: PURPLE, flexShrink: 0, lineHeight: 1.3 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 3 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </InfoSection>

        <Divider />

        {/* ── WEB SEARCH ────────────────────────────────────── */}
        <InfoSection label="WEB SEARCH">
          <SectionTitle>Real-time information</SectionTitle>
          <BodyText style={{ marginBottom: 24 }}>
            Web search powered by Tavily is available in both Standard and Premium modes.
            Toggle it on to give models access to live information before they answer.
          </BodyText>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {[
              { label: 'Real-time information', sub: 'Up-to-the-minute data' },
              { label: 'Current prices', sub: 'Prices and availability' },
              { label: 'Recent news', sub: 'Developments and events' },
              { label: 'Research papers', sub: 'Academic sources' },
              { label: 'Verified sources', sub: 'Citations included' },
            ].map(item => (
              <div key={item.label} style={{
                background: '#0d1624', border: '1px solid #185fa520',
                borderRadius: 9, padding: '12px 14px',
                display: 'flex', gap: 10, alignItems: 'center',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#60a5fa', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#93c5fd' }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: '#185fa5', marginTop: 1 }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 20, padding: '12px 16px',
            background: CARD, border: `1px solid ${BORDER2}`,
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa' }} />
            <span style={{ fontSize: 12, color: MUTED, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
              Powered by Tavily · available in Standard and Premium modes
            </span>
          </div>
        </InfoSection>

        {/* Footer */}
        <div style={{
          marginTop: 64, paddingTop: 24,
          borderTop: `1px solid ${BORDER2}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 12,
        }}>
          <img src="/android-chrome-192x192.png" alt="VELE AI" style={{ width: 20, height: 20, borderRadius: 5, opacity: 0.5 }} />
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: MUTED2, letterSpacing: '0.1em' }}>
            VELE AI — MULTI-MODEL SYNTHESIS
          </span>
        </div>
      </div>
    </div>
  )
}
