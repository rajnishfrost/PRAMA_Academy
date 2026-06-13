import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'
import Pagination from '../../components/Pagination'

export default function Users() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' })
  const [editingId, setEditingId] = useState(null)
  const [editingSuperAdmin, setEditingSuperAdmin] = useState(false)
  const [error, setError] = useState('')

  const fetchUsers = (p = 1) => {
    api.get(`/users?page=${p}&limit=10`).then((d) => {
      setUsers(d.users)
      setPages(d.pages || 1)
      setPage(d.page || 1)
    }).catch(() => {})
  }

  useEffect(() => {
    Promise.all([
      api.get('/users?page=1&limit=10'),
      api.get('/roles'),
    ]).then(([u, r]) => {
      setUsers(u.users)
      setPages(u.pages || 1)
      setPage(u.page || 1)
      setRoles(r.roles)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setEditingSuperAdmin(false)
    setForm({ name: '', email: '', password: '', role: '' })
    setError('')
  }

  const startEdit = (u) => {
    setEditingId(u._id)
    setEditingSuperAdmin(u.role?.name === 'Super Admin')
    setForm({ name: u.name, email: u.email, password: '', role: u.role?._id || '' })
    setShowForm(true)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        const payload = { name: form.name, email: form.email, role: form.role }
        if (form.password) payload.password = form.password
        const data = await api.put(`/users/${editingId}`, payload)
        setUsers((prev) => prev.map((x) => x._id === editingId ? data.user : x))
      } else {
        await api.post('/users', form)
        fetchUsers(1)
      }
      resetForm()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    try {
      await api.delete(`/users/${id}`)
      fetchUsers(page)
    } catch (err) {
      alert(err.message)
    }
  }

  const toggleActive = async (u) => {
    try {
      const data = await api.put(`/users/${u._id}`, { isActive: !u.isActive })
      setUsers((prev) => prev.map((x) => x._id === u._id ? data.user : x))
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Users</h1>
        <button
          onClick={() => showForm ? resetForm() : setShowForm(true)}
          className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit User' : 'Add New User'}</h2>
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={editingId ? 'New Password (leave blank to keep)' : 'Password'}
              required={!editingId}
              minLength={6}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
              disabled={editingSuperAdmin}
              className={`px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${editingSuperAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Select Role</option>
              {roles.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </div>
          <button type="submit" className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
            {editingId ? 'Update User' : 'Create User'}
          </button>
        </form>
      )}

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Email</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Role</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                <td className="px-6 py-4 text-gray-500">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {u.role?.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.role?.name === 'Super Admin' ? (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">Active</span>
                  ) : (
                    <button
                      onClick={() => toggleActive(u)}
                      disabled={u._id === currentUser?._id}
                      className={`text-xs font-medium px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  {u._id !== currentUser?._id && (
                    <>
                      <button onClick={() => startEdit(u)} className="text-xs text-primary hover:underline">Edit</button>
                      {u.role?.name !== 'Super Admin' && (
                        <button onClick={() => handleDelete(u._id)} className="text-xs text-red-500 hover:underline">Delete</button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {users.map((u) => (
          <div key={u._id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{u.name}</p>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
              </div>
              {u.role?.name === 'Super Admin' ? (
                <span className="text-xs font-medium px-2 py-1 rounded-full shrink-0 ml-2 bg-green-100 text-green-700">Active</span>
              ) : (
                <button
                  onClick={() => toggleActive(u)}
                  disabled={u._id === currentUser?._id}
                  className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ml-2 ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                >
                  {u.isActive ? 'Active' : 'Inactive'}
                </button>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                {u.role?.name}
              </span>
              {u._id !== currentUser?._id && (
                <div className="flex items-center gap-3">
                  <button onClick={() => startEdit(u)} className="text-primary text-sm font-medium">Edit</button>
                  {u.role?.name !== 'Super Admin' && (
                    <button onClick={() => handleDelete(u._id)} className="text-red-500 text-sm font-medium">Delete</button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} pages={pages} onPageChange={fetchUsers} />
    </div>
  )
}
