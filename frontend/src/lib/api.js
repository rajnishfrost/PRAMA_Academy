const BASE = import.meta.env.VITE_API_URL

// Build a client bound to a specific localStorage token key so the admin/staff
// session (`token`) and the student session (`student_token`) never mix.
function buildClient(tokenKey) {
  async function request(path, options = {}) {
    const token = localStorage.getItem(tokenKey)
    const headers = { 'Content-Type': 'application/json', ...options.headers }
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(`${BASE}${path}`, { ...options, headers })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Something went wrong')
    return data
  }
  return {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: 'DELETE' }),
  }
}

export const api = buildClient('token')               // admin / staff
export const studentApi = buildClient('student_token') // students
