import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Rate limiting: max 3 login attempts per IP, 10 minute window
const loginAttempts = new Map() // ip -> { count, firstAttempt }
const MAX_ATTEMPTS = 3
const WINDOW_MS = 10 * 60 * 1000 // 10 minutes

function checkLoginRate(ip) {
  const now = Date.now()
  const record = loginAttempts.get(ip)
  if (!record) return { allowed: true }
  if (now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(ip)
    return { allowed: true }
  }
  if (record.count >= MAX_ATTEMPTS) {
    const remainMs = WINDOW_MS - (now - record.firstAttempt)
    const remainMin = Math.ceil(remainMs / 60000)
    return { allowed: false, remainMin }
  }
  return { allowed: true }
}

function recordFailedAttempt(ip) {
  const now = Date.now()
  const record = loginAttempts.get(ip)
  if (!record || now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now })
  } else {
    record.count++
  }
}

function clearAttempts(ip) {
  loginAttempts.delete(ip)
}

function generateToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

// Login
router.post('/login', async (req, res) => {
  try {
    const ip = req.ip

    const rateCheck = checkLoginRate(ip)
    if (!rateCheck.allowed) {
      return res.status(429).json({
        message: `Too many login attempts. Try again after ${rateCheck.remainMin} minute(s).`,
      })
    }

    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const user = await User.findOne({ email }).populate('role')
    if (!user || !(await user.comparePassword(password))) {
      recordFailedAttempt(ip)
      const updated = checkLoginRate(ip)
      if (!updated.allowed) {
        return res.status(429).json({
          message: `Too many login attempts. Try again after ${updated.remainMin} minute(s).`,
        })
      }
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' })

    clearAttempts(ip)
    res.json({ token: generateToken(user), user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user })
})

export default router
