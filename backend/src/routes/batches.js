import { Router } from 'express'
import Batch from '../models/Batch.js'
import Student from '../models/Student.js'
import User from '../models/User.js'
import { authenticate } from '../middleware/auth.js'
import { checkPermission } from '../middleware/rbac.js'
import { scopedBatchIds, inScope, canAccessBatch } from '../lib/teacherScope.js'

const router = Router()

// List batches (with student counts) — teachers see only the batches they lead
router.get('/', authenticate, checkPermission('batches', 'read'), async (req, res) => {
  try {
    const scope = await scopedBatchIds(req.user)
    const query = scope ? { _id: { $in: scope } } : {}
    const batches = await Batch.find(query)
      .populate('courses', 'name slug')
      .populate('teacher', 'name')
      .sort('-createdAt')
      .lean()
    const counts = await Student.aggregate([
      { $match: { accountType: 'batch', batch: { $ne: null } } },
      { $group: { _id: '$batch', count: { $sum: 1 } } },
    ])
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]))
    res.json({ batches: batches.map((b) => ({ ...b, studentCount: countMap[String(b._id)] || 0 })) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Teachers (staff users) that can lead a batch — must be declared before '/:id'
router.get('/teachers', authenticate, checkPermission('batches', 'read'), async (req, res) => {
  try {
    const teachers = await User.find({ isActive: true })
      .select('name')
      .populate('role', 'name')
      .sort('name')
      .lean()
    res.json({ teachers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Single batch + its students
router.get('/:id', authenticate, checkPermission('batches', 'read'), async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('courses', 'name slug')
      .populate('teacher', 'name')
    if (!batch) return res.status(404).json({ message: 'Batch not found' })
    const scope = await scopedBatchIds(req.user)
    if (!inScope(scope, batch._id)) return res.status(403).json({ message: 'You do not have access to this batch' })
    const students = await Student.find({ batch: batch._id }).sort('name')
    res.json({ batch, students })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create
router.post('/', authenticate, checkPermission('batches', 'write'), async (req, res) => {
  try {
    const { name, description, courses, teacher, isActive } = req.body
    if (!name) return res.status(400).json({ message: 'Batch name required' })
    const batch = await Batch.create({
      name,
      description,
      courses: Array.isArray(courses) ? courses : [],
      teacher: teacher || undefined,
      isActive,
    })
    res.status(201).json({ batch })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update
router.put('/:id', authenticate, checkPermission('batches', 'edit'), async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
    if (!batch) return res.status(404).json({ message: 'Batch not found' })
    if (!(await canAccessBatch(req.user, batch._id))) return res.status(403).json({ message: 'You do not have access to this batch' })
    const { name, description, courses, teacher, isActive } = req.body
    if (name !== undefined) batch.name = name
    if (description !== undefined) batch.description = description
    if (courses !== undefined) batch.courses = Array.isArray(courses) ? courses : []
    if (teacher !== undefined) batch.teacher = teacher || undefined
    if (isActive !== undefined) batch.isActive = isActive
    await batch.save()
    res.json({ batch })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete (only if no students attached)
router.delete('/:id', authenticate, checkPermission('batches', 'delete'), async (req, res) => {
  try {
    const count = await Student.countDocuments({ batch: req.params.id })
    if (count > 0) return res.status(400).json({ message: `Cannot delete: ${count} student(s) are in this batch. Move or remove them first.` })
    const batch = await Batch.findById(req.params.id)
    if (!batch) return res.status(404).json({ message: 'Batch not found' })
    if (!(await canAccessBatch(req.user, batch._id))) return res.status(403).json({ message: 'You do not have access to this batch' })
    await batch.deleteOne()
    res.json({ message: 'Batch deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
