import { Router } from 'express'
import Team from '../models/Team.js'
import { authenticate } from '../middleware/auth.js'
import { checkPermission } from '../middleware/rbac.js'

const router = Router()

// PUBLIC: Get all active team members
router.get('/public', async (req, res) => {
  try {
    const members = await Team.find({ isActive: true }).sort('order')
    res.json({ members })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Get all team members
router.get('/', authenticate, checkPermission('team', 'read'), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10))
    const skip = (page - 1) * limit

    const [members, total] = await Promise.all([
      Team.find().sort('order').skip(skip).limit(limit),
      Team.countDocuments(),
    ])
    res.json({ members, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Get single member
router.get('/:id', authenticate, checkPermission('team', 'read'), async (req, res) => {
  try {
    const member = await Team.findById(req.params.id)
    if (!member) return res.status(404).json({ message: 'Member not found' })
    res.json({ member })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Create member
router.post('/', authenticate, checkPermission('team', 'write'), async (req, res) => {
  try {
    const member = await Team.create(req.body)
    res.status(201).json({ member })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Update member
router.put('/:id', authenticate, checkPermission('team', 'edit'), async (req, res) => {
  try {
    const member = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!member) return res.status(404).json({ message: 'Member not found' })
    res.json({ member })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Delete member
router.delete('/:id', authenticate, checkPermission('team', 'delete'), async (req, res) => {
  try {
    const member = await Team.findByIdAndDelete(req.params.id)
    if (!member) return res.status(404).json({ message: 'Member not found' })
    res.json({ message: 'Member deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
