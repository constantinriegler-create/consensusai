import { useEffect } from 'react'
import './i18n/index.js'

const TEXT  = 'var(--c-text)'
const MUTED = 'var(--c-muted)'
const MUTED2 = 'var(--c-muted2)'
const BG    = 'var(--c-bg)'
const BORDER = 'var(--c-border)'
const PURPLE = '#a855f7'

/* ─── shared layout shell ───────────────────────────────────────────── */
function PolicyShell({ title, lastUpdated, children }) {
  useEffect(() => {
    document.title = `${title} — VELE AI`
  }, [title])

  // index.css locks body + #root to overflow:hidden for the main app.
  // Policy pages live outside that context — unlock scrolling here.
  useEffect(() => {
    const root = document.getElementById('root')
    const prev = {
      bodyOverflow:  document.body.style.overflow,
      bodyHeight:    document.body.style.height,
      htmlOverflow:  document.documentElement.style.overflow,
      htmlHeight:    document.documentElement.style.height,
      rootOverflow:  root ? root.style.overflow : '',
      rootHeight:    root ? root.style.height   : '',
    }
    document.body.style.overflow           = 'auto'
    document.body.style.height             = 'auto'
    document.documentElement.style.overflow = 'auto'
    document.documentElement.style.height   = 'auto'
    if (root) { root.style.overflow = 'auto'; root.style.height = 'auto' }
    return () => {
      document.body.style.overflow           = prev.bodyOverflow
      document.body.style.height             = prev.bodyHeight
      document.documentElement.style.overflow = prev.htmlOverflow
      document.documentElement.style.height   = prev.htmlHeight
      if (root) { root.style.overflow = prev.rootOverflow; root.style.height = prev.rootHeight }
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: BG,
      color: TEXT,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: BG,
        borderBottom: `1px solid ${BORDER}`,
        padding: '12px 24px',
        display: 'flex', alignItems: 'center',
      }}>
        <a href="/" style={{
          fontFamily: 'monospace', fontSize: 12, color: MUTED,
          textDecoration: 'none', letterSpacing: '0.06em',
          display: 'flex', alignItems: 'center', gap: 6,
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = TEXT}
          onMouseLeave={e => e.currentTarget.style.color = MUTED}
        >
          ← VELE AI
        </a>
      </div>

      {/* content */}
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '48px 24px 96px',
      }}>
        <div style={{
          fontFamily: 'monospace', fontSize: 10, color: PURPLE,
          letterSpacing: '0.12em', marginBottom: 12,
        }}>
          LEGAL
        </div>
        <h1 style={{
          fontFamily: 'monospace', fontSize: 22, fontWeight: 700,
          color: TEXT, letterSpacing: '0.04em', margin: '0 0 8px',
        }}>
          {title}
        </h1>
        <p style={{
          fontFamily: 'monospace', fontSize: 11, color: MUTED2,
          letterSpacing: '0.06em', marginBottom: 48,
        }}>
          {lastUpdated}
        </p>

        <div style={{ lineHeight: 1.75, fontSize: 15 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

/* ─── helpers ────────────────────────────────────────────────────────── */
function H2({ children }) {
  return (
    <h2 style={{
      fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
      color: TEXT, letterSpacing: '0.08em',
      marginTop: 40, marginBottom: 12,
      paddingTop: 40,
      borderTop: `1px solid ${BORDER}`,
    }}>
      {children}
    </h2>
  )
}

function P({ children }) {
  return (
    <p style={{ color: MUTED, marginBottom: 16, marginTop: 0 }}>
      {children}
    </p>
  )
}

function Ul({ children }) {
  return (
    <ul style={{ color: MUTED, paddingLeft: 20, marginBottom: 16 }}>
      {children}
    </ul>
  )
}

function Li({ children }) {
  return <li style={{ marginBottom: 6 }}>{children}</li>
}

function Link({ href, children }) {
  return (
    <a
      href={href}
      style={{ color: PURPLE, textDecoration: 'none' }}
      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
    >
      {children}
    </a>
  )
}


/* ═══════════════════════════════════════════════════════════════════════
   PRIVACY POLICY
═══════════════════════════════════════════════════════════════════════ */
export function PrivacyPolicy() {
  return (
    <PolicyShell title="Privacy Policy" lastUpdated="Last updated May 27, 2026">
      <P>
        This Privacy Policy describes how VELE AI (operated by Constantin Riegler, "<strong>we</strong>", "<strong>us</strong>", or "<strong>our</strong>") collects, uses, and shares information about you when you use our website at <Link href="https://veleai.com">veleai.com</Link> and related services (collectively, the "Services").
      </P>
      <P>
        Please read this Privacy Policy carefully. If you disagree with its terms, please discontinue use of our Services.
      </P>

      <H2>1. WHAT INFORMATION DO WE COLLECT?</H2>
      <P><strong>Information you provide directly:</strong></P>
      <Ul>
        <Li>Account information: email address and password when you register.</Li>
        <Li>Payment information: processed by Stripe. We do not store your full card number or CVV.</Li>
        <Li>Feedback and communications: messages you send us via the feedback form or email.</Li>
        <Li>Prompts and queries: the text you submit to the Services.</Li>
      </Ul>
      <P><strong>Information collected automatically:</strong></P>
      <Ul>
        <Li>Log data: IP address, browser type, pages visited, timestamps, referring URLs.</Li>
        <Li>Device data: device type, operating system, screen resolution.</Li>
        <Li>Cookies and local storage: used for session management, theme/language preferences, and analytics. See our <Link href="/cookie-policy">Cookie Policy</Link>.</Li>
        <Li>Usage data: queries submitted, features used, session duration.</Li>
      </Ul>

      <H2>2. HOW DO WE PROCESS YOUR INFORMATION?</H2>
      <P>We process your information to:</P>
      <Ul>
        <Li>Create and manage your account.</Li>
        <Li>Provide, operate, and improve the Services.</Li>
        <Li>Process payments and maintain your credit balance.</Li>
        <Li>Respond to your inquiries and provide support.</Li>
        <Li>Send administrative communications (e.g., account confirmations).</Li>
        <Li>Detect, prevent, and address fraud, abuse, and security issues.</Li>
        <Li>Comply with legal obligations.</Li>
        <Li>Analyze usage trends to improve the product.</Li>
      </Ul>

      <H2>3. LEGAL BASES FOR PROCESSING (GDPR)</H2>
      <P>If you are located in the European Economic Area (EEA), we process your personal data on the following legal bases:</P>
      <Ul>
        <Li><strong>Performance of a contract:</strong> to provide the Services you requested.</Li>
        <Li><strong>Legitimate interests:</strong> to improve our Services, prevent fraud, and maintain security.</Li>
        <Li><strong>Consent:</strong> where you have explicitly given consent (e.g., optional analytics cookies).</Li>
        <Li><strong>Legal obligation:</strong> where processing is required by law.</Li>
      </Ul>

      <H2>4. WHEN AND WITH WHOM DO WE SHARE YOUR INFORMATION?</H2>
      <P>We may share your information in the following circumstances:</P>
      <Ul>
        <Li><strong>AI model providers:</strong> Your prompts are sent to third-party AI APIs (OpenAI, Anthropic, DeepSeek, xAI) solely to generate responses. These providers process data under their own privacy policies.</Li>
        <Li><strong>Stripe:</strong> Payment processing. Stripe may collect billing details directly.</Li>
        <Li><strong>Supabase:</strong> Database and authentication infrastructure.</Li>
        <Li><strong>Tavily:</strong> Web search results when the web search feature is enabled.</Li>
        <Li><strong>Resend:</strong> Email delivery for feedback and transactional emails.</Li>
        <Li><strong>Legal requirements:</strong> If required by law, court order, or governmental authority.</Li>
        <Li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets.</Li>
      </Ul>
      <P>We do not sell your personal information to third parties.</P>

      <H2>5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</H2>
      <P>
        Yes. We use cookies and similar technologies for session management (keeping you logged in), storing your preferences (theme, language), and basic usage analytics. For more details, see our <Link href="/cookie-policy">Cookie Policy</Link>.
      </P>

      <H2>6. HOW LONG DO WE KEEP YOUR INFORMATION?</H2>
      <P>
        We retain your account information and chat history for as long as your account is active. You can delete individual chats or all chats at any time from the Settings menu. If you close your account, we will delete or anonymize your personal data within 90 days, except where we are required by law to retain it longer.
      </P>
      <P>Payment records are retained for 7 years to comply with tax and accounting obligations.</P>

      <H2>7. HOW DO WE KEEP YOUR INFORMATION SAFE?</H2>
      <P>
        We implement appropriate technical and organizational security measures to protect your information, including TLS encryption in transit, hashed passwords, and access controls. However, no system is 100% secure, and we cannot guarantee absolute security.
      </P>

      <H2>8. DO WE COLLECT INFORMATION FROM MINORS?</H2>
      <P>
        The Services are not directed at children under 16 years of age. We do not knowingly collect personal data from children under 16. If we learn we have collected such data, we will delete it promptly.
      </P>

      <H2>9. WHAT ARE YOUR PRIVACY RIGHTS?</H2>
      <P>Depending on your location, you may have the right to:</P>
      <Ul>
        <Li>Access the personal data we hold about you.</Li>
        <Li>Request correction of inaccurate personal data.</Li>
        <Li>Request deletion of your personal data ("right to be forgotten").</Li>
        <Li>Object to or restrict certain processing activities.</Li>
        <Li>Receive your data in a portable format.</Li>
        <Li>Withdraw consent at any time (where processing is based on consent).</Li>
        <Li>Lodge a complaint with your local data protection authority.</Li>
      </Ul>
      <P>
        To exercise any of these rights, please contact us at <Link href="mailto:support@veleai.com">support@veleai.com</Link>.
      </P>

      <H2>10. CONTROLS FOR DO-NOT-TRACK FEATURES</H2>
      <P>
        Most web browsers include a Do-Not-Track feature. We do not currently respond to DNT signals at this time as no uniform standard has been established.
      </P>

      <H2>11. DO EUROPEAN RESIDENTS HAVE SPECIFIC RIGHTS?</H2>
      <P>
        If you are a resident of the EEA, UK, or Switzerland, you have specific rights under applicable data protection laws (GDPR / UK GDPR / Swiss nDSG). The data controller is Constantin Riegler, reachable at <Link href="mailto:support@veleai.com">support@veleai.com</Link>. You have the right to complain to your local supervisory authority.
      </P>

      <H2>12. DO WE MAKE UPDATES TO THIS NOTICE?</H2>
      <P>
        We may update this Privacy Policy from time to time. The updated version will be indicated by a revised "Last updated" date. We will notify you of material changes by posting a notice on the Services or by email.
      </P>

      <H2>13. HOW CAN YOU CONTACT US?</H2>
      <P>
        If you have questions or comments about this policy, email us at <Link href="mailto:support@veleai.com">support@veleai.com</Link> or visit <Link href="https://veleai.com">veleai.com</Link>.
      </P>
    </PolicyShell>
  )
}


/* ═══════════════════════════════════════════════════════════════════════
   TERMS OF SERVICE
═══════════════════════════════════════════════════════════════════════ */
export function TermsOfService() {
  return (
    <PolicyShell title="Terms of Service" lastUpdated="Last updated May 27, 2026">
      <P>
        These Terms of Service ("Legal Terms") constitute a legally binding agreement between you and <strong>VELE AI (Constantin Riegler)</strong> concerning your access to and use of the Services at <Link href="https://veleai.com">veleai.com</Link>. By using the Services, you agree to be bound by these Legal Terms.
      </P>
      <P>
        If you do not agree, you must discontinue use immediately. For questions, contact us at <Link href="mailto:support@veleai.com">support@veleai.com</Link>.
      </P>

      <H2>1. OUR SERVICES</H2>
      <P>
        The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
      </P>

      <H2>2. INTELLECTUAL PROPERTY RIGHTS</H2>
      <P>
        We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").
      </P>
      <P>
        Our Content and Marks are protected by copyright and trademark laws and treaties around the world.
      </P>
      <P>
        The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use or internal business purpose only.
      </P>
      <P>
        Subject to compliance with these Legal Terms, we grant you a non-exclusive, non-transferable, revocable license to access the Services solely for your personal, non-commercial use or internal business purpose.
      </P>
      <P>
        Any breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.
      </P>

      <H2>3. USER REPRESENTATIONS</H2>
      <P>By using the Services, you represent and warrant that:</P>
      <Ul>
        <Li>(1) you have the legal capacity and agree to comply with these Legal Terms;</Li>
        <Li>(2) you are not a minor in the jurisdiction in which you reside;</Li>
        <Li>(3) you will not access the Services through automated or non-human means;</Li>
        <Li>(4) you will not use the Services for any illegal or unauthorized purpose;</Li>
        <Li>(5) your use of the Services will not violate any applicable law or regulation.</Li>
      </Ul>

      <H2>4. PROHIBITED ACTIVITIES</H2>
      <P>You may not access or use the Services for any purpose other than that for which we make the Services available. As a user of the Services, you agree not to:</P>
      <Ul>
        <Li>Systematically retrieve data to create databases without permission.</Li>
        <Li>Trick, defraud, or mislead us and other users.</Li>
        <Li>Circumvent security-related features of the Services.</Li>
        <Li>Use the Services in a manner inconsistent with applicable laws.</Li>
        <Li>Upload viruses, Trojan horses, or other harmful material.</Li>
        <Li>Engage in automated use of the system using scripts or bots.</Li>
        <Li>Attempt to impersonate another user or person.</Li>
        <Li>Use the Services to compete with us or for revenue-generating purposes without our consent.</Li>
        <Li>Use the Services to advertise or offer to sell goods and services.</Li>
        <Li>Sell or otherwise transfer your profile.</Li>
      </Ul>

      <H2>5. USER GENERATED CONTRIBUTIONS</H2>
      <P>
        We may provide you with the opportunity to create, submit, post, display, transmit, or broadcast content. You are solely responsible for your Contributions and their accuracy, appropriateness, and legality.
      </P>

      <H2>6. CONTRIBUTION LICENSE</H2>
      <P>
        By submitting suggestions or other feedback, you agree that we can use and share such feedback for any purpose without compensation to you. You retain full ownership of your Contributions and all associated intellectual property rights.
      </P>

      <H2>7. SERVICES MANAGEMENT</H2>
      <P>
        We reserve the right to monitor the Services for violations, take legal action against violators, and otherwise manage the Services to protect our rights and property and to facilitate the proper functioning of the Services.
      </P>

      <H2>8. TERM AND TERMINATION</H2>
      <P>
        We reserve the right to deny access to and use of the Services to any person for any reason without notice. If we terminate your account, you are prohibited from registering a new account. We may also terminate or suspend your access if you violate any provision of these Legal Terms.
      </P>

      <H2>9. MODIFICATIONS AND INTERRUPTIONS</H2>
      <P>
        We reserve the right to change, modify, or remove the contents of the Services at any time without notice. We are not liable for any modification, price change, suspension, or discontinuance of the Services.
      </P>

      <H2>10. GOVERNING LAW</H2>
      <P>
        These Legal Terms shall be governed by the laws of <strong>Austria</strong>. You irrevocably consent that the courts of Austria shall have exclusive jurisdiction to resolve any dispute arising out of or relating to these Legal Terms or the Services.
      </P>

      <H2>11. DISPUTE RESOLUTION</H2>
      <P>
        <strong>Informal Negotiations:</strong> The parties agree to first attempt to negotiate any dispute informally for at least <strong>30 days</strong> before initiating arbitration. Informal negotiations commence upon written notice from one party to the other.
      </P>
      <P>
        <strong>Binding Arbitration:</strong> Any dispute that cannot be resolved through informal negotiation shall be finally resolved by binding arbitration under the International Commercial Arbitration Court under the European Arbitration Chamber. The seat of arbitration shall be <strong>Salzburg, Austria</strong>. The language of proceedings shall be <strong>German</strong>. The governing law shall be Austrian law. The number of arbitrators shall be <strong>1</strong>.
      </P>
      <P>
        <strong>No Class Actions:</strong> Disputes may only be brought on an individual basis. Class action arbitration is not permitted.
      </P>

      <H2>12. CORRECTIONS</H2>
      <P>
        We reserve the right to correct any errors, inaccuracies, or omissions on the Services at any time without prior notice.
      </P>

      <H2>13. DISCLAIMER</H2>
      <P>
        THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE CONTENT OF THE SERVICES OR ANY WEBSITES LINKED TO THE SERVICES.
      </P>

      <H2>14. LIMITATIONS OF LIABILITY</H2>
      <P>
        IN NO EVENT WILL WE BE LIABLE TO YOU FOR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER WILL BE LIMITED TO THE AMOUNT PAID BY YOU TO US. CLAIMS MUST BE BROUGHT WITHIN 1 YEAR OF THE CAUSE OF ACTION ARISING.
      </P>

      <H2>15. INDEMNIFICATION</H2>
      <P>
        You agree to defend, indemnify, and hold us harmless, including our affiliates, officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand — including reasonable attorneys' fees and expenses — arising out of: (1) your use of the Services; (2) your breach of these Legal Terms; (3) your Contributions; or (4) your violation of any third-party rights.
      </P>

      <H2>16. USER DATA</H2>
      <P>
        We will maintain certain data that you transmit to the Services for the purpose of managing the Services and data relating to your use of the Services. You are solely responsible for all data you transmit. We shall have no liability for any loss or corruption of such data and you hereby waive any right of action against us arising from such loss or corruption.
      </P>

      <H2>17. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</H2>
      <P>
        Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications and agree that all agreements, notices, disclosures, and other communications we provide to you electronically satisfy any legal requirement that such communications be in writing. You agree to the use of electronic signatures, contracts, orders, and other records, and to electronic delivery of notices, policies, and records of transactions initiated or completed by us or via the Services.
      </P>

      <H2>18. MISCELLANEOUS</H2>
      <P>
        These Legal Terms and any policies or operating rules posted by us on the Services constitute the entire agreement between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. If any provision of these Legal Terms is unlawful, void, or unenforceable, that provision is deemed severable from these Legal Terms and does not affect the validity and enforceability of the remaining provisions.
      </P>

      <H2>19. CONTACT US</H2>
      <P>
        In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:
      </P>
      <P>
        <strong>VELE AI — Constantin Riegler</strong><br />
        Email: <Link href="mailto:support@veleai.com">support@veleai.com</Link><br />
        Website: <Link href="https://veleai.com">veleai.com</Link>
      </P>
    </PolicyShell>
  )
}


/* ═══════════════════════════════════════════════════════════════════════
   REFUND POLICY
═══════════════════════════════════════════════════════════════════════ */
export function RefundPolicy() {
  return (
    <PolicyShell title="Return Policy" lastUpdated="Last updated May 27, 2026">
      <H2>REFUNDS</H2>
      <P>
        All sales are final and no refund will be issued.
      </P>
      <P>
        VELE AI credits are a digital good consumed upon use. Once a purchase is completed, credits are added to your account immediately. Because the product is a digital service delivered instantly, we are unable to offer returns or refunds after purchase.
      </P>
      <P>
        If you believe there has been an error with your purchase (e.g., credits were not added to your account after a successful payment), please contact us within 14 days of the transaction and we will investigate.
      </P>

      <H2>QUESTIONS</H2>
      <P>
        If you have any questions concerning our return policy, please contact us at: <Link href="mailto:support@veleai.com">support@veleai.com</Link>
      </P>
    </PolicyShell>
  )
}


/* ═══════════════════════════════════════════════════════════════════════
   COOKIE POLICY (placeholder)
═══════════════════════════════════════════════════════════════════════ */
export function CookiePolicy() {
  return (
    <PolicyShell title="Cookie Policy" lastUpdated="Last updated May 27, 2026">
      <P>
        This page is being updated.
      </P>
      <P>
        For questions about our cookie practices, please contact us at <Link href="mailto:support@veleai.com">support@veleai.com</Link>.
      </P>
    </PolicyShell>
  )
}


/* ═══════════════════════════════════════════════════════════════════════
   DPA (placeholder)
═══════════════════════════════════════════════════════════════════════ */
export function DPA() {
  return (
    <PolicyShell title="Data Processing Agreement" lastUpdated="Last updated May 27, 2026">
      <P>
        This page is being updated.
      </P>
      <P>
        For our Data Processing Agreement and Standard Contractual Clauses, please contact us at <Link href="mailto:support@veleai.com">support@veleai.com</Link>.
      </P>
    </PolicyShell>
  )
}
