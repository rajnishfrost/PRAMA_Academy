import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { api } from '../../lib/api'

export default function Dashboard() {
  const { user, hasPermission } = useAuth()
  const [stats, setStats] = useState({ courses: 0, team: 0, brandAmb: 0, messages: 0, classVideos: 0, users: 0, roles: 0 })

  const allCards = [
    { label: 'Courses', key: 'courses', module: 'courses', endpoint: '/courses?limit=1', extract: (d) => d.total ?? d.courses?.length ?? 0, to: '/admin/courses', color: 'bg-blue-500' },
    { label: 'Team', key: 'team', module: 'team', endpoint: '/team?limit=1', extract: (d) => d.total ?? d.members?.length ?? 0, to: '/admin/team', color: 'bg-amber-500' },
    { label: 'Brand Amb.', key: 'brandAmb', module: 'brand-ambassador', endpoint: '/brand-ambassador?limit=1', extract: (d) => d.total ?? 0, to: '/admin/brand-ambassador', color: 'bg-rose-500' },
    { label: 'Messages', key: 'messages', module: 'contact', endpoint: '/contact?limit=1', extract: (d) => d.total ?? 0, to: '/admin/messages', color: 'bg-cyan-500' },
    { label: 'Class Videos', key: 'classVideos', module: 'class-video', endpoint: '/class-video', extract: (d) => d.total ?? d.videos?.length ?? 0, to: '/admin/class-video', color: 'bg-teal-500' },
    { label: 'Users', key: 'users', module: 'users', endpoint: '/users?limit=1', extract: (d) => d.total ?? d.users?.length ?? 0, to: '/admin/users', color: 'bg-green-500' },
    { label: 'Roles', key: 'roles', module: 'roles', endpoint: '/roles?limit=1', extract: (d) => d.total ?? d.roles?.length ?? 0, to: '/admin/roles', color: 'bg-purple-500' },
  ]

  const visibleCards = allCards.filter((c) => hasPermission(c.module, 'read'))

  useEffect(() => {
    visibleCards.forEach((c) => {
      api.get(c.endpoint).then((d) => setStats((s) => ({ ...s, [c.key]: c.extract(d) }))).catch(() => {})
    })
  }, [user?.role]) // eslint-disable-line react-hooks/exhaustive-deps

  const cards = visibleCards.map((c) => ({
    label: c.label, value: stats[c.key], to: c.to, color: c.color,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back, {user?.name}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 ${c.color} rounded-lg flex items-center justify-center text-white text-lg font-bold mb-4`}>
              {c.value}
            </div>
            <h3 className="font-semibold text-gray-900">{c.label}</h3>
            <p className="text-sm text-gray-500 mt-1">Manage {c.label.toLowerCase()}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
