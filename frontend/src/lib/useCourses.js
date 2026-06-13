import { useEffect, useState } from 'react'
import { api } from './api'
import { courses as staticCourses } from '../data/courses'

export function useCourses() {
  const [courses, setCourses] = useState(staticCourses)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/courses/public')
      .then((d) => {
        if (d.courses.length > 0) setCourses(d.courses)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { courses, loading }
}

export function useCourse(slug) {
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/courses/public/${slug}`)
      .then((d) => setCourse(d.course))
      .catch(() => {
        const fallback = staticCourses.find((c) => c.slug === slug)
        if (fallback) setCourse(fallback)
      })
      .finally(() => setLoading(false))
  }, [slug])

  return { course, loading }
}
