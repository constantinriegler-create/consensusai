import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SharePage from './SharePage.jsx'
import { PrivacyPolicy, TermsOfService, RefundPolicy, CookiePolicy, DPA } from './PolicyPage.jsx'

const path = window.location.pathname

const shareMatch = path.match(/^\/share\/([^/]+)$/)

const policyMap = {
  '/privacy-policy': PrivacyPolicy,
  '/terms':          TermsOfService,
  '/refund-policy':  RefundPolicy,
  '/cookie-policy':  CookiePolicy,
  '/dpa':            DPA,
}

const PolicyComponent = policyMap[path]

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {shareMatch
      ? <SharePage shareId={shareMatch[1]} />
      : PolicyComponent
        ? <PolicyComponent />
        : <App />
    }
  </StrictMode>,
)
