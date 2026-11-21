import jwt from 'jsonwebtoken'
import Student from '../models/Student.js'

// Verifies a STUDENT token (signed with { id, type: 'student' }) and loads the student.
// Kept separate from admin `authenticate` so student and staff sessions never mix.
export async function authenticateStudent(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ message: 'No token provided' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.type !== 'student') return res.status(401).json({ message: 'Invalid token' })
    const student = await Student.findById(decoded.id).populate('batch')
    if (!student || !student.isActive) return res.status(401).json({ message: 'Invalid token' })
    req.student = student
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

// Student must be a batch (enrolled) student for this route.
export function requireBatch(req, res, next) {
  if (req.student.accountType !== 'batch') {
    return res.status(403).json({ message: 'This section is only for enrolled students.' })
  }
  next()
}
