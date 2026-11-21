import { createContext, useContext, useState, useEffect } from 'react'
import { api } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }

  // Hydrate an admin session from an already-fetched login response
  // (used by the unified login page, which decides admin vs student).
  const setSession = (u, token) => {
    localStorage.setItem('token', token)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const isSuperAdmin = user?.role?.name === 'Super Admin'

  const hasPermission = (module, action) => {
    if (!user) return false
    if (isSuperAdmin) return true
    const perm = user.role?.permissions?.find((p) => p.module === module)
    return perm?.[action] || false
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, setSession, logout, isSuperAdmin, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
