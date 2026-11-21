import { Router } from 'express'
import Homework from '../models/Homework.js'
import Submission from '../models/Submission.js'
import Student from '../models/Student.js'
import Batch from '../models/Batch.js'
import { authenticate } from '../middleware/auth.js'
import { checkPermission } from '../middleware/rbac.js'
import { scopedBatchIds, inScope, canAccessBatch } from '../lib/teacherScope.js'
import { generateQuestions, ALL_OPERATIONS } from '../lib/questionGenerator.js'

const router = Router()

function buildConfig(body) {
  const ops = Array.isArray(body.operations) ? body.operations.filter((o) => ALL_OPERATIONS.includes(o)) : []
  return {
    operations: ops.length ? ops : ['addition'],
    count: Math.max(1, Math.min(200, Number(body.count) || 20)),
    rows: Math.max(2, Math.min(6, Number(body.rows) || 3)),
    digits: Math.max(1, Math.min(5, Number(body.digits) || 2)),
    multiplicandDigits: Math.max(1, Math.min(5, Number(body.multiplicandDigits) || 2)),
    multiplierDigits: Math.max(1, Math.min(4, Number(body.multiplierDigits) || 1)),
    dividendDigits: Math.max(1, Math.min(4, Number(body.dividendDigits) || 3)),
    divisorDigits: Math.max(1, Math.min(3, Number(body.divisorDigits) || 1)),
  }
}

// List homeworks (with batch name + submission count)
router.get('/', authenticate, checkPermission('homework', 'read'), async (req, res) => {
  try {
    const filter = {}
    if (req.query.batch) filter.batch = req.query.batch
    const scope = await scopedBatchIds(req.user)
    if (scope) {
      if (filter.batch) {
        if (!inScope(scope, filter.batch)) return res.json({ homeworks: [] })
      } else {
        filter.batch = { $in: scope }
      }
    }
    const homeworks = await Homework.find(filter)
      .populate('batch', 'name')
      .select('-questions.answer') // keep payload light; answers not needed in list
      .sort('-createdAt')
      .lean()

    const counts = await Submission.aggregate([
      { $group: { _id: '$homework', count: { $sum: 1 }, avgAcc: { $avg: '$accuracy' } } },
    ])
    const map = Object.fromEntries(counts.map((c) => [String(c._id), c]))
    res.json({
      homeworks: homeworks.map((h) => ({
        ...h,
        questionCount: h.questions?.length || 0,
        submissionCount: map[String(h._id)]?.count || 0,
        avgAccuracy: map[String(h._id)] ? Math.round(map[String(h._id)].avgAcc) : null,
      })),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Homework detail + analysis
router.get('/:id', authenticate, checkPermission('homework', 'read'), async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id).populate('batch', 'name')
    if (!homework) return res.status(404).json({ message: 'Homework not found' })
    const scope = await scopedBatchIds(req.user)
    if (!inScope(scope, homework.batch?._id)) return res.status(403).json({ message: 'You do not have access to this homework' })

    const [batchStudents, submissions] = await Promise.all([
      Student.find({ batch: homework.batch?._id, accountType: 'batch' }).select('name email photo isActive').sort('name'),
      Submission.find({ homework: homework._id }).populate('student', 'name email photo'),
    ])

    const subByStudent = new Map(submissions.map((s) => [String(s.student?._id), s]))

    // per-student rows
    const rows = batchStudents.map((st) => {
      const sub = subByStudent.get(String(st._id))
      return {
        student: { _id: st._id, name: st.name, email: st.email, photo: st.photo, isActive: st.isActive },
        submitted: Boolean(sub),
        score: sub?.score ?? null,
        total: sub?.total ?? null,
        accuracy: sub?.accuracy ?? null,
        timeSpentSec: sub?.timeSpentSec ?? null,
        submittedAt: sub?.submittedAt ?? null,
        submissionId: sub?._id ?? null,
      }
    })

    // also include submissions from students who are no longer in the batch (e.g. moved)
    const batchIds = new Set(batchStudents.map((s) => String(s._id)))
    const orphanRows = submissions
      .filter((s) => s.student && !batchIds.has(String(s.student._id)))
      .map((sub) => ({
        student: { _id: sub.student._id, name: sub.student.name, email: sub.student.email, photo: sub.student.photo, isActive: true },
        submitted: true, score: sub.score, total: sub.total, accuracy: sub.accuracy,
        timeSpentSec: sub.timeSpentSec, submittedAt: sub.submittedAt, submissionId: sub._id, leftBatch: true,
      }))

    const submittedCount = submissions.length
    const avgAccuracy = submittedCount ? Math.round(submissions.reduce((a, s) => a + s.accuracy, 0) / submittedCount) : null
    const avgScore = submittedCount ? +(submissions.reduce((a, s) => a + s.score, 0) / submittedCount).toFixed(1) : null
    const avgTime = submittedCount ? Math.round(submissions.reduce((a, s) => a + (s.timeSpentSec || 0), 0) / submittedCount) : null

    // per-question difficulty
    const perQuestion = homework.questions.map((q, i) => {
      let correct = 0
      let answered = 0
      submissions.forEach((s) => {
        const a = s.answers[i]
        if (a && a.given !== null && a.given !== undefined) answered++
        if (a && a.correct) correct++
      })
      return { index: i, display: q.display, answer: q.answer, correct, answered, total: submittedCount }
    })

    res.json({
      homework,
      analysis: {
        totalStudents: batchStudents.length,
        submittedCount,
        pendingCount: Math.max(0, batchStudents.length - rows.filter((r) => r.submitted).length),
        avgAccuracy, avgScore, avgTime,
        rows: [...rows, ...orphanRows],
        perQuestion,
      },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create homework (generates the question set)
router.post('/', authenticate, checkPermission('homework', 'write'), async (req, res) => {
  try {
    const { title, instructions, batch, timeLimitMin, dueDate } = req.body
    if (!title) return res.status(400).json({ message: 'Title required' })
    if (!batch) return res.status(400).json({ message: 'Please select a batch' })
    const batchDoc = await Batch.findById(batch)
    if (!batchDoc) return res.status(400).json({ message: 'Invalid batch' })
    if (!(await canAccessBatch(req.user, batch))) return res.status(403).json({ message: 'You can only assign homework to your own batch' })

    const config = buildConfig(req.body)
    const questions = generateQuestions(config)

    const homework = await Homework.create({
      title,
      instructions: instructions || '',
      batch,
      config,
      questions,
      timeLimitMin: Math.max(0, Number(timeLimitMin) || 0),
      dueDate: dueDate || undefined,
      createdBy: req.user._id,
    })
    await homework.populate('batch', 'name')
    res.status(201).json({ homework })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update homework. Pass regenerate:true to rebuild the question set from config.
router.put('/:id', authenticate, checkPermission('homework', 'edit'), async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id)
    if (!homework) return res.status(404).json({ message: 'Homework not found' })
    const scope = await scopedBatchIds(req.user)
    if (!inScope(scope, homework.batch)) return res.status(403).json({ message: 'You do not have access to this homework' })

    const { title, instructions, batch, timeLimitMin, dueDate, isActive, regenerate } = req.body
    if (batch !== undefined && batch && !inScope(scope, batch)) {
      return res.status(403).json({ message: 'You can only assign homework to your own batch' })
    }
    if (title !== undefined) homework.title = title
    if (instructions !== undefined) homework.instructions = instructions
    if (batch !== undefined && batch) homework.batch = batch
    if (timeLimitMin !== undefined) homework.timeLimitMin = Math.max(0, Number(timeLimitMin) || 0)
    if (dueDate !== undefined) homework.dueDate = dueDate || undefined
    if (isActive !== undefined) homework.isActive = isActive

    if (regenerate) {
      homework.config = buildConfig(req.body)
      homework.questions = generateQuestions(homework.config)
      // wipe old submissions since the questions changed
      await Submission.deleteMany({ homework: homework._id })
    }

    await homework.save()
    await homework.populate('batch', 'name')
    res.json({ homework })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete homework + its submissions
router.delete('/:id', authenticate, checkPermission('homework', 'delete'), async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id)
    if (!homework) return res.status(404).json({ message: 'Homework not found' })
    const scope = await scopedBatchIds(req.user)
    if (!inScope(scope, homework.batch)) return res.status(403).json({ message: 'You do not have access to this homework' })
    await Submission.deleteMany({ homework: homework._id })
    await homework.deleteOne()
    res.json({ message: 'Homework deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
