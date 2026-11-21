import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { getImageUrl } from '../../lib/imageUrl'

function fmtTime(sec) {
  if (!sec && sec !== 0) return '-'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function HomeworkDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/homework/${id}`).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-gray-500">Loading...</p>
  if (error) return <p className="text-red-600">{error}</p>
  if (!data) return null

  const { homework: h, analysis: a } = data

  return (
    <div>
      <Link to="/admin/homework" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Back to Homework
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{h.title}</h1>
          <div className="mt-1 flex items-center gap-3 flex-wrap text-sm text-gray-500">
            <span>{h.batch?.name}</span>
            <span>· {h.questions?.length} questions</span>
            {h.timeLimitMin > 0 && <span>· {h.timeLimitMin} min</span>}
            {h.dueDate && <span>· Due {new Date(h.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${h.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{h.isActive ? 'Active' : 'Hidden'}</span>
          </div>
        </div>
        <Link to={`/admin/homework/${id}/edit`} className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">Edit</Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{a.rows.filter((r) => r.submitted).length}<span className="text-base text-gray-400">/{a.totalStudents}</span></p>
          <p className="text-xs text-gray-500 mt-1">Submitted</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{a.avgAccuracy === null ? '-' : `${a.avgAccuracy}%`}</p>
          <p className="text-xs text-gray-500 mt-1">Avg accuracy</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{a.avgScore === null ? '-' : a.avgScore}</p>
          <p className="text-xs text-gray-500 mt-1">Avg score</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{a.avgTime === null ? '-' : fmtTime(a.avgTime)}</p>
          <p className="text-xs text-gray-500 mt-1">Avg time</p>
        </div>
      </div>

      {/* Students */}
      <h2 className="font-semibold text-gray-900 mb-3">Students</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Student</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Score</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Accuracy</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Time</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {a.rows.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-6 text-center text-gray-400">No students in this batch yet.</td></tr>
            )}
            {a.rows.map((r) => (
              <tr key={r.student._id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {r.student.photo ? (
                      <img src={getImageUrl(r.student.photo)} alt="" className="w-8 h-8 rounded-full object-cover bg-gray-100 shrink-0" onError={(e) => { e.target.style.display = 'none' }} />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">{r.student.name?.charAt(0)?.toUpperCase()}</span>
                    )}
                    <div className="min-w-0">
                      <span className="font-medium text-gray-900 block truncate">{r.student.name}</span>
                      {r.leftBatch && <span className="text-[11px] text-amber-600">left batch</span>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  {r.submitted
                    ? <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Submitted</span>
                    : <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">Pending</span>}
                </td>
                <td className="px-5 py-3 text-gray-700">{r.submitted ? `${r.score}/${r.total}` : '-'}</td>
                <td className="px-5 py-3 text-gray-700">{r.submitted ? `${r.accuracy}%` : '-'}</td>
                <td className="px-5 py-3 text-gray-700">{r.submitted ? fmtTime(r.timeSpentSec) : '-'}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">{r.submittedAt ? new Date(r.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-question difficulty */}
      <h2 className="font-semibold text-gray-900 mb-3">Question Analysis</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-500 w-12">#</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Question</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Answer</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500 w-56">Correct</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {a.perQuestion.map((q) => {
              const pct = q.total ? Math.round((q.correct / q.total) * 100) : 0
              return (
                <tr key={q.index} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-400">{q.index + 1}</td>
                  <td className="px-5 py-3 font-mono text-gray-800">{q.display}</td>
                  <td className="px-5 py-3 text-gray-700 font-semibold">{q.answer}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-16 text-right">{q.correct}/{q.total} ({pct}%)</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
