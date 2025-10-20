import { useEffect, useState } from 'react'
import { authenticateSession, fetchMothers } from '@/lib/api'

export function useMothers(userId?: string) {
  const [mothers, setMothers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return
    let isMounted = true

    async function loadMothers() {
      try {
        await authenticateSession()
        const data = await fetchMothers()
        if (isMounted) setMothers(data)
      } catch (err) {
        if (isMounted) setError(err as Error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadMothers()
    return () => { isMounted = false }
  }, [userId])

  return { mothers, loading, error }
}
