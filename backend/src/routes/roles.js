import { Router } from 'express'
import Role from '../models/Role.js'
import { authenticate } from '../middleware/auth.js'
import { checkPermission } from '../middleware/rbac.js'

const router = Router()

// Available modules for permissions
const MODULES = ['courses', 'team', 'brand-ambassador', 'users', 'roles', 'contact', 'class-video']

router.get('/modules', authenticate, checkPermission('roles', 'read'), (req, res) => {
  res.json({ modules: MODULES })
})

// List all roles
router.get('/', authenticate, checkPermission('roles', 'read'), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10))
    const skip = (page - 1) * limit

    const [roles, total] = await Promise.all([
      Role.find().sort('name').skip(skip).limit(limit),
      Role.countDocuments(),
    ])
    res.json({ roles, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get single role
router.get('/:id', authenticate, checkPermission('roles', 'read'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
    if (!role) return res.status(404).json({ message: 'Role not found' })
    res.json({ role })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create role
router.post('/', authenticate, checkPermission('roles', 'write'), async (req, res) => {
  try {
    const { name, description, permissions } = req.body
    if (!name) return res.status(400).json({ message: 'Role name required' })

    const role = await Role.create({ name, description, permissions: permissions || [] })
    res.status(201).json({ role })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Role name already exists' })
    res.status(500).json({ message: err.message })
  }
})

// Update role
router.put('/:id', authenticate, checkPermission('roles', 'edit'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
    if (!role) return res.status(404).json({ message: 'Role not found' })
    if (role.isSystem) return res.status(400).json({ message: 'Cannot modify system roles' })

    const { name, description, permissions } = req.body
    if (name) role.name = name
    if (description !== undefined) role.description = description
    if (permissions) role.permissions = permissions
    await role.save()

    res.json({ role })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete role
router.delete('/:id', authenticate, checkPermission('roles', 'delete'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
    if (!role) return res.status(404).json({ message: 'Role not found' })
    if (role.isSystem) return res.status(400).json({ message: 'Cannot delete system roles' })

    await role.deleteOne()
    res.json({ message: 'Role deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
