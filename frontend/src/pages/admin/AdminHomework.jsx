import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'

export default function AdminHomework() {
  const [homeworks, setHomeworks] = useState([])
  const [loading, setLoading] = useState(true)
  const { hasPermission, isSuperAdmin } = useAuth()

  const canWrite = isSuperAdmin || hasPermission('homework', 'write')
  const canDelete = isSuperAdmin || hasPermission('homework', 'delete')

  const fetchHw = () => {
    setLoading(true)
    api.get('/homework').then((d) => setHomeworks(d.homeworks)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { fetchHw() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this homework and all its submissions?')) return
    try { await api.delete(`/homework/${id}`); fetchHw() }
    catch (err) { alert(err.message) }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Homework</h1>
        {canWrite && (
          <Link to="/admin/homework/new" className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">+ Create Homework</Link>
        )}
      </div>

      {homeworks.length === 0 ? (
        <p className="text-gray-500">No homework yet. Create one and assign it to a batch.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Title</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Batch</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Qs</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Submitted</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Avg</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {homeworks.map((h) => (
                <tr key={h._id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <Link to={`/admin/homework/${h._id}`} className="font-medium text-gray-900 hover:text-primary">{h.title}</Link>
                    {h.dueDate && <p className="text-xs text-gray-400">Due {new Date(h.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>}
                  </td>
                  <td className="px-5 py-4 text-gray-500">{h.batch?.name || '-'}</td>
                  <td className="px-5 py-4 text-gray-700">{h.questionCount}</td>
                  <td className="px-5 py-4 text-gray-700">{h.submissionCount}</td>
                  <td className="px-5 py-4 text-gray-700">{h.avgAccuracy === null ? '-' : `${h.avgAccuracy}%`}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${h.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{h.isActive ? 'Active' : 'Hidden'}</span>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <Link to={`/admin/homework/${h._id}`} className="text-primary hover:underline text-xs">View</Link>
                    <Link to={`/admin/homework/${h._id}/edit`} className="text-gray-600 hover:underline text-xs ml-3">Edit</Link>
                    {canDelete && <button onClick={() => handleDelete(h._id)} className="text-red-500 hover:underline text-xs ml-3">Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
