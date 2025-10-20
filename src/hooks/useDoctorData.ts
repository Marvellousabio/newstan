import { useMothers } from './useMothers'
import { useAppointments } from './useAppointments'
import { useSymptoms } from './useSymptoms'

export function useDoctorData(userId?: string) {
  const { mothers } = useMothers(userId)
  const { appointments, emergencies, newBookingsCount } = useAppointments(userId, mothers)
  const { symptoms } = useSymptoms(userId)

  return { mothers, appointments, emergencies, newBookingsCount, symptoms }
}
