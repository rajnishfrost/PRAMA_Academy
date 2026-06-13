import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'
import Pagination from '../../components/Pagination'

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  read: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
}

const reasonLabels = {
  franchise: 'Franchise',
  'children-education': 'Children Education',
  other: 'Other',
}

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [expanded, setExpanded] = useState(null)
  const { hasPermission } = useAuth()

  const canWrite = hasPermission('contact', 'write')
  const canDelete = hasPermission('contact', 'delete')

  const fetchMessages = (p = page, status = statusFilter) => {
    setLoading(true)
    const params = `?page=${p}&limit=10${status ? `&status=${status}` : ''}`
    api.get(`/contact${params}`).then((d) => {
      setMessages(d.messages)
      setPages(d.pages)
      setTotal(d.total)
      setPage(d.page)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchMessages(1) }, [statusFilter])

  const updateStatus = async (id, status) => {
    try {
      const data = await api.put(`/contact/${id}`, { status })
      setMessages((prev) => prev.map((m) => m._id === id ? data.contact : m))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return
    try {
      await api.delete(`/contact/${id}`)
      setMessages((prev) => prev.filter((m) => m._id !== id))
      setTotal((t) => t - 1)
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading && messages.length === 0) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">{total} total messages</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {messages.length === 0 ? (
        <p className="text-gray-500">No messages found.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Contact</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Reason</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {messages.map((m) => (
                  <tr key={m._id} className={`hover:bg-gray-50 ${m.status === 'new' ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setExpanded(expanded === m._id ? null : m._id)}
                        className="text-left"
                      >
                        <span className="font-medium text-gray-900">{m.name}</span>
                        {expanded === m._id && (
                          <p className="text-xs text-gray-600 mt-2 max-w-xs whitespace-pre-wrap">{m.message}</p>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 text-xs">{m.email}</div>
                      {m.phone && <div className="text-gray-500 text-xs">{m.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {reasonLabels[m.reason] || m.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {canWrite ? (
                        <select
                          value={m.status}
                          onChange={(e) => updateStatus(m._id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[m.status]}`}
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      ) : (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[m.status]}`}>
                          {m.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setExpanded(expanded === m._id ? null : m._id)}
                        className="text-primary hover:underline text-xs"
                      >
                        {expanded === m._id ? 'Hide' : 'View'}
                      </button>
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
            {messages.map((m) => (
              <div key={m._id} className={`bg-white rounded-xl shadow-sm p-4 ${m.status === 'new' ? 'ring-1 ring-blue-200' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.email}</p>
                    {m.phone && <p className="text-xs text-gray-500">{m.phone}</p>}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ml-2 ${statusColors[m.status]}`}>
                    {m.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {reasonLabels[m.reason] || m.reason}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{m.message}</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  {canWrite ? (
                    <select
                      value={m.status}
                      onChange={(e) => updateStatus(m._id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  ) : <span />}
                  {canDelete && (
                    <button onClick={() => handleDelete(m._id)} className="text-red-500 text-sm font-medium">Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} pages={pages} onPageChange={fetchMessages} />
        </>
      )}
    </div>
  )
}
