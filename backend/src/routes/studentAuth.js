import { Router } from 'express'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import Student from '../models/Student.js'
import { authenticateStudent } from '../middleware/studentAuth.js'

const router = Router()

/* ---------- rate limiting (per IP) for login/signup ---------- */
const attempts = new Map()
const MAX_ATTEMPTS = 20
const WINDOW_MS = 10 * 60 * 1000

function checkRate(ip) {
  const now = Date.now()
  const rec = attempts.get(ip)
  if (!rec) return { allowed: true }
  if (now - rec.firstAttempt > WINDOW_MS) { attempts.delete(ip); return { allowed: true } }
  if (rec.count >= MAX_ATTEMPTS) {
    return { allowed: false, remainMin: Math.ceil((WINDOW_MS - (now - rec.firstAttempt)) / 60000) }
  }
  return { allowed: true }
}
function recordFail(ip) {
  const now = Date.now()
  const rec = attempts.get(ip)
  if (!rec || now - rec.firstAttempt > WINDOW_MS) attempts.set(ip, { count: 1, firstAttempt: now })
  else rec.count++
}
function clearRate(ip) { attempts.delete(ip) }

function generateToken(student) {
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

/* ---------- signup (self-register → always a 'signup' account) ---------- */
router.post('/signup', async (req, res) => {
  try {
    const ip = req.ip
    const rate = checkRate(ip)
    if (!rate.allowed) return res.status(429).json({ message: `Too many attempts. Try again after ${rate.remainMin} minute(s).` })

    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' })
    if (String(password).length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const exists = await Student.findOne({ email: String(email).toLowerCase().trim() })
    if (exists) return res.status(400).json({ message: 'An account with this email already exists' })

    const student = await Student.create({ name, email, password, accountType: 'signup' })
    clearRate(ip)
    res.status(201).json({ token: generateToken(student), student: publicStudent(student) })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'An account with this email already exists' })
    res.status(500).json({ message: err.message })
  }
})

/* ---------- login ---------- */
router.post('/login', async (req, res) => {
  try {
    const ip = req.ip
    const rate = checkRate(ip)
    if (!rate.allowed) return res.status(429).json({ message: `Too many login attempts. Try again after ${rate.remainMin} minute(s).` })

    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const student = await Student.findOne({ email: String(email).toLowerCase().trim() }).populate('batch')
    if (!student || !(await student.comparePassword(password))) {
      recordFail(ip)
      const after = checkRate(ip)
      if (!after.allowed) return res.status(429).json({ message: `Too many login attempts. Try again after ${after.remainMin} minute(s).` })
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    if (!student.isActive) return res.status(403).json({ message: 'Account deactivated. Please contact Prama Academy.' })

    clearRate(ip)
    res.json({ token: generateToken(student), student: publicStudent(student) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* ---------- current student ---------- */
router.get('/me', authenticateStudent, (req, res) => {
  res.json({ student: publicStudent(req.student) })
})

/* ---------- update profile (name, photo) ---------- */
router.put('/profile', authenticateStudent, async (req, res) => {
  try {
    const { name, photo } = req.body
    if (name !== undefined) req.student.name = name
    if (photo !== undefined) req.student.photo = photo
    await req.student.save()
    await req.student.populate('batch')
    res.json({ student: publicStudent(req.student) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* ---------- change password ---------- */
router.put('/password', authenticateStudent, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Current and new password required' })
    if (String(newPassword).length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' })
    const ok = await req.student.comparePassword(currentPassword)
    if (!ok) return res.status(400).json({ message: 'Current password is incorrect' })
    req.student.password = newPassword
    await req.student.save()
    res.json({ message: 'Password updated' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* ---------- profile photo upload ---------- */
const PROFILE_DIR = 'uploads/profile'
const storage = multer.diskStorage({
  destination(req, file, cb) {
    fs.mkdirSync(PROFILE_DIR, { recursive: true })
    cb(null, PROFILE_DIR)
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    cb(null, `stu-${req.student._id}-${Date.now()}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (/image\/(jpeg|jpg|png|webp|gif)/.test(file.mimetype)) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  },
})

router.post('/photo', authenticateStudent, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'Image exceeds the 5MB limit' })
      return res.status(400).json({ message: err.message })
    }
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    try {
      const url = `/uploads/profile/${req.file.filename}`
      req.student.photo = url
      await req.student.save()
      res.json({ url })
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  })
})

export default router
