import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

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

function CostBadge({ label, price, perLabel, color }) {
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
      <span style={{ fontSize: 11, color: MUTED }}>{perLabel}</span>
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
  const { t } = useTranslation()
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
            {t('info_nav_label')}
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
          {t('info_esc')}
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '52px 24px 80px' }}>

        {/* ── ABOUT ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.18em', marginBottom: 20 }}>
            {t('info_title')}
          </div>
          <h1 style={{
            fontSize: 36, fontWeight: 800, color: TEXT,
            margin: '0 0 20px', letterSpacing: '-0.03em', lineHeight: 1.1,
          }}>
            {t('info_heading')}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--c-readable)', lineHeight: 1.75, margin: '0 0 20px', maxWidth: 580 }}>
            {t('info_description')}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { dot: '#10a37f', label: 'GPT-4o' },
              { dot: '#cc785c', label: 'Claude' },
              { dot: '#4d6bfe', label: 'DeepSeek' },
              { dot: '#e8e8e8', label: 'Grok' },
              { dot: PURPLE, label: t('synthesis_label') },
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
        <InfoSection label={t('info_standard_label')}>
          <SectionTitle>{t('info_standard_heading')}</SectionTitle>
          <BodyText>{t('info_standard_desc')}</BodyText>

          <div style={{ margin: '28px 0', borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER2}`, background: SURFACE }}>
            <img
              src="/info-standard.svg"
              alt="Standard mode diagram"
              style={{ width: '100%', display: 'block', padding: '8px 0' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 20px 16px' }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.14em', marginBottom: 14 }}>
                {t('info_how_it_works')}
              </div>
              <StepList steps={[
                t('info_std_step1'),
                t('info_std_step2'),
                t('info_std_step3'),
                t('info_std_step4'),
              ]} />
            </div>

            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 20px 16px' }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.14em', marginBottom: 14 }}>
                {t('info_best_for')}
              </div>
              <BulletList items={[
                t('info_std_bullet1'),
                t('info_std_bullet2'),
                t('info_std_bullet3'),
                t('info_std_bullet4'),
              ]} />
            </div>
          </div>

          <CostBadge label={t('info_pricing_standard')} price="$1.99" perLabel={t('info_per_queries')} color="var(--c-amber)" />
        </InfoSection>

        <Divider />

        {/* ── PREMIUM MODE ──────────────────────────────────── */}
        <InfoSection label={t('info_premium_label')}>
          <SectionTitle>{t('info_premium_heading')}</SectionTitle>
          <BodyText>{t('info_premium_desc')}</BodyText>

          <div style={{ margin: '28px 0', borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER2}`, background: SURFACE }}>
            <img
              src="/info-premium.svg"
              alt="Premium mode diagram"
              style={{ width: '100%', display: 'block', padding: '8px 0' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 20px 16px', borderTop: `2px solid ${PURPLE}` }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.14em', marginBottom: 14 }}>
                {t('info_how_it_works')}
              </div>
              <StepList steps={[
                t('info_std_step1'),
                t('info_pre_step2'),
                t('info_pre_step3'),
                t('info_pre_step4'),
                t('info_pre_step5'),
              ]} />
            </div>

            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 20px 16px', borderTop: `2px solid ${PURPLE}` }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.14em', marginBottom: 14 }}>
                {t('info_best_for')}
              </div>
              <BulletList items={[
                t('info_pre_bullet1'),
                t('info_pre_bullet2'),
                t('info_pre_bullet3'),
                t('info_pre_bullet4'),
                t('info_pre_bullet5'),
              ]} color={PURPLE} />
            </div>
          </div>

          <CostBadge label={t('info_pricing_premium')} price="$4.99" perLabel={t('info_per_queries')} color={PURPLE} />
        </InfoSection>

        <Divider />

        {/* ── MODELS ────────────────────────────────────────── */}
        <InfoSection label={t('info_models_label')}>
          <SectionTitle>{t('info_models_heading')}</SectionTitle>
          <BodyText>{t('info_models_desc')}</BodyText>

          <div style={{ margin: '28px 0', borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER2}`, background: SURFACE, padding: '4px 0' }}>
            <img
              src="/info-models.svg"
              alt="The four VELE AI models"
              style={{ width: '100%', display: 'block' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            <ModelCard name="GPT-4o" provider="OpenAI" color="#10a37f" description={t('info_gpt_desc')} />
            <ModelCard name="Claude" provider="Anthropic" color="#cc785c" description={t('info_claude_desc')} />
            <ModelCard name="DeepSeek" provider="DeepSeek" color="#4d6bfe" description={t('info_deepseek_desc')} />
            <ModelCard name="Grok" provider="xAI" color="#9ca3af" description={t('info_grok_desc')} />
          </div>
        </InfoSection>

        <Divider />

        {/* ── WHY MULTI-MODEL ───────────────────────────────── */}
        <InfoSection label={t('info_why_label')}>
          <SectionTitle>{t('info_why_heading')}</SectionTitle>
          <BodyText style={{ marginBottom: 20 }}>{t('info_why_desc')}</BodyText>

          <div style={{
            background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: 12, padding: '20px 24px',
            borderLeft: `2px solid ${PURPLE}`,
          }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: PURPLE, letterSpacing: '0.14em', marginBottom: 16 }}>
              {t('info_why_catch_label')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {[
                { icon: '⊘', title: t('info_why_item1_title'), desc: t('info_why_item1_desc') },
                { icon: '◐', title: t('info_why_item2_title'), desc: t('info_why_item2_desc') },
                { icon: '◈', title: t('info_why_item3_title'), desc: t('info_why_item3_desc') },
                { icon: '◎', title: t('info_why_item4_title'), desc: t('info_why_item4_desc') },
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
        <InfoSection label={t('info_web_label')}>
          <SectionTitle>{t('info_web_heading')}</SectionTitle>
          <BodyText style={{ marginBottom: 24 }}>{t('info_web_desc')}</BodyText>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {[
              { label: t('info_web_item1_label'), sub: t('info_web_item1_sub') },
              { label: t('info_web_item2_label'), sub: t('info_web_item2_sub') },
              { label: t('info_web_item3_label'), sub: t('info_web_item3_sub') },
              { label: t('info_web_item4_label'), sub: t('info_web_item4_sub') },
              { label: t('info_web_item5_label'), sub: t('info_web_item5_sub') },
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
              {t('info_web_powered')}
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
            {t('info_footer')}
          </span>
        </div>
      </div>
    </div>
  )
}
