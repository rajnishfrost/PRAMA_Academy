import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'

export default function BatchForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [courseIds, setCourseIds] = useState([])
  const [teacher, setTeacher] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [courses, setCourses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/courses/public').then((d) => setCourses(d.courses || [])).catch(() => {})
    api.get('/batches/teachers').then((d) => setTeachers(d.teachers || [])).catch(() => {})
    if (isEdit) {
      api.get(`/batches/${id}`).then((d) => {
        setName(d.batch.name)
        setDescription(d.batch.description || '')
        setCourseIds((d.batch.courses || []).map((c) => c._id || c))
        setTeacher(d.batch.teacher?._id || d.batch.teacher || '')
        setIsActive(d.batch.isActive)
      }).catch((e) => setError(e.message))
    }
  }, [id, isEdit])

  const toggleCourse = (cid) => {
    setCourseIds((prev) => (prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid]))
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body = { name, description, courses: courseIds, teacher: teacher || null, isActive }
      if (isEdit) await api.put(`/batches/${id}`, body)
      else await api.post('/batches', body)
      navigate('/admin/batches')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Batch' : 'Create Batch'}</h1>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <form onSubmit={submit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            placeholder="e.g. Level 1 - Morning" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            placeholder="Optional" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teacher (optional)</label>
          <select value={teacher} onChange={(e) => setTeacher(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
            <option value="">— Select teacher —</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>{t.name}{t.role?.name ? ` · ${t.role.name}` : ''}</option>
            ))}
          </select>
          {teachers.length === 0 && <p className="text-xs text-amber-600 mt-1">No staff users found to assign.</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Courses (optional, select one or more)</label>
          {courses.length === 0 ? (
            <p className="text-xs text-gray-400">No courses available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {courses.map((c) => (
                <label key={c._id}
                  className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer ${courseIds.includes(c._id) ? 'border-primary bg-primary/5 text-gray-900' : 'border-gray-200 text-gray-600'}`}>
                  <input type="checkbox" checked={courseIds.includes(c._id)} onChange={() => toggleCourse(c._id)} className="accent-primary w-4 h-4" />
                  {c.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-primary w-4 h-4" />
          Active
        </label>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : isEdit ? 'Update Batch' : 'Create Batch'}
          </button>
          <button type="button" onClick={() => navigate('/admin/batches')} className="border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  )
}
