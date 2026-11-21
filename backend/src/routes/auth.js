import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Student from '../models/Student.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Rate limiting: max login attempts per IP within the window
const loginAttempts = new Map() // ip -> { count, firstAttempt }
const MAX_ATTEMPTS = 20
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

// Student tokens carry a `type: 'student'` claim so admin/student sessions never mix.
function generateStudentToken(student) {
  return jwt.sign({ id: student._id, type: 'student' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

function publicStudent(s) {
  return {
    _id: s._id,
    name: s.name,
    email: s.email,
    photo: s.photo,
    accountType: s.accountType,
    batch: s.batch || null,
    isActive: s.isActive,
  }
}

// Unified login — one entry point for everyone.
// Checks admin/staff users first, then students, and tells the client which
// kind of session it is via `kind` so the frontend can route accordingly.
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
    const normEmail = String(email).toLowerCase().trim()

    // 1) Admin / staff account (role-based access to the admin portal)
    const user = await User.findOne({ email: normEmail }).populate('role')
    if (user && (await user.comparePassword(password))) {
      if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' })
      clearAttempts(ip)
      return res.json({ kind: 'admin', token: generateToken(user), user })
    }

    // 2) Student account (signup / batch)
    const student = await Student.findOne({ email: normEmail }).populate('batch')
    if (student && (await student.comparePassword(password))) {
      if (!student.isActive) {
        return res.status(403).json({ message: 'Account deactivated. Please contact Prama Academy.' })
      }
      clearAttempts(ip)
      return res.json({ kind: 'student', token: generateStudentToken(student), student: publicStudent(student) })
    }

    // 3) Neither matched
    recordFailedAttempt(ip)
    const updated = checkLoginRate(ip)
    if (!updated.allowed) {
      return res.status(429).json({
        message: `Too many login attempts. Try again after ${updated.remainMin} minute(s).`,
      })
    }
    return res.status(401).json({ message: 'Invalid email or password' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user })
})

export default router
