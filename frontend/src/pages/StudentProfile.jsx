import { useState, useRef, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { useStudentAuth } from '../lib/StudentAuthContext'
import { studentApi } from '../lib/api'
import { getImageUrl } from '../lib/imageUrl'
import getCroppedBlob from '../lib/cropImage'

export default function StudentProfile() {
  const { student, setStudent, refresh } = useStudentAuth()
  const fileRef = useRef()

  const [name, setName] = useState(student?.name || '')
  const [savingName, setSavingName] = useState(false)
  const [nameMsg, setNameMsg] = useState('')
  const [uploading, setUploading] = useState(false)

  // Photo cropper
  const [cropSrc, setCropSrc] = useState(null) // object URL of the picked file
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const onCropComplete = useCallback((_, areaPixels) => setCroppedAreaPixels(areaPixels), [])

  const [curPass, setCurPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [passErr, setPassErr] = useState('')
  const [savingPass, setSavingPass] = useState(false)

  if (!student) return null

  const API = import.meta.env.VITE_API_URL

  const saveName = async (e) => {
    e.preventDefault()
    setNameMsg('')
    setSavingName(true)
    try {
      const data = await studentApi.put('/student-auth/profile', { name })
      setStudent(data.student)
      setNameMsg('Profile updated')
    } catch (err) {
      setNameMsg(err.message)
    } finally {
      setSavingName(false)
    }
  }

  const onFileSelected = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please choose an image file.'); return }
    if (file.size > 15 * 1024 * 1024) { alert('Image is too large (max 15MB).'); return }
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setCropSrc(URL.createObjectURL(file))
    if (fileRef.current) fileRef.current.value = ''
  }

  const closeCropper = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  const uploadCropped = async () => {
    if (!croppedAreaPixels) return
    setUploading(true)
    try {
      const blob = await getCroppedBlob(cropSrc, croppedAreaPixels, 400)
      const fd = new FormData()
      fd.append('file', blob, 'avatar.jpg')
      const token = localStorage.getItem('student_token')
      const res = await fetch(`${API}/student-auth/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      await refresh()
      closeCropper()
    } catch (err) {
      alert(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setPassErr('')
    setPassMsg('')
    if (newPass.length < 6) return setPassErr('New password must be at least 6 characters')
    if (newPass !== confirmPass) return setPassErr('Passwords do not match')
    setSavingPass(true)
    try {
      await studentApi.put('/student-auth/password', { currentPassword: curPass, newPassword: newPass })
      setPassMsg('Password changed successfully')
      setCurPass(''); setNewPass(''); setConfirmPass('')
    } catch (err) {
      setPassErr(err.message)
    } finally {
      setSavingPass(false)
    }
  }

  const initial = student.name?.charAt(0)?.toUpperCase() || '?'

  return (
    <section className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        {/* Identity card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              {student.photo ? (
                <img src={getImageUrl(student.photo)} alt="" className="w-20 h-20 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/15 text-primary flex items-center justify-center text-2xl font-bold">{initial}</div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Change photo"
                title="Change photo"
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-md ring-2 ring-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </button>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{student.name}</p>
              <p className="text-sm text-gray-500 truncate">{student.email}</p>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${student.accountType === 'batch' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {student.accountType === 'batch' ? 'Enrolled Student' : 'Free Account'}
                </span>
                {student.batch?.name && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{student.batch.name}</span>
                )}
              </div>
            </div>
          </div>

          <input ref={fileRef} type="file" accept="image/*" onChange={onFileSelected} className="hidden" />
        </div>

        {/* Edit name */}
        <form onSubmit={saveName} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Details</h2>
          {nameMsg && <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{nameMsg}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={student.email} disabled
              className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg text-sm outline-none" />
          </div>
          <button type="submit" disabled={savingName}
            className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {savingName ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Change password */}
        <form onSubmit={changePassword} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Change Password</h2>
          {passErr && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{passErr}</div>}
          {passMsg && <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{passMsg}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" value={curPass} onChange={(e) => setCurPass(e.target.value)} required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <button type="submit" disabled={savingPass}
            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {savingPass ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        {/* Photo crop modal */}
        {cropSrc && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Adjust your photo</h3>
                <p className="text-xs text-gray-500 mt-0.5">Drag to reposition · use the slider to zoom</p>
              </div>

              <div className="relative w-full h-72 bg-gray-900">
                <Cropper
                  image={cropSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="rect"
                  showGrid={false}
                  minZoom={1}
                  maxZoom={3}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="px-5 py-4 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs font-bold">−</span>
                  <input
                    type="range" min={1} max={3} step={0.01} value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 accent-primary cursor-pointer" aria-label="Zoom"
                  />
                  <span className="text-gray-400 text-sm font-bold">+</span>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={closeCropper} disabled={uploading}
                    className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="button" onClick={uploadCropped} disabled={uploading || !croppedAreaPixels}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
                    {uploading ? 'Saving...' : 'Save Photo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
