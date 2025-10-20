import { useEffect, useState } from 'react'
import { authenticateSession, fetchSymptoms } from '@/lib/api'

export function useSymptoms(userId?: string) {
  const [symptoms, setSymptoms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return
    let isMounted = true

    async function loadSymptoms() {
      try {
        await authenticateSession()
        const data = await fetchSymptoms(userId)
        if (isMounted) setSymptoms(data)
      } catch (err) {
        if (isMounted) setError(err as Error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadSymptoms()
    return () => { isMounted = false }
  }, [userId])

  return { symptoms, loading, error }
}
