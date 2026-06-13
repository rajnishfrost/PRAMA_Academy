import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ message: 'No token provided' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).populate('role')
    if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid token' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

export function requireSuperAdmin(req, res, next) {
  if (req.user.role.name !== 'Super Admin') {
    return res.status(403).json({ message: 'Super Admin access required' })
  }
  next()
}
