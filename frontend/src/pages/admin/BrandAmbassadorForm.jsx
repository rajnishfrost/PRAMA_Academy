import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import ImageUpload from '../../components/ImageUpload'
import MediaUpload from '../../components/MediaUpload'

const API = import.meta.env.VITE_API_URL

const empty = {
  section: '',
  title: '',
  items: [],
  isActive: true,
  order: 0,
}

export default function BrandAmbassadorForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bulkUploading, setBulkUploading] = useState(false)
  const bulkRef = useRef()

  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    api.get(`/brand-ambassador/${id}`)
      .then((d) => setForm(d.section))
      .catch(() => navigate('/admin/brand-ambassador'))
      .finally(() => setLoading(false))
  }, [id, isEdit, navigate])

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

  const updateItem = (index, key, val) => {
    setForm((prev) => {
      const items = [...prev.items]
      items[index] = { ...items[index], [key]: val }
      return { ...prev, items }
    })
  }

  const addItem = (type) => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { url: '', type, caption: '', order: prev.items.length + 1 }],
    }))
  }

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  // Bulk upload multiple files at once
  const handleBulkUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setBulkUploading(true)
    const newItems = []

    const skipped = []
    for (const file of files) {
      try {
        const isVideo = /\.(mp4|mov|webm|avi)$/i.test(file.name)
        const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024
        if (file.size > maxSize) {
          skipped.push(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)}MB)`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('module', 'brand-ambassador')

        const token = localStorage.getItem('token')
        const res = await fetch(`${API}/media/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })

        const data = await res.json()
        if (!res.ok) continue

        newItems.push({
          url: data.media.url,
          type: isVideo ? 'video' : 'image',
          caption: '',
          order: form.items.length + newItems.length + 1,
        })
      } catch {
        // skip failed uploads
      }
    }

    if (newItems.length > 0) {
      setForm((prev) => ({ ...prev, items: [...prev.items, ...newItems] }))
    }

    if (skipped.length > 0) {
      alert(`${skipped.length} file(s) skipped (too large):\n${skipped.join('\n')}\n\nImages max: 5MB, Videos max: 100MB`)
    }

    setBulkUploading(false)
    if (bulkRef.current) bulkRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/brand-ambassador/${id}`, form)
      } else {
        await api.post('/brand-ambassador', form)
      }
      navigate('/admin/brand-ambassador')
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>

  const images = form.items.filter((i) => i.type === 'image')
  const videos = form.items.filter((i) => i.type === 'video')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit' : 'Add'} Section</h1>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Basic Info</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Section Key</label>
              <input
                required
                value={form.section}
                onChange={(e) => set('section', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="e.g. achievements, performances"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Display Title</label>
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Our Achievements"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => set('order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* Bulk Upload */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Bulk Upload</h2>
            <p className="text-xs text-gray-500">{form.items.length} items total</p>
          </div>
          <p className="text-sm text-gray-500 mb-3">Select multiple images or videos at once. They will be uploaded and added automatically.</p>
          <input
            ref={bulkRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleBulkUpload}
            className="hidden"
            id="bulk-upload"
          />
          <label
            htmlFor="bulk-upload"
            className="inline-flex cursor-pointer text-sm bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {bulkUploading ? 'Uploading...' : 'Select Files'}
          </label>
        </div>

        {/* Media Items */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Media Items</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addItem('image')}
                className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                + Image
              </button>
              <button
                type="button"
                onClick={() => addItem('video')}
                className="text-xs bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                + Video
              </button>
            </div>
          </div>

          {form.items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No media items yet. Use bulk upload or add individually.</p>
          ) : (
            <div className="space-y-4">
              {form.items.map((item, index) => (
                <div key={index} className="border border-gray-100 rounded-xl p-4 relative">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${item.type === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.type === 'video' ? 'Video' : 'Image'} #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1 min-w-0">
                      {item.type === 'image' ? (
                        <ImageUpload
                          label=""
                          value={item.url}
                          onChange={(v) => updateItem(index, 'url', v)}
                          module="brand-ambassador"
                        />
                      ) : (
                        <MediaUpload
                          label=""
                          value={item.url}
                          onChange={(v) => updateItem(index, 'url', v)}
                          module="brand-ambassador"
                          accept="video/*"
                        />
                      )}
                    </div>
                    <div className="w-full md:w-48 shrink-0">
                      <input
                        value={item.caption}
                        onChange={(e) => updateItem(index, 'caption', e.target.value)}
                        placeholder="Optional caption"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Section' : 'Create Section'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/brand-ambassador')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
