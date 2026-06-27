import { Router } from 'express'
import BrandAmbassador from '../models/BrandAmbassador.js'
import { authenticate } from '../middleware/auth.js'
import { checkPermission } from '../middleware/rbac.js'

const router = Router()

// Per-section media limits
const MAX_IMAGES = 8
const MAX_VIDEOS = 15

// Returns an error message if the items exceed limits, otherwise null
function validateItems(items) {
  if (!Array.isArray(items)) return null
  const images = items.filter((i) => i.type === 'image').length
  const videos = items.filter((i) => i.type === 'video').length
  if (images > MAX_IMAGES) return `Maximum ${MAX_IMAGES} images allowed per section (got ${images}).`
  if (videos > MAX_VIDEOS) return `Maximum ${MAX_VIDEOS} videos allowed per section (got ${videos}).`
  return null
}

// PUBLIC: Get all active sections
router.get('/public', async (req, res) => {
  try {
    const sections = await BrandAmbassador.find({ isActive: true }).sort('order')
    res.json({ sections })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Get all sections
router.get('/', authenticate, checkPermission('brand-ambassador', 'read'), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10))
    const skip = (page - 1) * limit

    const [sections, total] = await Promise.all([
      BrandAmbassador.find().sort('order').skip(skip).limit(limit),
      BrandAmbassador.countDocuments(),
    ])
    res.json({ sections, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Get single section
router.get('/:id', authenticate, checkPermission('brand-ambassador', 'read'), async (req, res) => {
  try {
    const section = await BrandAmbassador.findById(req.params.id)
    if (!section) return res.status(404).json({ message: 'Section not found' })
    res.json({ section })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Create section
router.post('/', authenticate, checkPermission('brand-ambassador', 'write'), async (req, res) => {
  try {
    const limitError = validateItems(req.body.items)
    if (limitError) return res.status(400).json({ message: limitError })
    const section = await BrandAmbassador.create(req.body)
    res.status(201).json({ section })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Section name already exists' })
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Update section
router.put('/:id', authenticate, checkPermission('brand-ambassador', 'edit'), async (req, res) => {
  try {
    const limitError = validateItems(req.body.items)
    if (limitError) return res.status(400).json({ message: limitError })
    const section = await BrandAmbassador.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!section) return res.status(404).json({ message: 'Section not found' })
    res.json({ section })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Delete section
router.delete('/:id', authenticate, checkPermission('brand-ambassador', 'delete'), async (req, res) => {
  try {
    const section = await BrandAmbassador.findByIdAndDelete(req.params.id)
    if (!section) return res.status(404).json({ message: 'Section not found' })
    res.json({ message: 'Section deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
