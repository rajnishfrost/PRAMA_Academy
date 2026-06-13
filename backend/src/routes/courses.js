import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import Course from '../models/Course.js'
import { authenticate } from '../middleware/auth.js'
import { checkPermission } from '../middleware/rbac.js'

const router = Router()

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = 'uploads/courses'
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`)
  },
})
const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    const allowed = /jpeg|jpg|png|webp|gif/
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true)
    else cb(new Error('Only image files allowed'))
  },
  limits: { fileSize: 5 * 1024 * 1024 },
})

// PUBLIC: Get all active courses (for frontend)
router.get('/public', async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort('order')
    res.json({ courses })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUBLIC: Get single course by slug
router.get('/public/:slug', async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, isActive: true })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    res.json({ course })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Get all courses (including inactive)
router.get('/', authenticate, checkPermission('courses', 'read'), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10))
    const skip = (page - 1) * limit

    const [courses, total] = await Promise.all([
      Course.find().sort('order').skip(skip).limit(limit),
      Course.countDocuments(),
    ])
    res.json({ courses, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Get single course by id
router.get('/:id', authenticate, checkPermission('courses', 'read'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) return res.status(404).json({ message: 'Course not found' })
    res.json({ course })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Create course
router.post('/', authenticate, checkPermission('courses', 'write'), async (req, res) => {
  try {
    const course = await Course.create(req.body)
    res.status(201).json({ course })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Slug already exists' })
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Update course
router.put('/:id', authenticate, checkPermission('courses', 'edit'), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!course) return res.status(404).json({ message: 'Course not found' })
    res.json({ course })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Delete course
router.delete('/:id', authenticate, checkPermission('courses', 'delete'), async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)
    if (!course) return res.status(404).json({ message: 'Course not found' })
    res.json({ message: 'Course deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Upload course image
router.post('/upload', authenticate, checkPermission('courses', 'write'), upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
  res.json({ url: `/${req.file.path}` })
})

export default router
