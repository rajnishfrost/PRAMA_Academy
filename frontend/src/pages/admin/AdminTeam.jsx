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
  const canEdit = hasPermission('team', 'edit')
  const canDelete = hasPermission('team', 'delete')
  const [reordering, setReordering] = useState(false)

  const fetchMembers = (p = 1) => {
    setLoading(true)
    api.get(`/team?page=${p}&limit=10`).then((d) => {
      setMembers(d.members)
      setPages(d.pages || 1)
      setPage(d.page || 1)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchMembers() }, [])

  // Reorder: swap a member with its neighbour, renumber the page, persist changed ones
  const moveMember = async (index, dir) => {
    const target = index + dir
    if (reordering || target < 0 || target >= members.length) return
    const reordered = [...members]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    const base = (page - 1) * 10
    const updates = []
    const normalized = reordered.map((m, i) => {
      const newOrder = base + i
      if (m.order !== newOrder) updates.push({ id: m._id, order: newOrder })
      return { ...m, order: newOrder }
    })
    setMembers(normalized) // optimistic
    setReordering(true)
    try {
      await Promise.all(updates.map((u) => api.put(`/team/${u.id}`, { order: u.order })))
    } catch (err) {
      alert(err.message || 'Reorder failed')
      fetchMembers(page) // revert to server truth
    } finally {
      setReordering(false)
    }
  }

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
                {members.map((m, idx) => (
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
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && (
                          <span className="inline-flex items-center">
                            <button onClick={() => moveMember(idx, -1)} disabled={reordering || idx === 0} title="Move up" className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed px-0.5">↑</button>
                            <button onClick={() => moveMember(idx, 1)} disabled={reordering || idx === members.length - 1} title="Move down" className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed px-0.5">↓</button>
                          </span>
                        )}
                        <Link to={`/admin/team/${m._id}/edit`} className="text-primary hover:underline text-xs">Edit</Link>
                        {canDelete && (
                          <button onClick={() => handleDelete(m._id)} className="text-red-500 hover:underline text-xs">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {members.map((m, idx) => (
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
                <div className="flex items-center justify-end gap-4 pt-2 border-t border-gray-100">
                  {canEdit && (
                    <span className="inline-flex items-center gap-3 mr-auto">
                      <button onClick={() => moveMember(idx, -1)} disabled={reordering || idx === 0} className="text-gray-500 disabled:opacity-30 text-lg leading-none" aria-label="Move up">↑</button>
                      <button onClick={() => moveMember(idx, 1)} disabled={reordering || idx === members.length - 1} className="text-gray-500 disabled:opacity-30 text-lg leading-none" aria-label="Move down">↓</button>
                    </span>
                  )}
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
