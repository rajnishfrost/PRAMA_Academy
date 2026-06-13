import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL

export function useBrandAmbassador() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/brand-ambassador/public`)
      .then((r) => r.json())
      .then((d) => setSections(d.sections))
      .catch(() => setSections([]))
      .finally(() => setLoading(false))
  }, [])

  return { sections, loading }
}
