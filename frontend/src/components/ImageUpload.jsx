import { useState, useRef, useId } from 'react'
import ImageCropper from './ImageCropper'

const API = import.meta.env.VITE_API_URL

export default function ImageUpload({ value, onChange, module = 'general', label = 'Image' }) {
  const [uploading, setUploading] = useState(false)
  const [cropSrc, setCropSrc] = useState(null)
  const [originalFile, setOriginalFile] = useState(null)
  const fileRef = useRef()
  const inputId = useId() // unique per instance so multiple uploaders don't collide

  // When file is selected, check size then open cropper
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB. Please resize or reduce quality before uploading.')
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    setOriginalFile(file)
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result)
    reader.readAsDataURL(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  // Upload the cropped blob
  const uploadBlob = async (blob) => {
    setUploading(true)
    setCropSrc(null)
    try {
      const ext = originalFile?.name?.split('.').pop() || 'jpg'
      const filename = `cropped-${Date.now()}.${ext}`
      const file = new File([blob], filename, { type: blob.type || 'image/jpeg' })

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
      setOriginalFile(null)
    }
  }

  const handleCropCancel = () => {
    setCropSrc(null)
    setOriginalFile(null)
  }

  // Build full URL for preview
  const previewUrl = value
    ? value.startsWith('http')
      ? value
      : value.startsWith('/uploads')
        ? `${API.replace(/\/api\/?$/, '')}${value}`
        : value
    : null

  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}

      <div className="flex items-start gap-3">
        {/* Preview */}
        {previewUrl && (
          <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
            <img
              src={previewUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '<span class="text-xs text-gray-400 text-center px-1">No image</span>'
              }}
            />
          </div>
        )}

        <div className="flex-1 space-y-2">
          {/* URL input (manual) */}
          <input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL or upload below"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />

          {/* Upload button */}
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id={inputId}
            />
            <label
              htmlFor={inputId}
              className="cursor-pointer text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
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

      {/* Crop modal */}
      {cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          onCropDone={uploadBlob}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}
