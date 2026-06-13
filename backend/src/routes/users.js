import { Router } from 'express'
import User from '../models/User.js'
import Role from '../models/Role.js'
import { authenticate } from '../middleware/auth.js'
import { checkPermission } from '../middleware/rbac.js'

const router = Router()

// List all users
router.get('/', authenticate, checkPermission('users', 'read'), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10))
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      User.find().populate('role').sort('-createdAt').skip(skip).limit(limit),
      User.countDocuments(),
    ])
    res.json({ users, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create user
router.post('/', authenticate, checkPermission('users', 'write'), async (req, res) => {
  try {
    const { name, email, password, role: roleId } = req.body
    if (!name || !email || !password || !roleId) {
      return res.status(400).json({ message: 'All fields required' })
    }

    const role = await Role.findById(roleId)
    if (!role) return res.status(400).json({ message: 'Invalid role' })

    const user = await User.create({ name, email, password, role: roleId })
    await user.populate('role')
    res.status(201).json({ user })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Email already exists' })
    res.status(500).json({ message: err.message })
  }
})

// Update user
router.put('/:id', authenticate, checkPermission('users', 'edit'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('role')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const { name, email, password, role: roleId, isActive } = req.body

    // Protect Super Admin from role change and deactivation
    if (user.role?.name === 'Super Admin') {
      if (roleId && roleId !== user.role._id.toString()) {
        return res.status(403).json({ message: 'Cannot change Super Admin role' })
      }
      if (isActive === false) {
        return res.status(403).json({ message: 'Cannot deactivate Super Admin' })
      }
    }

    if (name) user.name = name
    if (email) user.email = email
    if (password) user.password = password
    if (roleId) user.role = roleId
    if (isActive !== undefined) user.isActive = isActive
    await user.save()
    await user.populate('role')

    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete user
router.delete('/:id', authenticate, checkPermission('users', 'delete'), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' })
    }
    const user = await User.findById(req.params.id).populate('role')
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role?.name === 'Super Admin') {
      return res.status(403).json({ message: 'Cannot delete Super Admin user' })
    }
    await user.deleteOne()
    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
