import geoip from 'geoip-lite'

// ---------------------------------------------------------------------------
// Local, offline lookup (no network): country / region / city / coords / tz.
// Always runs — gives an instant answer for every hit.
// ---------------------------------------------------------------------------
export function localGeo(ip) {
  try {
    const g = geoip.lookup(ip)
    if (!g) return {}
    return {
      country: g.country || '',
      countryCode: g.country || '',
      region: g.region || '',
      city: g.city || '',
      lat: Array.isArray(g.ll) ? (g.ll[0] ?? undefined) : undefined,
      lon: Array.isArray(g.ll) ? (g.ll[1] ?? undefined) : undefined,
      timezone: g.timezone || '',
    }
  } catch {
    return {}
  }
}

export function isPrivateIp(ip) {
  if (!ip) return true
  const v = ip.replace(/^::ffff:/, '')
  if (v === '127.0.0.1' || v === '::1' || v.startsWith('10.') || v.startsWith('192.168.')) return true
  const m = v.match(/^172\.(\d+)\./)
  if (m && +m[1] >= 16 && +m[1] <= 31) return true
  if (v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80')) return true
  return false
}

// ---------------------------------------------------------------------------
// External enrichment (ISP / org / ASN + precise city) for PUBLIC IPs only.
// Each unique IP is looked up once and cached, so repeat visits cost nothing
// and we stay well under the free rate limit. Never throws.
// ---------------------------------------------------------------------------
const cache = new Map() // ip -> { data, ts }
const TTL = 24 * 60 * 60 * 1000

// Synchronous: returns cached enrichment (or null) without hitting the network.
export function cachedEnrich(ip) {
  const c = cache.get(ip)
  if (c && Date.now() - c.ts < TTL) return c.data
  return null
}

// Async: fetch + cache enrichment. Returns the data, or null on any failure.
export async function enrichIp(ip) {
  if (isPrivateIp(ip)) return null
  const hit = cachedEnrich(ip)
  if (hit !== null && cache.has(ip)) return hit

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)
  try {
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}` +
      '?fields=status,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query'
    const r = await fetch(url, { signal: controller.signal })
    const j = await r.json()
    if (j.status !== 'success') {
      cache.set(ip, { data: null, ts: Date.now() })
      return null
    }
    const data = {
      country: j.country || '',
      countryCode: j.countryCode || '',
      region: j.regionName || '',
      city: j.city || '',
      zip: j.zip || '',
      lat: typeof j.lat === 'number' ? j.lat : undefined,
      lon: typeof j.lon === 'number' ? j.lon : undefined,
      timezone: j.timezone || '',
      isp: j.isp || '',
      org: j.org || '',
      asn: j.as || '',
      enriched: true,
    }
    cache.set(ip, { data, ts: Date.now() })
    return data
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// ---------------------------------------------------------------------------
// Minimal User-Agent parse (no external dependency).
// ---------------------------------------------------------------------------
export function parseUA(ua = '') {
  const s = ua.toLowerCase()
  const isBot = /bot|crawl|spider|slurp|bing|google|facebook|embed|preview|curl|wget|python|headless|monitor|uptime|pingdom|lighthouse|semrush|ahrefs/.test(s)

  let browser = 'Other'
  if (s.includes('edg/')) browser = 'Edge'
  else if (s.includes('opr/') || s.includes('opera')) browser = 'Opera'
  else if (s.includes('chrome/') && !s.includes('chromium')) browser = 'Chrome'
  else if (s.includes('firefox/')) browser = 'Firefox'
  else if (s.includes('safari/') && !s.includes('chrome')) browser = 'Safari'

  let os = 'Other'
  if (s.includes('windows')) os = 'Windows'
  else if (s.includes('android')) os = 'Android'
  else if (s.includes('iphone') || s.includes('ipad') || s.includes(' ios')) os = 'iOS'
  else if (s.includes('mac os') || s.includes('macintosh')) os = 'macOS'
  else if (s.includes('linux')) os = 'Linux'

  let device = 'Desktop'
  if (s.includes('ipad') || s.includes('tablet')) device = 'Tablet'
  else if (s.includes('mobile') || s.includes('iphone') || s.includes('android')) device = 'Mobile'

  return { browser, os, device, isBot }
}
