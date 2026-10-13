import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCourse } from '../lib/useCourses'
import { getImageUrl } from '../lib/imageUrl'
import Lightbox from '../components/Lightbox'

export default function ClassDetail() {
  const { slug, idx } = useParams()
  const { course, loading } = useCourse(slug)
  const [lightbox, setLightbox] = useState(null)

  if (loading) {
    return <div className="pt-40 pb-20 text-center text-gray-500">Loading...</div>
  }

  const program = course?.programs?.[Number(idx)]

  if (!course || !program) {
    return (
      <div className="pt-40 pb-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Class not found</h1>
        <Link to={course ? `/courses/${slug}` : '/'} className="text-primary hover:underline">Go back</Link>
      </div>
    )
  }

  const images = program.images || []
  const cover = images[0]?.url || course.heroImage
  const hasGallery = images.length > 0
  const details = (program.details || []).filter(Boolean)

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 pt-28 sm:pt-32 pb-12 sm:pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-5 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/courses/${slug}`} className="hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-none">{course.name}</Link>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-[140px] sm:max-w-none">{program.title}</span>
        </div>

        {/* Image left, text right (stacks on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
          {/* LEFT — image */}
          <div className="md:sticky md:top-24">
            {cover ? (
              <button
                type="button"
                onClick={() => hasGallery && setLightbox({ images, index: 0 })}
                className={`block w-full rounded-2xl overflow-hidden bg-gray-100 ${hasGallery ? 'cursor-zoom-in' : 'cursor-default'}`}
              >
                <img src={getImageUrl(cover)} alt={program.title} className="w-full aspect-[4/3] object-cover" />
              </button>
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl bg-gray-100" />
            )}

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 sm:grid-cols-5 gap-2">
                {images.map((img, k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setLightbox({ images, index: k })}
                    className="rounded-lg overflow-hidden bg-gray-100 aspect-square"
                  >
                    <img src={getImageUrl(img.url)} alt={img.caption || ''} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — text */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{program.title}</h1>

            {program.summary && (
              <p className="mt-4 text-gray-600 leading-relaxed whitespace-pre-line">{program.summary}</p>
            )}

            {details.length > 0 && (
              <ul className="mt-6 space-y-3">
                {details.map((d, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm sm:text-base text-gray-700">
                    <svg className="w-5 h-5 mt-0.5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {d}
                  </li>
                ))}
              </ul>
            )}

            {program.note && (
              <p className="mt-6 text-sm text-gray-500 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="font-medium text-gray-700">Note: </span>{program.note}
              </p>
            )}

            <Link
              to="/contact"
              className="mt-8 block w-full sm:w-auto sm:inline-block text-center bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Enquire Now
            </Link>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-10">
          <Link
            to={`/courses/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to {course.name}
          </Link>
        </div>
      </div>

      <Lightbox state={lightbox} onChange={setLightbox} />
    </>
  )
}
