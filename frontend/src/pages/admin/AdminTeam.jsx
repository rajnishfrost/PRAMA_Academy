import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'
import { getImageUrl } from '../../lib/imageUrl'
import Pagination from '../../components/Pagination'

export default function AdminTeam() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const { hasPermission } = useAuth()

  const canWrite = hasPermission('team', 'write')
  const canDelete = hasPermission('team', 'delete')

  const fetchMembers = (p = 1) => {
    setLoading(true)
    api.get(`/team?page=${p}&limit=10`).then((d) => {
      setMembers(d.members)
      setPages(d.pages || 1)
      setPage(d.page || 1)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchMembers() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this team member?')) return
    try {
      await api.delete(`/team/${id}`)
      fetchMembers(page)
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading && members.length === 0) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Team</h1>
        {canWrite && (
          <Link
            to="/admin/team/new"
            className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Add Member
          </Link>
        )}
      </div>

      {members.length === 0 ? (
        <p className="text-gray-500">No team members yet.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 w-[28%]">Member</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 w-[18%]">Role</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 w-[22%]">Education</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 w-[14%]">Courses</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 w-[8%]">Status</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500 w-[10%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {members.map((m) => (
                  <tr key={m._id} className="hover:bg-gray-50 align-top">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.image ? getImageUrl(m.image) : ''}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover bg-gray-100 shrink-0"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                        <div className="min-w-0">
                          <span className="font-medium text-gray-900 block truncate">{m.name}</span>
                          <p className="text-xs text-gray-500 truncate">{m.qualification}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 truncate">{m.role}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      <p className="line-clamp-2">{m.education || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs truncate">{m.courses || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {m.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <Link to={`/admin/team/${m._id}/edit`} className="text-primary hover:underline text-xs">Edit</Link>
                      {canDelete && (
                        <button onClick={() => handleDelete(m._id)} className="text-red-500 hover:underline text-xs">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {members.map((m) => (
              <div key={m._id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={m.image ? getImageUrl(m.image) : ''}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover bg-gray-100 shrink-0"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{m.name}</p>
                    <p className="text-xs text-primary">{m.role}</p>
                    <p className="text-xs text-gray-500">{m.qualification}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {m.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {m.education && (
                  <p className="text-xs text-gray-500 mb-1"><span className="font-medium text-gray-600">Education:</span> {m.education}</p>
                )}
                {m.experience && (
                  <p className="text-xs text-gray-500 mb-1"><span className="font-medium text-gray-600">Experience:</span> {m.experience}</p>
                )}
                {m.achievements && (
                  <p className="text-xs text-gray-500 mb-1"><span className="font-medium text-gray-600">Achievements:</span> {m.achievements}</p>
                )}
                {m.courses && (
                  <p className="text-xs text-gray-500 mb-2"><span className="font-medium text-gray-600">Courses:</span> {m.courses}</p>
                )}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <Link to={`/admin/team/${m._id}/edit`} className="text-primary text-sm font-medium">Edit</Link>
                  {canDelete && (
                    <button onClick={() => handleDelete(m._id)} className="text-red-500 text-sm font-medium">Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} pages={pages} onPageChange={fetchMembers} />
        </>
      )}
    </div>
  )
}
