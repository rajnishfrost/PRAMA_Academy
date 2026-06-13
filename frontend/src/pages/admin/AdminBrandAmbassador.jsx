import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'
import Pagination from '../../components/Pagination'

export default function AdminBrandAmbassador() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const { hasPermission } = useAuth()

  const canWrite = hasPermission('brand-ambassador', 'write')
  const canDelete = hasPermission('brand-ambassador', 'delete')

  const fetchSections = (p = 1) => {
    setLoading(true)
    api.get(`/brand-ambassador?page=${p}&limit=10`).then((d) => {
      setSections(d.sections)
      setPages(d.pages || 1)
      setPage(d.page || 1)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchSections() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this section?')) return
    try {
      await api.delete(`/brand-ambassador/${id}`)
      fetchSections(page)
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading && sections.length === 0) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Brand Ambassador</h1>
        {canWrite && (
          <Link
            to="/admin/brand-ambassador/new"
            className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Add Section
          </Link>
        )}
      </div>

      {sections.length === 0 ? (
        <p className="text-gray-500">No sections yet.</p>
      ) : (
        <>
          <div className="space-y-4">
            {sections.map((s) => (
              <div key={s._id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{s.title || s.section}</h3>
                    <p className="text-xs text-gray-500">Section: {s.section} &middot; {s.items.length} items</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Link to={`/admin/brand-ambassador/${s._id}/edit`} className="text-primary hover:underline text-xs">
                      Edit
                    </Link>
                    {canDelete && (
                      <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:underline text-xs">
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {s.items.slice(0, 8).map((item, i) => (
                    <div key={i} className="w-16 h-16 rounded-lg bg-black overflow-hidden shrink-0 flex items-center justify-center relative">
                      {item.type === 'video' ? (
                        <>
                          <video
                            src={item.url.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${item.url}` : item.url}
                            preload="metadata"
                            muted
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5.14v14l11-7-11-7z" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <img
                          src={item.url.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${item.url}` : item.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                  {s.items.length > 8 && (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-xs text-gray-500 font-medium">
                      +{s.items.length - 8}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} pages={pages} onPageChange={fetchSections} />
        </>
      )}
    </div>
  )
}
