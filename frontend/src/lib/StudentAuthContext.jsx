import { createContext, useContext, useState, useEffect } from 'react'
import { studentApi } from './api'

const StudentAuthContext = createContext(null)

const TOKEN_KEY = 'student_token'

export function StudentAuthProvider({ children }) {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setLoading(false); return }
    studentApi.get('/student-auth/me')
      .then((data) => setStudent(data.student))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await studentApi.post('/student-auth/login', { email, password })
    localStorage.setItem(TOKEN_KEY, data.token)
    setStudent(data.student)
    return data.student
  }

  // Hydrate a student session from an already-fetched login response
  // (used by the unified login page, which decides admin vs student).
  const setSession = (s, token) => {
    localStorage.setItem(TOKEN_KEY, token)
    setStudent(s)
  }

  const signup = async (name, email, password) => {
    const data = await studentApi.post('/student-auth/signup', { name, email, password })
    localStorage.setItem(TOKEN_KEY, data.token)
    setStudent(data.student)
    return data.student
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setStudent(null)
  }

  const refresh = async () => {
    const data = await studentApi.get('/student-auth/me')
    setStudent(data.student)
    return data.student
  }

  const isBatch = student?.accountType === 'batch'
  const isSignup = student?.accountType === 'signup'

  // Tool access: you must be logged in. Signup (free) accounts → Virtual
  // Abacus only; batch (enrolled) students → all tools. Logged-out visitors
  // get nothing here — clicking any tool sends them to login.
  const canUseTool = (toolId) => {
    if (!student) return false
    if (isBatch) return true
    return toolId === 'virtual-abacus'
  }

  return (
    <StudentAuthContext.Provider
      value={{ student, setStudent, setSession, loading, login, signup, logout, refresh, isBatch, isSignup, canUseTool }}
    >
      {children}
    </StudentAuthContext.Provider>
  )
}

export const useStudentAuth = () => useContext(StudentAuthContext)
