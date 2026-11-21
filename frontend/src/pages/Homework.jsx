import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { studentApi } from '../lib/api'

export default function Homework() {
  const [homeworks, setHomeworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    studentApi.get('/student-homework/mine')
      .then((d) => setHomeworks(d.homeworks))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">My Homework</h1>
        <p className="text-sm text-gray-500 mb-6">Assignments from your teacher. Solve and submit to see your result.</p>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        {!loading && !error && homeworks.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500">
            No homework assigned yet. Check back later!
          </div>
        )}

        <div className="space-y-4">
          {homeworks.map((hw) => {
            const overdue = hw.dueDate && !hw.submitted && new Date(hw.dueDate) < new Date()
            return (
              <Link
                key={hw._id}
                to={`/homework/${hw._id}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-bold text-gray-900">{hw.title}</h2>
                    <div className="mt-1 flex items-center gap-3 flex-wrap text-xs text-gray-500">
                      <span>{hw.questionCount} questions</span>
                      {hw.timeLimitMin > 0 && <span>· {hw.timeLimitMin} min limit</span>}
                      {hw.dueDate && (
                        <span className={overdue ? 'text-red-500 font-medium' : ''}>
                          · Due {new Date(hw.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {hw.submitted ? (
                      <>
                        <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Submitted</span>
                        <p className="mt-1 text-sm font-bold text-gray-900">{hw.score}/{hw.total} · {hw.accuracy}%</p>
                      </>
                    ) : (
                      <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                        {overdue ? 'Overdue' : 'Pending'}
                      </span>
                    )}
                  </div>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {hw.submitted ? 'View result' : 'Start homework'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
