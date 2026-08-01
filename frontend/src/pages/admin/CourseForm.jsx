import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import ImageUpload from '../../components/ImageUpload'

const empty = {
  name: '', slug: '', tagline: '', cover: '', heroImage: '',
  intro: [''], history: '',
  benefits: [], levels: [], programs: [], testimonials: [],
  isActive: true, order: 0,
}

const newProgram = () => ({ title: '', details: [''], note: '', images: [] })

export default function CourseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      api.get(`/courses/${id}`).then((d) => setForm({ ...empty, ...d.course })).catch((e) => setError(e.message))
    }
  }, [id, isEdit])

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit) {
        await api.put(`/courses/${id}`, form)
      } else {
        await api.post('/courses', form)
      }
      navigate('/admin/courses')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Array field helpers
  const updateArrayItem = (key, index, value) => {
    const arr = [...form[key]]
    arr[index] = value
    set(key, arr)
  }
  const addArrayItem = (key, template) => set(key, [...(form[key] || []), template])
  const removeArrayItem = (key, index) => set(key, (form[key] || []).filter((_, i) => i !== index))
  const moveArrayItem = (key, index, dir) => {
    const list = form[key] || []
    const target = index + dir
    if (target < 0 || target >= list.length) return
    const arr = [...list]
    ;[arr[index], arr[target]] = [arr[target], arr[index]]
    set(key, arr)
  }

  // Program-nested images helpers
  const updateProgramImages = (pi, newImages) => {
    const arr = [...form.programs]
    arr[pi] = { ...arr[pi], images: newImages }
    set('programs', arr)
  }
  const addProgramImage = (pi) => {
    const current = form.programs[pi].images || []
    updateProgramImages(pi, [...current, { url: '', caption: '' }])
  }
  const updateProgramImage = (pi, ii, patch) => {
    const current = [...(form.programs[pi].images || [])]
    current[ii] = { ...current[ii], ...patch }
    updateProgramImages(pi, current)
  }
  const removeProgramImage = (pi, ii) => {
    const current = (form.programs[pi].images || []).filter((_, i) => i !== ii)
    updateProgramImages(pi, current)
  }
  const moveProgramImage = (pi, ii, dir) => {
    const current = [...(form.programs[pi].images || [])]
    const target = ii + dir
    if (target < 0 || target >= current.length) return
    ;[current[ii], current[target]] = [current[target], current[ii]]
    updateProgramImages(pi, current)
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Course' : 'New Course'}
      </h1>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900 mb-2">Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(v) => set('name', v)} required />
            <Input label="Slug" value={form.slug} onChange={(v) => set('slug', v)} required placeholder="e.g. abacus" />
            <Input label="Tagline" value={form.tagline} onChange={(v) => set('tagline', v)} className="md:col-span-2" />
            <ImageUpload label="Cover Image" value={form.cover} onChange={(v) => set('cover', v)} module="courses" />
            <ImageUpload label="Hero Image" value={form.heroImage} onChange={(v) => set('heroImage', v)} module="courses" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Order" type="number" value={form.order} onChange={(v) => set('order', Number(v))} />
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} id="active" className="accent-primary" />
              <label htmlFor="active" className="text-sm text-gray-700">Active</label>
            </div>
          </div>
        </section>

        {/* Intro paragraphs */}
        <section className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Introduction</h2>
            <button type="button" onClick={() => addArrayItem('intro', '')} className="text-xs text-primary hover:underline">+ Add Paragraph</button>
          </div>
          {form.intro?.map((p, i) => (
            <div key={i} className="flex gap-2">
              <textarea
                value={p}
                onChange={(e) => updateArrayItem('intro', i, e.target.value)}
                rows={2}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              <button type="button" onClick={() => removeArrayItem('intro', i)} className="text-red-400 hover:text-red-600 text-xs px-2">x</button>
            </div>
          ))}
          <Textarea label="History" value={form.history} onChange={(v) => set('history', v)} />
        </section>

        {/* Benefits */}
        <section className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Benefits</h2>
            <button type="button" onClick={() => addArrayItem('benefits', { heading: '', image: '' })} className="text-xs text-primary hover:underline">+ Add</button>
          </div>
          {form.benefits?.map((b, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Input placeholder="Heading" value={b.heading} onChange={(v) => { const arr = [...form.benefits]; arr[i] = { ...arr[i], heading: v }; set('benefits', arr) }} className="flex-1" />
                <button type="button" onClick={() => removeArrayItem('benefits', i)} className="text-red-400 hover:text-red-600 text-xs px-2 ml-2">x</button>
              </div>
              <ImageUpload label="" value={b.image} onChange={(v) => { const arr = [...form.benefits]; arr[i] = { ...arr[i], image: v }; set('benefits', arr) }} module="courses" />
            </div>
          ))}
        </section>

        {/* Levels */}
        <section className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Levels</h2>
            <button type="button" onClick={() => addArrayItem('levels', { title: '', desc: '' })} className="text-xs text-primary hover:underline">+ Add</button>
          </div>
          {form.levels?.map((lvl, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Input placeholder="Title" value={lvl.title} onChange={(v) => { const arr = [...form.levels]; arr[i] = { ...arr[i], title: v }; set('levels', arr) }} className="w-1/3" />
              <textarea
                placeholder="Description"
                value={lvl.desc}
                onChange={(e) => { const arr = [...form.levels]; arr[i] = { ...arr[i], desc: e.target.value }; set('levels', arr) }}
                rows={2}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              <button type="button" onClick={() => removeArrayItem('levels', i)} className="text-red-400 hover:text-red-600 text-xs px-2 pt-2">x</button>
            </div>
          ))}
        </section>

        {/* Programs (with nested Class Detail Images) */}
        <section className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Programs / Class Details</h2>
            <button type="button" onClick={() => addArrayItem('programs', newProgram())} className="text-xs text-primary hover:underline">+ Add Program</button>
          </div>
          {form.programs?.map((prog, pi) => (
            <div key={pi} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Input placeholder="Program Title" value={prog.title} onChange={(v) => { const arr = [...form.programs]; arr[pi] = { ...arr[pi], title: v }; set('programs', arr) }} className="flex-1" />
                <button type="button" onClick={() => removeArrayItem('programs', pi)} className="text-red-400 hover:text-red-600 text-xs px-2 ml-2">Remove</button>
              </div>
              {prog.details?.map((d, di) => (
                <div key={di} className="flex gap-2 pl-4">
                  <input
                    value={d}
                    onChange={(e) => {
                      const arr = [...form.programs]
                      const details = [...arr[pi].details]
                      details[di] = e.target.value
                      arr[pi] = { ...arr[pi], details }
                      set('programs', arr)
                    }}
                    placeholder="Detail point"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                  <button type="button" onClick={() => {
                    const arr = [...form.programs]
                    arr[pi] = { ...arr[pi], details: arr[pi].details.filter((_, i) => i !== di) }
                    set('programs', arr)
                  }} className="text-red-400 text-xs">x</button>
                </div>
              ))}
              <button type="button" onClick={() => {
                const arr = [...form.programs]
                arr[pi] = { ...arr[pi], details: [...arr[pi].details, ''] }
                set('programs', arr)
              }} className="text-xs text-primary hover:underline pl-4">+ Add Detail</button>
              <Input placeholder="Note" value={prog.note} onChange={(v) => { const arr = [...form.programs]; arr[pi] = { ...arr[pi], note: v }; set('programs', arr) }} />

              {/* Nested Class Detail Images */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Class Detail Images</h3>
                    <p className="text-xs text-gray-500">Images shown under this program on the course page. Use ↑ ↓ to order.</p>
                  </div>
                  <button type="button" onClick={() => addProgramImage(pi)} className="text-xs text-primary hover:underline">+ Add Image</button>
                </div>
                {(prog.images || []).length === 0 && <p className="text-xs text-gray-400">No images yet.</p>}
                {(prog.images || []).map((img, ii) => (
                  <div key={ii} className="border border-gray-200 bg-white rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Image #{ii + 1}</span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => moveProgramImage(pi, ii, -1)} disabled={ii === 0} className="text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-sm px-1" aria-label="Move up">↑</button>
                        <button type="button" onClick={() => moveProgramImage(pi, ii, 1)} disabled={ii === (prog.images.length - 1)} className="text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-sm px-1" aria-label="Move down">↓</button>
                        <button type="button" onClick={() => removeProgramImage(pi, ii)} className="text-red-400 hover:text-red-600 text-xs px-2 ml-1">x</button>
                      </div>
                    </div>
                    <ImageUpload label="" value={img.url} onChange={(v) => updateProgramImage(pi, ii, { url: v })} module="courses" />
                    <Input placeholder="Caption (optional)" value={img.caption} onChange={(v) => updateProgramImage(pi, ii, { caption: v })} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Testimonials */}
        <section className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Testimonials</h2>
              <p className="text-xs text-gray-500">Student / parent quotes shown on the course page.</p>
            </div>
            <button type="button" onClick={() => addArrayItem('testimonials', { quote: '', author: '', role: '' })} className="text-xs text-primary hover:underline">+ Add Testimonial</button>
          </div>
          {form.testimonials?.length === 0 && <p className="text-sm text-gray-400">No testimonials yet.</p>}
          {form.testimonials?.map((t, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Testimonial #{i + 1}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveArrayItem('testimonials', i, -1)} disabled={i === 0} className="text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-sm px-1" aria-label="Move up">↑</button>
                  <button type="button" onClick={() => moveArrayItem('testimonials', i, 1)} disabled={i === form.testimonials.length - 1} className="text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-sm px-1" aria-label="Move down">↓</button>
                  <button type="button" onClick={() => removeArrayItem('testimonials', i)} className="text-red-400 hover:text-red-600 text-xs px-2 ml-1">x</button>
                </div>
              </div>
              <textarea
                placeholder="Quote"
                value={t.quote}
                onChange={(e) => { const arr = [...form.testimonials]; arr[i] = { ...arr[i], quote: e.target.value }; set('testimonials', arr) }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input placeholder="Author name" value={t.author} onChange={(v) => { const arr = [...form.testimonials]; arr[i] = { ...arr[i], author: v }; set('testimonials', arr) }} />
                <Input placeholder="Role (e.g. Parent, Student Age 8)" value={t.role} onChange={(v) => { const arr = [...form.testimonials]; arr[i] = { ...arr[i], role: v }; set('testimonials', arr) }} />
              </div>
            </div>
          ))}
        </section>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/courses')}
            className="border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function Input({ label, value, onChange, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        {...props}
      />
    </div>
  )
}

function Textarea({ label, value, onChange, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        {...props}
      />
    </div>
  )
}
