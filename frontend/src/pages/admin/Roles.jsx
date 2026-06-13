import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import Pagination from '../../components/Pagination'

export default function Roles() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const fetchRoles = (p = 1) => {
    setLoading(true)
    api.get(`/roles?page=${p}&limit=10`).then((d) => {
      setRoles(d.roles)
      setPages(d.pages || 1)
      setPage(d.page || 1)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchRoles() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this role?')) return
    try {
      await api.delete(`/roles/${id}`)
      fetchRoles(page)
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading && roles.length === 0) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
        <Link
          to="/admin/roles/new"
          className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + New Role
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div key={role._id} className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{role.name}</h3>
                {role.description && <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>}
              </div>
              {role.isSystem && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">System</span>
              )}
            </div>

            {role.permissions?.length > 0 && (
              <div className="space-y-2 mb-4">
                {role.permissions.map((p) => (
                  <div key={p.module} className="text-xs">
                    <span className="font-medium text-gray-700 capitalize">{p.module}: </span>
                    <span className="text-gray-500">
                      {['read', 'write', 'edit', 'delete'].filter((a) => p[a]).join(', ') || 'none'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!role.isSystem && (
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <Link to={`/admin/roles/${role._id}/edit`} className="text-xs text-primary hover:underline">Edit</Link>
                <button onClick={() => handleDelete(role._id)} className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Pagination page={page} pages={pages} onPageChange={fetchRoles} />
    </div>
  )
}
