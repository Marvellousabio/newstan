import { useEffect, useState } from 'react'
import { authenticateSession, fetchAppointments, updateAppointment } from '@/lib/api'

export function useAppointments(userId?: string, mothers = []) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [emergencies, setEmergencies] = useState([])
  const [newBookingsCount, setNewBookingsCount] = useState(0)

  useEffect(() => {
    if (!userId || !mothers.length) return
    let isMounted = true

    async function loadAppointments() {
      try {
        await authenticateSession()
        const data = await fetchAppointments(userId)

        const enriched = data.map(appt => {
          const mother = mothers.find(m => m.id === appt.motherId)
          return {
            ...appt,
            motherName: mother ? mother.name : 'Unknown Mother',
          }
        })

        if (!isMounted) return
        setAppointments(enriched)

        const recent = enriched.filter(a => {
          const created = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt).getTime()
          return created >= Date.now() - 10 * 60 * 1000
        })
        setNewBookingsCount(recent.length)
        setEmergencies(enriched.filter(a => a.urgent === true))
      } catch (err) {
        if (isMounted) setError(err as Error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadAppointments()
    return () => { isMounted = false }
  }, [userId, mothers])

  const acceptAppointment = async (id: string) => {
    await authenticateSession()
    await updateAppointment(id, { status: 'accepted' })
  }

  return { appointments, emergencies, newBookingsCount, loading, error, acceptAppointment }
}
