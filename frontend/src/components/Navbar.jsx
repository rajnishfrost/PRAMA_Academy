import { useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useStudentAuth } from '../lib/StudentAuthContext'
import { getImageUrl } from '../lib/imageUrl'

const baseLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/#courses', label: 'Courses' },
  { to: '/team', label: 'Team' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { student, isBatch, logout } = useStudentAuth()

  // Tools visible only when logged in; Homework only for enrolled students.
  const navLinks = [...baseLinks]
  if (student) navLinks.push({ to: '/tools', label: 'Tools' })
  if (isBatch) navLinks.push({ to: '/homework', label: 'Homework' })

  const handleCoursesClick = () => {
    setOpen(false)
    if (location.pathname === '/') {
      document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/', { state: { scrollTo: 'courses' } })
    }
  }

  const doLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  const initial = student?.name?.charAt(0)?.toUpperCase() || '?'
  const avatar = student?.photo ? (
    <img src={getImageUrl(student.photo)} alt="" className="w-8 h-8 rounded-full object-cover" />
  ) : (
    <span className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold">{initial}</span>
  )

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm print:hidden no-print">
      {/* Top bar */}
      <div className="bg-primary text-white text-xs md:text-sm">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center">
          <span className="hidden sm:inline">Expanding Horizons Through Quality Education</span>
          <div className="flex items-center gap-4 ml-auto">
            <a href="https://www.instagram.com/pramaacademy/" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Instagram">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://www.youtube.com/@pramaacademy" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity" aria-label="YouTube">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            PRAMA <span className="text-primary">ACADEMY</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-7">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              {to === '/#courses' ? (
                <button onClick={handleCoursesClick} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">{label}</button>
              ) : (
                <NavLink to={to} end={to === '/'} className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>{label}</NavLink>
              )}
            </li>
          ))}

          {!student ? (
            <>
              <li>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Login</Link>
              </li>
              <li>
                <Link to="/contact" className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">Contact Us</Link>
              </li>
            </>
          ) : (
            <li className="relative group">
              <button type="button" className="flex items-center cursor-default" aria-label="Account menu">
                {avatar}
              </button>
              {/* Opens on hover / keyboard focus. top-full + pt-2 bridges the gap so it stays open. */}
              <div className="absolute right-0 top-full pt-2 w-52 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 transition-all duration-150 z-20">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p>
                    <p className="text-xs text-gray-500 truncate">{student.email}</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                  {isBatch && <Link to="/homework" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Homework</Link>}
                  <button onClick={doLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Logout</button>
                </div>
              </div>
            </li>
          )}
        </ul>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-700" aria-label="Toggle menu">
          {open ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t">
          <ul className="px-4 py-4 space-y-1">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                {to === '/#courses' ? (
                  <button onClick={handleCoursesClick} className="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">{label}</button>
                ) : (
                  <NavLink to={to} end={to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `block px-4 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-primary/10 hover:text-primary'}`}>{label}</NavLink>
                )}
              </li>
            ))}

            {student ? (
              <>
                <li className="pt-2 mt-1 border-t border-gray-100">
                  <div className="flex items-center gap-3 px-4 py-2">
                    {avatar}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p>
                      <p className="text-xs text-gray-500 truncate">{student.email}</p>
                    </div>
                  </div>
                </li>
                <li><NavLink to="/profile" onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-lg text-gray-700 hover:bg-primary/10 hover:text-primary">My Profile</NavLink></li>
                <li><button onClick={doLogout} className="block w-full text-left px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-50">Logout</button></li>
              </>
            ) : (
              <>
                <li><NavLink to="/login" onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-lg text-gray-700 hover:bg-primary/10 hover:text-primary">Login</NavLink></li>
                <li className="pt-2">
                  <Link to="/contact" onClick={() => setOpen(false)} className="block text-center bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">Contact Us</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  )
}
