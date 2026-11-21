import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'
import { getImageUrl } from '../../lib/imageUrl'
import Pagination from '../../components/Pagination'

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [batch, setBatch] = useState('')
  const [type, setType] = useState('')
  const { hasPermission, isSuperAdmin } = useAuth()

  const canWrite = isSuperAdmin || hasPermission('students', 'write')
  const canDelete = isSuperAdmin || hasPermission('students', 'delete')

  const fetchStudents = (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p, limit: 20 })
    if (search.trim()) params.set('search', search.trim())
    if (batch) params.set('batch', batch)
    if (type) params.set('accountType', type)
    api.get(`/admin/students?${params}`).then((d) => {
      setStudents(d.students); setPages(d.pages || 1); setPage(d.page || 1)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { api.get('/batches').then((d) => setBatches(d.batches)).catch(() => {}) }, [])
  useEffect(() => { fetchStudents(1) /* eslint-disable-next-line */ }, [batch, type])

  const handleDelete = async (id) => {
    if (!confirm('Delete this student? Their submissions will also be removed.')) return
    try { await api.delete(`/admin/students/${id}`); fetchStudents(page) }
    catch (err) { alert(err.message) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Students</h1>
        {canWrite && (
          <Link to="/admin/students/new" className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">+ Add Student</Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <form onSubmit={(e) => { e.preventDefault(); fetchStudents(1) }} className="flex-1 flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">Search</button>
        </form>
        <select value={batch} onChange={(e) => setBatch(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
          <option value="">All batches</option>
          {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
          <option value="">All types</option>
          <option value="batch">Enrolled (batch)</option>
          <option value="signup">Free (signup)</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : students.length === 0 ? (
        <p className="text-gray-500">No students found.</p>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Student</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Batch</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {s.photo ? (
                          <img src={getImageUrl(s.photo)} alt="" className="w-9 h-9 rounded-full object-cover bg-gray-100 shrink-0" onError={(e) => { e.target.style.display = 'none' }} />
                        ) : (
                          <span className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold shrink-0">{s.name?.charAt(0)?.toUpperCase()}</span>
                        )}
                        <div className="min-w-0">
                          <span className="font-medium text-gray-900 block truncate">{s.name}</span>
                          <p className="text-xs text-gray-500 truncate">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.accountType === 'batch' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {s.accountType === 'batch' ? 'Enrolled' : 'Free'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{s.batch?.name || '-'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <Link to={`/admin/students/${s._id}/edit`} className="text-primary hover:underline text-xs">Edit</Link>
                      {canDelete && <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:underline text-xs ml-3">Delete</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} onPageChange={fetchStudents} />
        </>
      )}
    </div>
  )
}
