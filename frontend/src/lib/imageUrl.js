const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || ''

export function getImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('/uploads')) return `${API_BASE}${path}`
  return path
}
