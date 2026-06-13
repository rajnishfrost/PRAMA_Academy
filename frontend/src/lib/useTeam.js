import { useEffect, useState } from 'react'
import { teamMembers as staticMembers } from '../data/team'

const API = import.meta.env.VITE_API_URL

export function useTeam() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/team/public`)
      .then((r) => r.json())
      .then((d) => setMembers(d.members))
      .catch(() => setMembers(staticMembers))
      .finally(() => setLoading(false))
  }, [])

  return { members, loading }
}
