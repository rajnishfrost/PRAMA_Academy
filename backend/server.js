import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import connectDB from './src/config/db.js'
import authRoutes from './src/routes/auth.js'
import roleRoutes from './src/routes/roles.js'
import userRoutes from './src/routes/users.js'
import courseRoutes from './src/routes/courses.js'
import mediaRoutes from './src/routes/media.js'
import teamRoutes from './src/routes/team.js'
import brandAmbassadorRoutes from './src/routes/brandAmbassador.js'
import contactRoutes from './src/routes/contact.js'
import classVideoRoutes from './src/routes/classVideo.js'

const app = express()
// Behind nginx + rathole — trust the proxy so req.ip is the real client IP
// (needed for correct per-IP login rate limiting).
app.set('trust proxy', 1)
const PORT = process.env.PORT || 3021

// Security middleware
// First-party origins only. Override with CORS_ORIGINS env (comma-separated) if needed.
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : [
      'https://pramaacademy.com',
      'https://www.pramaacademy.com',
      'http://pramaacademy.com',
    ]

// Local development origins (localhost / 127.0.0.1 / private LAN, any port) so the
// dev frontend can call this backend directly. A browser only sends these when the
// page is genuinely served from that host, so a public site cannot forge them.
const devOriginRe = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/

const corsOptions = {
  origin(origin, cb) {
    // allow non-browser callers (curl, server-to-server) that send no Origin
    if (!origin || allowedOrigins.includes(origin) || devOriginRe.test(origin)) return cb(null, true)
    return cb(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/roles', roleRoutes)
app.use('/api/users', userRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/team', teamRoutes)
app.use('/api/brand-ambassador', brandAmbassadorRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/class-video', classVideoRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

connectDB().then(() => {
  app.listen(PORT, '127.0.0.1', () => console.log(`Server running on port ${PORT} (localhost only, behind nginx)`))
})
