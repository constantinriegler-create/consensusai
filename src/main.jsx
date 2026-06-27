import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'

const path = window.location.pathname
const shareMatch = path.match(/^\/share\/([^/]+)$/)

// Only one of these ever loads per page visit — lazy-load all of them
const SharePage = lazy(() => import('./SharePage.jsx'))

const policyLazy = {
  '/privacy-policy': lazy(() => import('./PolicyPage.jsx').then(m => ({ default: m.PrivacyPolicy }))),
  '/terms':          lazy(() => import('./PolicyPage.jsx').then(m => ({ default: m.TermsOfService }))),
  '/refund-policy':  lazy(() => import('./PolicyPage.jsx').then(m => ({ default: m.RefundPolicy }))),
  '/cookie-policy':  lazy(() => import('./PolicyPage.jsx').then(m => ({ default: m.CookiePolicy }))),
  '/dpa':            lazy(() => import('./PolicyPage.jsx').then(m => ({ default: m.DPA }))),
}

const PolicyComponent = policyLazy[path]

// Minimal dark fallback — matches app background, no layout shift
const PageFallback = () => (
  <div style={{ minHeight: '100dvh', background: '#080808' }} />
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {shareMatch
      ? <Suspense fallback={<PageFallback />}><SharePage shareId={shareMatch[1]} /></Suspense>
      : PolicyComponent
        ? <Suspense fallback={<PageFallback />}><PolicyComponent /></Suspense>
        : <App />
    }
    <Analytics />
  </StrictMode>,
)
