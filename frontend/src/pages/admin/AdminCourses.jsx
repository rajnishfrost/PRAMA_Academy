import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'
import { getImageUrl } from '../../lib/imageUrl'
import Pagination from '../../components/Pagination'

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const { hasPermission } = useAuth()

  const canWrite = hasPermission('courses', 'write')
  const canDelete = hasPermission('courses', 'delete')

  const fetchCourses = (p = 1) => {
    setLoading(true)
    api.get(`/courses?page=${p}&limit=10`).then((d) => {
      setCourses(d.courses)
      setPages(d.pages || 1)
      setPage(d.page || 1)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchCourses() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    try {
      await api.delete(`/courses/${id}`)
      fetchCourses(page)
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading && courses.length === 0) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Courses</h1>
        {canWrite && (
          <Link
            to="/admin/courses/new"
            className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Add Course
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <p className="text-gray-500">No courses yet.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Course</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Slug</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Price</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {courses.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {c.cover && <img src={getImageUrl(c.cover)} alt="" className="w-8 h-8 rounded object-contain bg-gray-100" />}
                        <span className="font-medium text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{c.slug}</td>
                    <td className="px-6 py-4 text-gray-500">{c.price?.monthly || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link to={`/admin/courses/${c._id}/edit`} className="text-primary hover:underline text-xs">Edit</Link>
                      {canDelete && (
                        <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:underline text-xs">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {courses.map((c) => (
              <div key={c._id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  {c.cover && <img src={getImageUrl(c.cover)} alt="" className="w-10 h-10 rounded object-contain bg-gray-100" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.slug}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{c.price?.monthly || '-'}</span>
                  <div className="flex gap-3">
                    <Link to={`/admin/courses/${c._id}/edit`} className="text-primary text-sm font-medium">Edit</Link>
                    {canDelete && (
                      <button onClick={() => handleDelete(c._id)} className="text-red-500 text-sm font-medium">Delete</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} pages={pages} onPageChange={fetchCourses} />
        </>
      )}
    </div>
  )
}
