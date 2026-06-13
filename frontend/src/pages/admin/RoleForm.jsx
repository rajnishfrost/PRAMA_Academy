import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'

const ACTIONS = ['read', 'write', 'edit', 'delete']

export default function RoleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [modules, setModules] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/roles/modules').then((d) => {
      setModules(d.modules)
      if (!isEdit) {
        setPermissions(d.modules.map((m) => ({
          module: m, read: false, write: false, edit: false, delete: false,
        })))
      }
    }).catch(() => {})

    if (isEdit) {
      api.get(`/roles/${id}`).then((d) => {
        setName(d.role.name)
        setDescription(d.role.description || '')
        setPermissions(d.role.permissions || [])
      }).catch((e) => setError(e.message))
    }
  }, [id, isEdit])

  const togglePerm = (module, action) => {
    setPermissions((prev) => prev.map((p) =>
      p.module === module ? { ...p, [action]: !p[action] } : p
    ))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body = { name, description, permissions }
      if (isEdit) await api.put(`/roles/${id}`, body)
      else await api.post('/roles', body)
      navigate('/admin/roles')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Role' : 'Create Role'}
      </h1>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="e.g. Manager"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Optional description"
            />
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Module Permissions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Module</th>
                  {ACTIONS.map((a) => (
                    <th key={a} className="text-center py-3 px-2 font-medium text-gray-500 capitalize">{a}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
                  <tr key={perm.module} className="border-b last:border-0">
                    <td className="py-3 px-2 font-medium text-gray-700 capitalize">{perm.module}</td>
                    {ACTIONS.map((action) => (
                      <td key={action} className="text-center py-3 px-2">
                        <input
                          type="checkbox"
                          checked={perm[action] || false}
                          onChange={() => togglePerm(perm.module, action)}
                          className="accent-primary w-4 h-4"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Role' : 'Create Role'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/roles')}
            className="border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
