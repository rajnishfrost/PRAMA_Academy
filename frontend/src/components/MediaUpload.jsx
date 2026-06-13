import { useState, useRef } from 'react'

const API = import.meta.env.VITE_API_URL

export default function MediaUpload({ value, onChange, module = 'general', accept = 'image/*,video/*', label = 'Media' }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isVideo = /\.(mp4|mov|webm|avi)$/i.test(file.name)
    const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert(isVideo
        ? `Video size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 100MB limit.`
        : `Image size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 5MB limit. Please resize or reduce quality.`)
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('module', module)

      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      onChange(data.media.url)
    } catch (err) {
      alert(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const previewUrl = value
    ? value.startsWith('http')
      ? value
      : value.startsWith('/uploads')
        ? `${API.replace('/api', '')}${value}`
        : value
    : null

  const isVideo = value && /\.(mp4|mov|webm|avi)$/i.test(value)

  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}

      <div className="flex items-start gap-3">
        {previewUrl && (
          <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-black flex items-center justify-center relative">
            {isVideo ? (
              <>
                <video src={previewUrl} preload="metadata" muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5.14v14l11-7-11-7z" />
                  </svg>
                </div>
              </>
            ) : (
              <img
                src={previewUrl}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = '<span class="text-xs text-gray-400 text-center px-1">No preview</span>'
                }}
              />
            )}
          </div>
        )}

        <div className="flex-1 space-y-2">
          <input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL or upload below"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />

          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept={accept}
              onChange={handleUpload}
              className="hidden"
              id={`media-upload-${label}`}
            />
            <label
              htmlFor={`media-upload-${label}`}
              className="cursor-pointer text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </label>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
