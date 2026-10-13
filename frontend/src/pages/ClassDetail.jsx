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

  const cover = program.images?.[0]?.url || course.heroImage
  const details = (program.details || []).filter(Boolean)

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-10 sm:pb-14 bg-gray-900">
        {cover && (
          <>
            <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${getImageUrl(cover)})` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/85 to-gray-900/40" />
          </>
        )}
        <div className="relative max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 mb-3 flex-wrap">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to={`/courses/${slug}`} className="hover:text-primary transition-colors truncate max-w-[140px] sm:max-w-none">{course.name}</Link>
            <span>/</span>
            <span className="text-primary">Class</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white">{program.title}</h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Link
          to={`/courses/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to {course.name}
        </Link>

        {program.summary && (
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed whitespace-pre-line mb-6">{program.summary}</p>
        )}

        {details.length > 0 && (
          <ul className="space-y-3 mb-6">
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
          <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
            <span className="font-medium text-gray-700">Note: </span>{program.note}
          </p>
        )}

        {program.images?.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {program.images.map((img, k) => (
              <figure
                key={k}
                className="rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => setLightbox({ images: program.images, index: k })}
              >
                <img
                  src={getImageUrl(img.url)}
                  alt={img.caption || ''}
                  loading="lazy"
                  className="w-full aspect-square object-cover hover:scale-[1.03] transition-transform"
                />
              </figure>
            ))}
          </div>
        )}

        <Link
          to="/contact"
          className="block w-full sm:w-auto sm:inline-block text-center bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Enquire Now
        </Link>
      </div>

      <Lightbox state={lightbox} onChange={setLightbox} />
    </>
  )
}
