import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'

export default function StudentForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [batch, setBatch] = useState('')
  const [accountType, setAccountType] = useState('batch')
  const [isActive, setIsActive] = useState(true)
  const [batches, setBatches] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/batches').then((d) => setBatches(d.batches)).catch(() => {})
    if (isEdit) {
      api.get(`/admin/students/${id}`).then((d) => {
        const s = d.student
        setName(s.name); setEmail(s.email)
        setBatch(s.batch?._id || s.batch || '')
        setAccountType(s.accountType)
        setIsActive(s.isActive)
      }).catch((e) => setError(e.message))
    }
  }, [id, isEdit])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (accountType === 'batch' && !batch) return setError('Please select a batch for an enrolled student')
    setLoading(true)
    try {
      if (isEdit) {
        const body = { name, email, accountType, isActive, batch: accountType === 'batch' ? batch : null }
        if (password) body.password = password
        await api.put(`/admin/students/${id}`, body)
      } else {
        await api.post('/admin/students', { name, email, password, batch })
      }
      navigate('/admin/students')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{isEdit ? 'Edit Student' : 'Add Enrolled Student'}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {isEdit ? 'Update details, batch, or reset the password.' : 'Creates an enrolled (batch) account. Share these credentials with the student.'}
      </p>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <form onSubmit={submit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isEdit ? 'Reset Password (leave blank to keep)' : 'Password'}
          </label>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required={!isEdit}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            placeholder={isEdit ? 'New password (optional)' : 'At least 6 characters'} />
        </div>

        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select value={accountType} onChange={(e) => setAccountType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
              <option value="batch">Enrolled (full access + homework)</option>
              <option value="signup">Free (abacus only)</option>
            </select>
          </div>
        )}

        {accountType === 'batch' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select value={batch} onChange={(e) => setBatch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
              <option value="">— Select batch —</option>
              {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
            {batches.length === 0 && <p className="text-xs text-amber-600 mt-1">No batches yet — create a batch first.</p>}
          </div>
        )}

        {isEdit && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-primary w-4 h-4" />
            Active
          </label>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : isEdit ? 'Update Student' : 'Create Student'}
          </button>
          <button type="button" onClick={() => navigate('/admin/students')} className="border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  )
}
