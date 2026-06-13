import { useState } from 'react'
import { useBrandAmbassador } from '../lib/useBrandAmbassador'
import { getImageUrl } from '../lib/imageUrl'

export default function BrandAmbassador() {
  const { sections, loading } = useBrandAmbassador()
  const [lightbox, setLightbox] = useState(null)

  const openLightbox = (images, index) => setLightbox({ images, index })
  const closeLightbox = () => setLightbox(null)

  const navLightbox = (dir) => {
    if (!lightbox) return
    const next = lightbox.index + dir
    if (next >= 0 && next < lightbox.images.length) {
      setLightbox({ ...lightbox, index: next })
    }
  }

  return (
    <>
      <section className="relative pt-32 pb-20 bg-gray-900">
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Achievements</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Brand Ambassador</h1>
        </div>
      </section>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading...</div>
      ) : (
        sections.map((section) => {
          const images = section.items.filter((i) => i.type === 'image')
          const videos = section.items.filter((i) => i.type === 'video')

          return (
            <div key={section._id}>
              {/* Images */}
              {images.length > 0 && (
                <section className="py-16 md:py-20">
                  <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{section.title}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((item, i) => (
                        <div
                          key={i}
                          className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group"
                          onClick={() => openLightbox(images, i)}
                        >
                          <div className="relative">
                            <img
                              src={getImageUrl(item.url)}
                              alt={item.caption || `${section.title} ${i + 1}`}
                              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                          {item.caption && (
                            <p className="text-xs text-gray-500 p-2 text-center">{item.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Videos */}
              {videos.length > 0 && (
                <section className="py-16 bg-gray-50">
                  <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                      {images.length > 0 ? 'Student Performances' : section.title}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {videos.map((item, i) => (
                        <div key={i} className="rounded-xl overflow-hidden shadow-sm bg-white">
                          <video
                            controls
                            preload="metadata"
                            className="w-full aspect-video object-contain bg-black"
                          >
                            <source src={getImageUrl(item.url)} type="video/mp4" />
                            Your browser does not support video playback.
                          </video>
                          {item.caption && (
                            <p className="text-sm text-gray-600 p-3">{item.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </div>
          )
        })
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
            onClick={closeLightbox}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {lightbox.index > 0 && (
            <button
              className="absolute left-4 text-white/70 hover:text-white z-10"
              onClick={(e) => { e.stopPropagation(); navLightbox(-1) }}
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <img
            src={getImageUrl(lightbox.images[lightbox.index].url)}
            alt=""
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {lightbox.index < lightbox.images.length - 1 && (
            <button
              className="absolute right-4 text-white/70 hover:text-white z-10"
              onClick={(e) => { e.stopPropagation(); navLightbox(1) }}
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightbox.index + 1} / {lightbox.images.length}
          </div>

          {lightbox.images[lightbox.index].caption && (
            <div className="absolute bottom-10 text-white text-sm bg-black/50 px-4 py-2 rounded-lg">
              {lightbox.images[lightbox.index].caption}
            </div>
          )}
        </div>
      )}
    </>
  )
}
