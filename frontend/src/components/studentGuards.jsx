import { Navigate, useLocation } from 'react-router-dom'
import { useStudentAuth } from '../lib/StudentAuthContext'

function Loader() {
  return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
}

// Any logged-in student.
export function RequireStudent({ children }) {
  const { student, loading } = useStudentAuth()
  const location = useLocation()
  if (loading) return <Loader />
  if (!student) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return children
}

// Enrolled (batch) students only — used for homework + full tools.
export function RequireBatch({ children }) {
  const { student, loading } = useStudentAuth()
  const location = useLocation()
  if (loading) return <Loader />
  if (!student) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (student.accountType !== 'batch') return <Navigate to="/tools" replace />
  return children
}

// Tool-level gate: signup students may only open the abacus.
export function RequireToolAccess({ toolId, children }) {
  const { student, loading, canUseTool } = useStudentAuth()
  const location = useLocation()
  if (loading) return <Loader />
  if (!student) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!canUseTool(toolId)) return <Navigate to="/tools" replace />
  return children
}
