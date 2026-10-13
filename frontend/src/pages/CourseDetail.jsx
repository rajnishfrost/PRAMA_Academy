import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCourse } from '../lib/useCourses'
import { getImageUrl } from '../lib/imageUrl'
import Lightbox from '../components/Lightbox'

export default function CourseDetail() {
  const { slug } = useParams()
  const { course, loading } = useCourse(slug)
  const [lightbox, setLightbox] = useState(null)
  const [selectedProgram, setSelectedProgram] = useState(null)

  if (loading) {
    return <div className="pt-40 pb-20 text-center text-gray-500">Loading...</div>
  }

  if (!course) {
    return (
      <div className="pt-40 pb-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Not Found</h1>
        <Link to="/" className="text-primary hover:underline">Go back home</Link>
      </div>
    )
  }

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${getImageUrl(course.heroImage)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-gray-900/40" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-primary">{course.name}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{course.name}</h1>
          <p className="text-gray-300 text-lg max-w-2xl">{course.tagline}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* Intro */}
        <section className="max-w-4xl mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Course</h2>
          {course.intro.map((para, i) => (
            <p key={i} className="text-gray-600 leading-relaxed mb-4">{para}</p>
          ))}
        </section>

        {/* History */}
        {course.history && (
          <section className="max-w-4xl mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">History</h2>
            <p className="text-gray-600 leading-relaxed">{course.history}</p>
          </section>
        )}

        {/* Benefits */}
        {course.benefits.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Benefits</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {course.benefits.map((b, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-5 text-center hover:shadow-md transition-shadow">
                  <img src={getImageUrl(b.image)} alt={b.heading} className="w-14 h-14 mx-auto mb-3 object-contain" />
                  <p className="text-sm font-medium text-gray-800">{b.heading}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Levels */}
        {course.levels.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Course Levels</h2>
            <div className="space-y-4">
              {course.levels.map((lvl, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{lvl.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{lvl.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Class Details — cards that open full detail on tap */}
        {course.programs.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Class Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {course.programs.map((prog, i) => {
                const preview = prog.summary || prog.details?.find(Boolean) || ''
                const thumb = prog.images?.[0]?.url
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedProgram(prog)}
                    className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all overflow-hidden flex flex-col focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {thumb && (
                      <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                        <img src={getImageUrl(thumb)} alt={prog.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform" />
                      </div>
                    )}
                    <div className="p-4 sm:p-5 flex flex-col flex-1">
                      <h3 className="text-base font-bold text-gray-900 leading-snug">{prog.title}</h3>
                      {preview && <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1">{preview}</p>}
                      <span className="mt-3 text-sm font-medium text-primary group-hover:underline">View details →</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {course.testimonials?.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">What Students & Parents Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {course.testimonials.map((t, i) => (
                <figure key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-[340px] overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/30 shrink-0" />
                  <div className="flex flex-col flex-1 p-6 md:p-7 overflow-hidden">
                    <svg className="w-10 h-10 text-primary mb-2 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.17 6C4.87 6 3 7.87 3 10.17V18h6v-7.83c0-1.19-.98-2.17-2.17-2.17H6.5V6h.67zm10 0c-2.3 0-4.17 1.87-4.17 4.17V18h6v-7.83c0-1.19-.98-2.17-2.17-2.17h-.33V6h.67z" />
                    </svg>
                    <blockquote className="text-gray-700 leading-relaxed flex-1 overflow-y-auto pr-2 italic text-[15px] scroll-thin">
                      {t.quote}
                    </blockquote>
                    {(t.author || t.role) && (
                      <figcaption className="text-sm mt-4 pt-3 border-t border-gray-100 shrink-0">
                        {t.author && <span className="font-semibold text-gray-900">{t.author}</span>}
                        {t.author && t.role && <span className="mx-2 text-gray-400">·</span>}
                        {t.role && <span className="text-gray-500">{t.role}</span>}
                      </figcaption>
                    )}
                  </div>
                </figure>
              ))}
            </div>
          </section>
        )}
      </div>

      <Lightbox state={lightbox} onChange={setLightbox} />

      {/* Class full detail — full-screen sheet on mobile, centered modal on desktop */}
      {selectedProgram && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedProgram(null)}
        >
          <div
            className="bg-white w-full md:max-w-2xl rounded-t-3xl md:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white/90 backdrop-blur px-4 py-3 border-b border-gray-100">
              <span className="md:hidden absolute left-1/2 -translate-x-1/2 top-1.5 w-10 h-1 rounded-full bg-gray-300" />
              <h3 className="font-semibold text-gray-900 text-sm truncate pr-3">{selectedProgram.title}</h3>
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                aria-label="Close"
                className="shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Cover (first image) */}
            {selectedProgram.images?.[0]?.url && (
              <img src={getImageUrl(selectedProgram.images[0].url)} alt={selectedProgram.title} className="w-full aspect-[16/10] object-cover" />
            )}

            <div className="p-5 md:p-7">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">{selectedProgram.title}</h2>

              {selectedProgram.summary && (
                <p className="mt-3 text-gray-600 leading-relaxed whitespace-pre-line">{selectedProgram.summary}</p>
              )}

              {selectedProgram.details?.filter(Boolean).length > 0 && (
                <ul className="mt-5 space-y-2.5">
                  {selectedProgram.details.filter(Boolean).map((d, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm md:text-base text-gray-700">
                      <svg className="w-5 h-5 mt-0.5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {d}
                    </li>
                  ))}
                </ul>
              )}

              {selectedProgram.note && (
                <p className="mt-5 text-sm text-gray-500 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <span className="font-medium text-gray-700">Note: </span>{selectedProgram.note}
                </p>
              )}

              {selectedProgram.images?.length > 0 && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedProgram.images.map((img, k) => (
                    <figure
                      key={k}
                      className="rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                      onClick={() => setLightbox({ images: selectedProgram.images, index: k })}
                    >
                      <img src={getImageUrl(img.url)} alt={img.caption || ''} loading="lazy" className="w-full aspect-square object-cover hover:scale-[1.03] transition-transform" />
                    </figure>
                  ))}
                </div>
              )}

              <Link
                to="/contact"
                onClick={() => setSelectedProgram(null)}
                className="mt-7 block w-full text-center bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Enquire Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
