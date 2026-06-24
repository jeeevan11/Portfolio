import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Maintenance from './components/Maintenance.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// ── Maintenance mode ──────────────────────────────────────────────────
// Shows a single "Updating" screen on open, with a circular button to watch
// the short film — which loops straight back to the message. Set this to
// false to restore the full portfolio (App). That's the only change needed.
const MAINTENANCE = false

// Private preview hatch: append ?preview to the URL to see the full portfolio
// even while MAINTENANCE is true. The public root stays the maintenance screen,
// so you can review/approve the real site locally before it ever goes live.
const PREVIEW =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('preview')

// The full portfolio is lazy-loaded so that, while MAINTENANCE is true, its
// code (App + ScrollTrigger + Lenis + every section) is split into a separate
// chunk that is never fetched — the live maintenance screen no longer ships
// the entire dormant portfolio. When MAINTENANCE flips to false it loads on
// demand behind <Suspense>.
const App = lazy(() => import('./App.jsx'))

// Cache the root on the container so Vite HMR reuses it instead of calling
// createRoot() twice on the same node (a dev-only warning; prod loads once).
const container = document.getElementById('root')
const root = container._reactRoot || (container._reactRoot = createRoot(container))
root.render(
  <StrictMode>
    <ErrorBoundary>
      {MAINTENANCE && !PREVIEW ? (
        <Maintenance />
      ) : (
        <Suspense fallback={null}>
          <App />
        </Suspense>
      )}
    </ErrorBoundary>
  </StrictMode>,
)
