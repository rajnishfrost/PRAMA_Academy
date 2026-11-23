import mongoose from 'mongoose'

// One document per page view on a public page.
const visitSchema = new mongoose.Schema({
  visitorId: { type: String, default: '', index: true }, // stable per-browser id (localStorage)
  sessionId: { type: String, default: '' },              // per-tab id (sessionStorage)
  ip: { type: String, default: '', index: true },
  path: { type: String, default: '/' },
  referrer: { type: String, default: '' },

  // Geo — local geoip-lite on every hit, enriched by the external API where possible
  country: { type: String, default: '' },
  countryCode: { type: String, default: '' },
  region: { type: String, default: '' },
  city: { type: String, default: '' },
  zip: { type: String, default: '' },
  lat: { type: Number },
  lon: { type: Number },
  timezone: { type: String, default: '' },

  // Network — external enrichment only
  isp: { type: String, default: '' },
  org: { type: String, default: '' },
  asn: { type: String, default: '' },
  enriched: { type: Boolean, default: false },

  // Client
  userAgent: { type: String, default: '' },
  browser: { type: String, default: '' },
  os: { type: String, default: '' },
  device: { type: String, default: '' },
  isBot: { type: Boolean, default: false },

  // Identity — set only when a logged-in student made the request
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
}, { timestamps: true })

visitSchema.index({ createdAt: -1 })

export default mongoose.model('Visit', visitSchema)
