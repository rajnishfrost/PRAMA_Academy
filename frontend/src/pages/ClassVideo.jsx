import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL

export default function ClassVideo() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/class-video/public`)
      .then((r) => r.json())
      .then((d) => setVideos(d.videos || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const baseUrl = API?.replace('/api', '') || ''

  return (
    <>
      {/* Hero Banner */}
      <section className="relative pt-32 pb-20 bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/images/team.jpg)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Learning Resources</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Class Videos</h1>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
            Watch our latest class recordings and learn at your own pace.
          </p>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : videos.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-lg">No class videos available yet.</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon for new recordings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <div
                  key={video._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-video bg-black">
                    <video
                      src={`${baseUrl}${video.url}`}
                      className="w-full h-full object-contain"
                      controls
                      preload="metadata"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-1">{video.title || video.originalName}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(video.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
