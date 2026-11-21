import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { studentApi } from '../lib/api'

function fmtTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function HomeworkAttempt() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [hw, setHw] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [answers, setAnswers] = useState([])   // strings
  const [elapsed, setElapsed] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)   // array when done
  const [summary, setSummary] = useState(null)  // {score,total,accuracy,timeSpentSec}
  const startRef = useRef(Date.now())

  useEffect(() => {
    studentApi.get(`/student-homework/mine/${id}`)
      .then((d) => {
        setHw(d.homework)
        if (d.submission) {
          setSummary(d.submission)
          setResult(d.result)
        } else {
          setAnswers(new Array(d.homework.questions.length).fill(''))
          startRef.current = Date.now()
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const doSubmit = useCallback(async () => {
    if (submitting || result) return
    setSubmitting(true)
    setError('')
    try {
      const timeSpentSec = Math.round((Date.now() - startRef.current) / 1000)
      const d = await studentApi.post(`/student-homework/mine/${id}/submit`, { answers, timeSpentSec })
      setSummary(d.submission)
      setResult(d.result)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }, [answers, id, submitting, result])

  // timer (only while attempting)
  const attempting = hw && !result
  const limitSec = hw?.timeLimitMin ? hw.timeLimitMin * 60 : 0
  useEffect(() => {
    if (!attempting) return
    const t = setInterval(() => setElapsed(Math.round((Date.now() - startRef.current) / 1000)), 1000)
    return () => clearInterval(t)
  }, [attempting])

  // auto-submit on time up
  useEffect(() => {
    if (attempting && limitSec > 0 && elapsed >= limitSec) doSubmit()
  }, [attempting, limitSec, elapsed, doSubmit])

  if (loading) return <div className="pt-40 pb-20 text-center text-gray-500">Loading...</div>
  if (error && !hw) {
    return (
      <div className="pt-40 pb-20 text-center">
        <p className="text-gray-700 mb-4">{error}</p>
        <Link to="/homework" className="text-primary hover:underline">Back to Homework</Link>
      </div>
    )
  }
  if (!hw) return null

  const remaining = limitSec > 0 ? Math.max(0, limitSec - elapsed) : null

  // -------- RESULT VIEW --------
  if (result) {
    const correctCount = summary?.score ?? result.filter((r) => r.correct).length
    const total = summary?.total ?? result.length
    const accuracy = summary?.accuracy ?? Math.round((correctCount / total) * 100)
    return (
      <section className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Link to="/homework" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            Back to Homework
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{hw.title}</h1>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-900">{correctCount}<span className="text-lg text-gray-400">/{total}</span></p>
              <p className="text-xs text-gray-500 mt-1">Correct</p>
            </div>
            <div>
              <p className={`text-3xl font-bold ${accuracy >= 70 ? 'text-emerald-600' : accuracy >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{accuracy}%</p>
              <p className="text-xs text-gray-500 mt-1">Accuracy</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{summary?.timeSpentSec ? fmtTime(summary.timeSpentSec) : '—'}</p>
              <p className="text-xs text-gray-500 mt-1">Time</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            {result.map((r) => (
              <div key={r.index} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${r.correct ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {r.correct ? '✓' : '✕'}
                  </span>
                  <span className="font-mono text-sm text-gray-800">{r.display} =</span>
                </div>
                <div className="text-right shrink-0 text-sm">
                  <span className={r.correct ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold line-through'}>
                    {r.given === null || r.given === undefined ? '—' : r.given}
                  </span>
                  {!r.correct && <span className="ml-2 text-gray-900 font-semibold">{r.answer}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // -------- ATTEMPT VIEW --------
  const blanks = answers.filter((a) => a === '' || a === null).length
  return (
    <section className="min-h-screen bg-gray-50 pt-28 pb-28 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/homework" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{hw.title}</h1>
        {hw.instructions && <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{hw.instructions}</p>}
        {error && <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hw.questions.map((q) => (
            <div key={q.index} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
              <span className="text-xs text-gray-400 w-6 shrink-0">Q{q.index + 1}</span>
              <span className="font-mono text-base text-gray-800 flex-1 text-right whitespace-nowrap overflow-x-auto">{q.display} =</span>
              <input
                inputMode="numeric"
                value={answers[q.index]}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9-]/g, '')
                  setAnswers((prev) => prev.map((a, i) => (i === q.index ? v : a)))
                }}
                className="w-20 shrink-0 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="?"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sticky footer bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            {remaining !== null ? (
              <span className={remaining <= 30 ? 'text-red-600 font-bold' : 'font-medium'}>⏱ {fmtTime(remaining)} left</span>
            ) : (
              <span>⏱ {fmtTime(elapsed)}</span>
            )}
            <span className="text-gray-400 ml-3">{blanks > 0 ? `${blanks} unanswered` : 'All answered'}</span>
          </div>
          <button
            onClick={() => { if (blanks === 0 || window.confirm(`${blanks} question(s) are blank. Submit anyway?`)) doSubmit() }}
            disabled={submitting}
            className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </section>
  )
}
