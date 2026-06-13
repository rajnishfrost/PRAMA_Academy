import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCourses } from '../lib/useCourses'
import { getImageUrl } from '../lib/imageUrl'
import { highlights, stats } from '../data/stats'

function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gray-900 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/brokenTeethChild_upscaled.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-transparent" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 py-32 md:py-40">
        <div className="max-w-2xl">
          <p className="text-primary font-semibold text-sm md:text-base tracking-wider uppercase mb-4">
            Welcome to Prama Academy
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Expanding Horizons Through{' '}
            <span className="text-primary">Quality Education</span>
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
            Empowering children aged 4-13 with Abacus, Vedic Math, Handwriting, and Shloka
            through expert online classes.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#courses"
              className="bg-primary hover:bg-primary-dark text-white font-semibold px-7 py-3 rounded-lg transition-colors"
            >
              Explore Courses
            </a>
            <Link
              to="/about"
              className="border-2 border-white/30 hover:border-white text-white font-semibold px-7 py-3 rounded-lg transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Highlights() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-2">Why Choose Us</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Makes Us Different</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((item, i) => (
            <div
              key={i}
              className="group p-8 rounded-2xl bg-gray-50 hover:bg-primary transition-colors duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-white/20 flex items-center justify-center mb-5 transition-colors">
                <svg className="w-7 h-7 text-primary group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-white mb-2 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-white/80 leading-relaxed transition-colors">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Stats() {
  return (
    <section className="py-14 bg-primary">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="text-3xl md:text-4xl font-bold text-white">{s.value}</p>
              <p className="text-white/80 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CoursePreview({ courses }) {
  return (
    <section id="courses" className="py-16 md:py-20 bg-gray-50 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-2">Our Programs</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Explore Our Courses</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course._id || course.id}
              to={`/courses/${course.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={getImageUrl(course.heroImage)}
                  alt={course.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <img src={getImageUrl(course.cover)} alt="" className="w-10 h-10 object-contain" />
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {course.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {course.tagline}
                </p>
                <div className="flex items-center gap-2">
                  <img src={getImageUrl(course.teacher?.image)} alt="" className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-xs text-gray-500">{course.teacher.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function AboutPreview() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img
              src="/images/boyWithAbacus.jpg"
              alt="Child learning abacus"
              className="rounded-2xl shadow-lg w-full object-cover max-h-[480px]"
            />
            <div className="absolute -bottom-4 -right-4 bg-primary text-white rounded-xl px-6 py-4 shadow-lg hidden md:block">
              <p className="text-2xl font-bold">11+</p>
              <p className="text-sm">Years Experience</p>
            </div>
          </div>
          <div>
            <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-2">About Us</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Nurturing Young Minds Since 2018
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Prama Academy was founded with a vision to make quality education accessible to
              children worldwide. We specialize in brain development courses that enhance
              mathematical skills, concentration, and cognitive abilities.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Our expert instructors bring years of experience, providing personalized attention
              with small batch sizes of just 7-10 students per class.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Read More
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const location = useLocation()
  const { courses } = useCourses()

  useEffect(() => {
    if (location.state?.scrollTo === 'courses') {
      setTimeout(() => {
        document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  return (
    <>
      <Hero />
      <Highlights />
      <AboutPreview />
      <Stats />
      <CoursePreview courses={courses} />
    </>
  )
}
