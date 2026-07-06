import { useParams, Link } from 'react-router-dom'
import { useCourse } from '../lib/useCourses'
import { getImageUrl } from '../lib/imageUrl'

export default function CourseDetail() {
  const { slug } = useParams()
  const { course, loading } = useCourse(slug)

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

        {/* Programs / Class Details */}
        {course.programs.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Class Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {course.programs.map((prog, i) => (
                <div key={i} className="bg-primary/5 border border-primary/10 rounded-2xl p-6 md:p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{prog.title}</h3>
                  <ul className="space-y-2 mb-4">
                    {prog.details.map((d, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 mt-0.5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {d}
                      </li>
                    ))}
                  </ul>
                  {prog.note && (
                    <p className="text-xs text-gray-500 bg-white rounded-lg p-3 border border-gray-100">
                      <span className="font-medium text-gray-700">Note: </span>{prog.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Class Details Images */}
        {course.gallery?.length > 0 && (
          <section className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {course.gallery.map((img, i) => (
                <figure key={i} className="rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(img.url)}
                    alt={img.caption || ''}
                    loading="lazy"
                    className="w-full h-48 md:h-56 object-cover"
                  />
                  {img.caption && (
                    <figcaption className="text-xs text-gray-500 mt-1 px-1 pb-1">{img.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Teacher */}
        <section className="bg-gray-900 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <img
              src={getImageUrl(course.teacher.image)}
              alt={course.teacher.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary"
            />
            <div>
              <p className="text-white font-semibold">{course.teacher.name}</p>
              <p className="text-gray-400 text-sm">{course.teacher.hours}</p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
