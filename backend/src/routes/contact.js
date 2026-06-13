import { Router } from 'express'
import Contact from '../models/Contact.js'
import { authenticate } from '../middleware/auth.js'
import { checkPermission } from '../middleware/rbac.js'

const router = Router()

// Public: Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, reason, message } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' })
    }
    const contact = await Contact.create({ name, email, phone, reason, message })
    res.status(201).json({ message: 'Your message has been sent successfully!', contact })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: List messages with pagination & filters
router.get('/', authenticate, checkPermission('contact', 'read'), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10))
    const skip = (page - 1) * limit

    const filter = {}
    if (req.query.status) filter.status = req.query.status

    const [messages, total] = await Promise.all([
      Contact.find(filter).sort('-createdAt').skip(skip).limit(limit),
      Contact.countDocuments(filter),
    ])

    res.json({ messages, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: Update message status
router.put('/:id', authenticate, checkPermission('contact', 'write'), async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    if (!contact) return res.status(404).json({ message: 'Message not found' })
    res.json({ contact })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: Delete message
router.delete('/:id', authenticate, checkPermission('contact', 'delete'), async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id)
    if (!contact) return res.status(404).json({ message: 'Message not found' })
    res.json({ message: 'Message deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
