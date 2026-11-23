import { Router } from 'express'
import jwt from 'jsonwebtoken'
import Visit from '../models/Visit.js'
import Student from '../models/Student.js'
import { authenticate } from '../middleware/auth.js'
import { checkPermission } from '../middleware/rbac.js'
import { localGeo, cachedEnrich, enrichIp, parseUA, isPrivateIp } from '../lib/geoip.js'

const router = Router()

// --- light per-IP flood guard for the public tracking endpoint ---
const hits = new Map() // ip -> { count, ts }
const WINDOW = 60 * 1000
const MAX = 120
function floodOk(ip) {
  const now = Date.now()
  const rec = hits.get(ip)
  if (!rec || now - rec.ts > WINDOW) { hits.set(ip, { count: 1, ts: now }); return true }
  if (rec.count >= MAX) return false
  rec.count++
  return true
}

// POST /api/analytics/visit — PUBLIC. Fired by the frontend on every public page view.
// Must never break the site, so it swallows its own errors and returns 200.
router.post('/visit', async (req, res) => {
  try {
    const ip = req.ip
    if (!floodOk(ip)) return res.status(429).json({ ok: false })

    const { path = '/', referrer = '', visitorId = '', sessionId = '' } = req.body || {}

    // Optionally identify a logged-in student (never required).
    let student = null
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (token) {
      try {
        const d = jwt.verify(token, process.env.JWT_SECRET)
        if (d.type === 'student') student = d.id
      } catch { /* anonymous */ }
    }

    const ua = req.headers['user-agent'] || ''
    const { browser, os, device, isBot } = parseUA(ua)
    const geo = localGeo(ip)
    const enr = cachedEnrich(ip) // sync; already-known IPs get full data immediately

    const visit = await Visit.create({
      visitorId: String(visitorId).slice(0, 100),
      sessionId: String(sessionId).slice(0, 100),
      ip,
      path: String(path).slice(0, 300),
      referrer: String(referrer).slice(0, 500),
      ...geo,
      ...(enr || {}),
      userAgent: ua.slice(0, 500),
      browser, os, device, isBot,
      student,
    })

    res.json({ ok: true })

    // Background: enrich a not-yet-seen public IP and backfill this row.
    if (!enr && !isPrivateIp(ip)) {
      enrichIp(ip)
        .then((data) => { if (data) return Visit.updateOne({ _id: visit._id }, { $set: data }) })
        .catch(() => {})
    }
  } catch {
    if (!res.headersSent) res.status(200).json({ ok: false })
  }
})

// GET /api/analytics/summary?days=30&bots=0 — admin only.
router.get('/summary', authenticate, checkPermission('analytics', 'read'), async (req, res) => {
  try {
    const days = Math.max(1, Math.min(365, parseInt(req.query.days) || 30))
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const match = { createdAt: { $gte: since } }
    if (req.query.bots !== '1') match.isBot = { $ne: true }

    const [
      totals, byDay, topCountries, topCities, topPages,
      topReferrers, byDevice, byBrowser, topVisitorsRaw, recent,
    ] = await Promise.all([
      Visit.aggregate([
        { $match: match },
        { $group: {
          _id: null,
          visits: { $sum: 1 },
          visitors: { $addToSet: '$visitorId' },
          countries: { $addToSet: '$countryCode' },
          loggedIn: { $sum: { $cond: [{ $ifNull: ['$student', false] }, 1, 0] } },
        } },
      ]),
      Visit.aggregate([
        { $match: match },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          visits: { $sum: 1 }, visitors: { $addToSet: '$visitorId' },
        } },
        { $project: { date: '$_id', visits: 1, unique: { $size: '$visitors' }, _id: 0 } },
        { $sort: { date: 1 } },
      ]),
      Visit.aggregate([
        { $match: match },
        { $group: { _id: '$countryCode', count: { $sum: 1 }, name: { $last: '$country' } } },
        { $sort: { count: -1 } }, { $limit: 12 },
      ]),
      Visit.aggregate([
        { $match: { ...match, city: { $nin: ['', null] } } },
        { $group: { _id: { city: '$city', country: '$countryCode' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 12 },
      ]),
      Visit.aggregate([
        { $match: match }, { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 15 },
      ]),
      Visit.aggregate([
        { $match: { ...match, referrer: { $nin: ['', null] } } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 10 },
      ]),
      Visit.aggregate([{ $match: match }, { $group: { _id: '$device', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Visit.aggregate([{ $match: match }, { $group: { _id: '$browser', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Visit.aggregate([
        { $match: match },
        { $sort: { createdAt: 1 } },
        { $group: {
          _id: '$visitorId',
          count: { $sum: 1 },
          lastSeen: { $max: '$createdAt' },
          firstSeen: { $min: '$createdAt' },
          city: { $last: '$city' }, country: { $last: '$country' },
          ip: { $last: '$ip' }, isp: { $last: '$isp' }, student: { $last: '$student' },
        } },
        { $sort: { count: -1 } }, { $limit: 25 },
      ]),
      Visit.find(match).sort('-createdAt').limit(60)
        .populate('student', 'name email')
        .select('createdAt ip path referrer country countryCode city region isp org device browser os isBot student visitorId')
        .lean(),
    ])

    // Resolve student names for the top-visitors table.
    const ids = topVisitorsRaw.map((v) => v.student).filter(Boolean)
    const students = ids.length ? await Student.find({ _id: { $in: ids } }).select('name email').lean() : []
    const sMap = Object.fromEntries(students.map((s) => [String(s._id), s]))
    const topVisitors = topVisitorsRaw
      .filter((v) => v._id) // drop the empty-visitorId bucket
      .map((v) => ({ ...v, student: v.student ? sMap[String(v.student)] || null : null }))

    const t = totals[0] || { visits: 0, visitors: [], countries: [], loggedIn: 0 }
    res.json({
      days,
      totals: {
        visits: t.visits,
        uniqueVisitors: (t.visitors || []).filter(Boolean).length,
        countries: (t.countries || []).filter(Boolean).length,
        loggedInVisits: t.loggedIn,
      },
      byDay, topCountries, topCities, topPages, topReferrers,
      byDevice, byBrowser, topVisitors, recent,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
