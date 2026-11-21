import { Router } from 'express'
import Student from '../models/Student.js'
import Batch from '../models/Batch.js'
import Submission from '../models/Submission.js'
import { authenticate } from '../middleware/auth.js'
import { checkPermission } from '../middleware/rbac.js'
import { scopedBatchIds, inScope, canAccessBatch } from '../lib/teacherScope.js'

const router = Router()

// List students (filter: batch, accountType, search, pagination)
router.get('/', authenticate, checkPermission('students', 'read'), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20))
    const skip = (page - 1) * limit

    const filter = {}
    if (req.query.batch) filter.batch = req.query.batch
    if (req.query.accountType) filter.accountType = req.query.accountType
    if (req.query.search) {
      const rx = new RegExp(req.query.search.trim(), 'i')
      filter.$or = [{ name: rx }, { email: rx }]
    }

    // Teacher scoping: non-super-admins only see students in the batches they lead.
    const scope = await scopedBatchIds(req.user)
    if (scope) {
      if (filter.batch) {
        if (!inScope(scope, filter.batch)) return res.json({ students: [], total: 0, page, pages: 0 })
      } else {
        filter.batch = { $in: scope }
      }
    }

    const [students, total] = await Promise.all([
      Student.find(filter).populate('batch', 'name').sort('-createdAt').skip(skip).limit(limit),
      Student.countDocuments(filter),
    ])
    res.json({ students, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Single student
router.get('/:id', authenticate, checkPermission('students', 'read'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('batch', 'name')
    if (!student) return res.status(404).json({ message: 'Student not found' })
    const scope = await scopedBatchIds(req.user)
    if (!inScope(scope, student.batch?._id)) return res.status(403).json({ message: 'You do not have access to this student' })
    res.json({ student })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create a batch (enrolled) student
router.post('/', authenticate, checkPermission('students', 'write'), async (req, res) => {
  try {
    const { name, email, password, batch } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' })
    if (String(password).length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })
    if (!batch) return res.status(400).json({ message: 'Please select a batch' })

    const batchDoc = await Batch.findById(batch)
    if (!batchDoc) return res.status(400).json({ message: 'Invalid batch' })
    if (!(await canAccessBatch(req.user, batch))) return res.status(403).json({ message: 'You can only add students to your own batch' })

    const student = await Student.create({
      name, email, password, batch, accountType: 'batch', createdBy: req.user._id,
    })
    await student.populate('batch', 'name')
    res.status(201).json({ student })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'An account with this email already exists' })
    res.status(500).json({ message: err.message })
  }
})

// Update (name, email, batch, accountType, isActive, optional password reset)
router.put('/:id', authenticate, checkPermission('students', 'edit'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ message: 'Student not found' })

    const scope = await scopedBatchIds(req.user)
    if (!inScope(scope, student.batch)) return res.status(403).json({ message: 'You do not have access to this student' })

    const { name, email, batch, accountType, isActive, password } = req.body
    if (name !== undefined) student.name = name
    if (email !== undefined) student.email = email
    if (accountType !== undefined) student.accountType = accountType
    if (batch !== undefined) student.batch = batch || undefined
    if (isActive !== undefined) student.isActive = isActive
    if (password) {
      if (String(password).length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })
      student.password = password
    }

    // A batch student must have a batch; a signup student must not.
    if (student.accountType === 'batch' && !student.batch) {
      return res.status(400).json({ message: 'A batch student must be assigned to a batch' })
    }
    if (student.accountType === 'signup') student.batch = undefined

    if (scope && student.accountType === 'batch' && !inScope(scope, student.batch)) {
      return res.status(403).json({ message: 'You can only assign students to your own batch' })
    }

    await student.save()
    await student.populate('batch', 'name')
    res.json({ student })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'An account with this email already exists' })
    res.status(500).json({ message: err.message })
  }
})

// Delete student (and their submissions)
router.delete('/:id', authenticate, checkPermission('students', 'delete'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ message: 'Student not found' })
    const scope = await scopedBatchIds(req.user)
    if (!inScope(scope, student.batch)) return res.status(403).json({ message: 'You do not have access to this student' })
    await Submission.deleteMany({ student: student._id })
    await student.deleteOne()
    res.json({ message: 'Student deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
