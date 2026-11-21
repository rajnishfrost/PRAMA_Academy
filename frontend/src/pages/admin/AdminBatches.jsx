import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'

export default function AdminBatches() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const { hasPermission, isSuperAdmin } = useAuth()

  const canWrite = isSuperAdmin || hasPermission('batches', 'write')
  const canDelete = isSuperAdmin || hasPermission('batches', 'delete')

  const fetchBatches = () => {
    setLoading(true)
    api.get('/batches').then((d) => setBatches(d.batches)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { fetchBatches() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this batch?')) return
    try { await api.delete(`/batches/${id}`); fetchBatches() }
    catch (err) { alert(err.message) }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Batches</h1>
        {canWrite && (
          <Link to="/admin/batches/new" className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">+ Add Batch</Link>
        )}
      </div>

      {batches.length === 0 ? (
        <p className="text-gray-500">No batches yet. Create one to group enrolled students.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Batch</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Teacher</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Courses</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Students</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {batches.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <span className="font-medium text-gray-900">{b.name}</span>
                    {b.description && <p className="text-xs text-gray-500 line-clamp-1">{b.description}</p>}
                  </td>
                  <td className="px-5 py-4 text-gray-500">{b.teacher?.name || '-'}</td>
                  <td className="px-5 py-4 text-gray-500">{b.courses?.length ? b.courses.map((c) => c.name).join(', ') : '-'}</td>
                  <td className="px-5 py-4 text-gray-700">{b.studentCount}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{b.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <Link to={`/admin/batches/${b._id}/edit`} className="text-primary hover:underline text-xs">Edit</Link>
                    {canDelete && <button onClick={() => handleDelete(b._id)} className="text-red-500 hover:underline text-xs ml-3">Delete</button>}
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
