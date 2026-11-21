import { Router } from 'express'
import Homework from '../models/Homework.js'
import Submission from '../models/Submission.js'
import { authenticateStudent, requireBatch } from '../middleware/studentAuth.js'

const router = Router()

// All routes here require an enrolled (batch) student.
router.use(authenticateStudent, requireBatch)

// List homeworks for the student's batch, with submission status.
router.get('/mine', async (req, res) => {
  try {
    if (!req.student.batch) return res.json({ homeworks: [] })
    const batchId = req.student.batch._id || req.student.batch
    const homeworks = await Homework.find({ batch: batchId, isActive: true })
      .select('-questions.answer')
      .sort('-createdAt')
      .lean()

    const subs = await Submission.find({ student: req.student._id }).select('homework score total accuracy submittedAt')
    const subMap = Object.fromEntries(subs.map((s) => [String(s.homework), s]))

    res.json({
      homeworks: homeworks.map((h) => {
        const sub = subMap[String(h._id)]
        return {
          _id: h._id,
          title: h.title,
          instructions: h.instructions,
          questionCount: h.questions?.length || 0,
          timeLimitMin: h.timeLimitMin,
          dueDate: h.dueDate,
          createdAt: h.createdAt,
          submitted: Boolean(sub),
          score: sub?.score ?? null,
          total: sub?.total ?? null,
          accuracy: sub?.accuracy ?? null,
          submittedAt: sub?.submittedAt ?? null,
        }
      }),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get one homework to attempt (questions WITHOUT answers) + existing result if already submitted.
router.get('/mine/:id', async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id)
    if (!homework || !homework.isActive) return res.status(404).json({ message: 'Homework not found' })

    const batchId = req.student.batch?._id || req.student.batch
    if (String(homework.batch) !== String(batchId)) {
      return res.status(403).json({ message: 'This homework is not assigned to you' })
    }

    const existing = await Submission.findOne({ homework: homework._id, student: req.student._id })

    const base = {
      _id: homework._id,
      title: homework.title,
      instructions: homework.instructions,
      timeLimitMin: homework.timeLimitMin,
      dueDate: homework.dueDate,
      questions: homework.questions.map((q, i) => ({ index: i, display: q.display })),
    }

    if (existing) {
      // reveal answers alongside the student's result
      return res.json({
        homework: base,
        submission: existing,
        result: homework.questions.map((q, i) => ({
          index: i,
          display: q.display,
          answer: q.answer,
          given: existing.answers[i]?.given ?? null,
          correct: existing.answers[i]?.correct ?? false,
        })),
      })
    }

    res.json({ homework: base, submission: null })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Submit answers → auto-grade.
router.post('/mine/:id/submit', async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id)
    if (!homework || !homework.isActive) return res.status(404).json({ message: 'Homework not found' })

    const batchId = req.student.batch?._id || req.student.batch
    if (String(homework.batch) !== String(batchId)) {
      return res.status(403).json({ message: 'This homework is not assigned to you' })
    }

    const already = await Submission.findOne({ homework: homework._id, student: req.student._id })
    if (already) return res.status(400).json({ message: 'You have already submitted this homework' })

    const given = Array.isArray(req.body.answers) ? req.body.answers : []
    const timeSpentSec = Math.max(0, Number(req.body.timeSpentSec) || 0)

    let score = 0
    const answers = homework.questions.map((q, i) => {
      const raw = given[i]
      const num = raw === '' || raw === null || raw === undefined ? null : Number(raw)
      const correct = num !== null && !Number.isNaN(num) && num === q.answer
      if (correct) score++
      return { given: num !== null && Number.isNaN(num) ? null : num, answer: q.answer, correct }
    })

    const total = homework.questions.length
    const accuracy = total ? Math.round((score / total) * 100) : 0

    const submission = await Submission.create({
      homework: homework._id,
      student: req.student._id,
      answers,
      score,
      total,
      accuracy,
      timeSpentSec,
    })

    res.status(201).json({
      submission,
      result: homework.questions.map((q, i) => ({
        index: i,
        display: q.display,
        answer: q.answer,
        given: answers[i].given,
        correct: answers[i].correct,
      })),
    })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'You have already submitted this homework' })
    res.status(500).json({ message: err.message })
  }
})

export default router
