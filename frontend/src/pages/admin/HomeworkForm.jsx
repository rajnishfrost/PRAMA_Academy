import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'

const OPERATIONS = [
  { value: 'addition', label: 'Addition (+)' },
  { value: 'subtraction', label: 'Subtraction (−)' },
  { value: 'multiplication', label: 'Multiplication (×)' },
  { value: 'division', label: 'Division (÷)' },
]

function Num({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export default function HomeworkForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [batch, setBatch] = useState('')
  const [batches, setBatches] = useState([])
  const [operations, setOperations] = useState(['addition'])
  const [count, setCount] = useState(20)
  const [rows, setRows] = useState(3)
  const [digits, setDigits] = useState(2)
  const [multiplicandDigits, setMultiplicandDigits] = useState(2)
  const [multiplierDigits, setMultiplierDigits] = useState(1)
  const [dividendDigits, setDividendDigits] = useState(3)
  const [divisorDigits, setDivisorDigits] = useState(1)
  const [timeLimitMin, setTimeLimitMin] = useState(0)
  const [dueDate, setDueDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [regenerate, setRegenerate] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/batches').then((d) => setBatches(d.batches)).catch(() => {})
    if (isEdit) {
      api.get(`/homework/${id}`).then(({ homework: h }) => {
        setTitle(h.title); setInstructions(h.instructions || '')
        setBatch(h.batch?._id || h.batch || '')
        setTimeLimitMin(h.timeLimitMin || 0)
        setDueDate(h.dueDate ? new Date(h.dueDate).toISOString().slice(0, 10) : '')
        setIsActive(h.isActive)
        const c = h.config || {}
        setOperations(c.operations?.length ? c.operations : ['addition'])
        setCount(c.count || 20); setRows(c.rows || 3); setDigits(c.digits || 2)
        setMultiplicandDigits(c.multiplicandDigits || 2); setMultiplierDigits(c.multiplierDigits || 1)
        setDividendDigits(c.dividendDigits || 3); setDivisorDigits(c.divisorDigits || 1)
      }).catch((e) => setError(e.message))
    }
  }, [id, isEdit])

  const toggleOp = (op) => {
    setOperations((prev) => prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op])
  }

  const hasVertical = operations.includes('addition') || operations.includes('subtraction')
  const hasMul = operations.includes('multiplication')
  const hasDiv = operations.includes('division')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!batch) return setError('Please select a batch')
    if (operations.length === 0) return setError('Select at least one operation')
    setLoading(true)
    const config = { operations, count, rows, digits, multiplicandDigits, multiplierDigits, dividendDigits, divisorDigits }
    try {
      if (isEdit) {
        await api.put(`/homework/${id}`, {
          title, instructions, batch, timeLimitMin, dueDate: dueDate || null, isActive,
          regenerate, ...(regenerate ? config : {}),
        })
      } else {
        await api.post('/homework', { title, instructions, batch, timeLimitMin, dueDate: dueDate || null, ...config })
      }
      navigate(isEdit ? `/admin/homework/${id}` : '/admin/homework')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Homework' : 'Create Homework'}</h1>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <form onSubmit={submit} className="space-y-6">
        {/* Basics */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="e.g. Addition Practice — Week 1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (optional)</label>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Shown to students before they start" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select value={batch} onChange={(e) => setBatch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
              <option value="">— Select batch —</option>
              {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time limit (min, 0 = none)</label>
              <input type="number" min={0} value={timeLimitMin} onChange={(e) => setTimeLimitMin(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due date (optional)</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
          </div>
          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-primary w-4 h-4" />
              Visible to students
            </label>
          )}
        </div>

        {/* Question settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Questions</h2>
          {isEdit && (
            <label className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <input type="checkbox" checked={regenerate} onChange={(e) => setRegenerate(e.target.checked)} className="accent-amber-600 w-4 h-4 mt-0.5" />
              <span>Regenerate questions from the settings below. <b>This clears all existing submissions</b> for this homework.</span>
            </label>
          )}

          <fieldset disabled={isEdit && !regenerate} className={isEdit && !regenerate ? 'opacity-50 pointer-events-none space-y-4' : 'space-y-4'}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operations</label>
              <div className="grid grid-cols-2 gap-2">
                {OPERATIONS.map((o) => (
                  <label key={o.value} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer ${operations.includes(o.value) ? 'border-primary bg-primary/5 text-gray-900' : 'border-gray-200 text-gray-600'}`}>
                    <input type="checkbox" checked={operations.includes(o.value)} onChange={() => toggleOp(o.value)} className="accent-primary w-4 h-4" />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Num label="Number of questions" value={count} onChange={setCount} options={[10, 15, 20, 25, 30, 40, 50]} />
              {hasVertical && <Num label="Numbers per problem" value={rows} onChange={setRows} options={[2, 3, 4, 5]} />}
              {hasVertical && <Num label="Digits (add/sub)" value={digits} onChange={setDigits} options={[1, 2, 3, 4]} />}
              {hasMul && <Num label="Multiplicand digits" value={multiplicandDigits} onChange={setMultiplicandDigits} options={[1, 2, 3, 4]} />}
              {hasMul && <Num label="Multiplier digits" value={multiplierDigits} onChange={setMultiplierDigits} options={[1, 2, 3]} />}
              {hasDiv && <Num label="Dividend digits" value={dividendDigits} onChange={setDividendDigits} options={[2, 3, 4]} />}
              {hasDiv && <Num label="Divisor digits" value={divisorDigits} onChange={setDivisorDigits} options={[1, 2]} />}
            </div>
            {operations.length > 1 && (
              <p className="text-xs text-gray-400">Mixed operations: each question randomly uses one of the selected operations.</p>
            )}
          </fieldset>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create & Generate'}
          </button>
          <button type="button" onClick={() => navigate('/admin/homework')} className="border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  )
}
