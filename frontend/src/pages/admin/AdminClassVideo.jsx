import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../lib/AuthContext'
import { getImageUrl } from '../../lib/imageUrl'

const API = import.meta.env.VITE_API_URL

export default function AdminClassVideo() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [progress, setProgress] = useState(0)
  const fileRef = useRef()
  const { hasPermission } = useAuth()

  const canWrite = hasPermission('class-video', 'write')
  const canDelete = hasPermission('class-video', 'delete')

  const fetchVideos = () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    fetch(`${API}/class-video`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setVideos(d.videos || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchVideos() }, [])

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return alert('Please select a video file')
    if (file.size > 100 * 1024 * 1024) return alert('Video size exceeds 100MB limit')

    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append('video', file)
    formData.append('title', title || file.name)

    const token = localStorage.getItem('token')
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
    })

    xhr.addEventListener('load', () => {
      setUploading(false)
      setProgress(0)
      setTitle('')
      if (fileRef.current) fileRef.current.value = ''
      if (xhr.status >= 200 && xhr.status < 300) {
        fetchVideos()
      } else {
        try {
          const data = JSON.parse(xhr.responseText)
          alert(data.message || 'Upload failed')
        } catch {
          alert('Upload failed')
        }
      }
    })

    xhr.addEventListener('error', () => {
      setUploading(false)
      setProgress(0)
      alert('Upload failed')
    })

    xhr.open('POST', `${API}/class-video`)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.send(formData)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/class-video/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      fetchVideos()
    } catch (err) {
      alert(err.message)
    }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const baseUrl = API?.replace('/api', '') || ''

  if (loading && videos.length === 0) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Class Videos</h1>
        <span className="text-sm text-gray-500">{videos.length} / 6 videos</span>
      </div>

      {/* Upload Section */}
      {canWrite && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Upload New Video</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title (optional)</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Abacus Class - Level 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Video File (max 100MB)</label>
              <input
                ref={fileRef}
                type="file"
                accept="video/mp4,video/mov,video/webm,video/avi"
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
              />
            </div>
            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {uploading ? `Uploading... ${progress}%` : 'Upload Video'}
            </button>
            {videos.length >= 6 && (
              <p className="text-xs text-amber-600">
                Maximum 6 videos reached. Uploading a new video will automatically delete the oldest one.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Videos List */}
      {videos.length === 0 ? (
        <p className="text-gray-500">No class videos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => (
            <div key={v._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="aspect-video bg-black">
                <video
                  src={`${baseUrl}${v.url}`}
                  className="w-full h-full object-contain"
                  controls
                  preload="metadata"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 text-sm truncate mb-1">{v.title || v.originalName}</h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatSize(v.size)}</span>
                  <span>{formatDate(v.createdAt)}</span>
                </div>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(v._id)}
                    className="mt-3 text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
