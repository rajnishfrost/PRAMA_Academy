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

// Tool-level gate: Virtual Abacus is open to everyone (even logged-out);
// the other tools need a batch account. No login redirect — a visitor who
// hits a locked tool directly just lands back on the Tools page.
export function RequireToolAccess({ toolId, children }) {
  const { loading, canUseTool } = useStudentAuth()
  if (loading) return <Loader />
  if (!canUseTool(toolId)) return <Navigate to="/tools" replace />
  return children
}
