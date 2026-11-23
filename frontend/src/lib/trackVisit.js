// Fire-and-forget page-view tracking for public pages.
// Sends path + referrer + a stable per-browser visitorId to the backend.
// Never throws and never blocks rendering.

const BASE = import.meta.env.VITE_API_URL
const VKEY = 'prama_visitor_id'
const SKEY = 'prama_session_id'

function getVisitorId() {
  try {
    let id = localStorage.getItem(VKEY)
    if (!id) {
      id = (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`)
      localStorage.setItem(VKEY, id)
    }
    return id
  } catch {
    return ''
  }
}

function getSessionId() {
  try {
    let id = sessionStorage.getItem(SKEY)
    if (!id) {
      id = (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`)
      sessionStorage.setItem(SKEY, id)
    }
    return id
  } catch {
    return ''
  }
}

// De-dupe rapid repeats (React StrictMode double-effect, fast re-renders).
let last = { path: null, ts: 0 }

export function trackVisit(path) {
  try {
    const now = Date.now()
    if (path === last.path && now - last.ts < 2000) return
    last = { path, ts: now }

    const headers = { 'Content-Type': 'application/json' }
    const token = localStorage.getItem('student_token')
    if (token) headers.Authorization = `Bearer ${token}`

    fetch(`${BASE}/analytics/visit`, {
      method: 'POST',
      headers,
      keepalive: true,
      body: JSON.stringify({
        path,
        referrer: document.referrer || '',
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
      }),
    }).catch(() => {})
  } catch {
    /* tracking must never break the page */
  }
}
