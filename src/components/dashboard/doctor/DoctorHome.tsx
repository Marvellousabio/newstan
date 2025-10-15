import AppointmentList from './AppointmentList'
import SymptomsList from './SymptomsList'
import ChatSection from './ChatSection'
import EmergencyList from './EmergencyList'

import type { FirestoreAppointment, FirestoreEmergency, FirestoreSymptom, FirestoreMessage } from '../../../types/DoctorTypes'
import type { User } from '@/types'

interface DoctorHomeProps {
  appointments: FirestoreAppointment[]
  emergencies: FirestoreEmergency[]
  symptoms: FirestoreSymptom[]
  selectedAppointment: FirestoreAppointment | null
  chatMessages: FirestoreMessage[]
  messageText: string
  setMessageText: (v: string) => void
  onSendMessage: () => void
  onSelectAppointment: (a: FirestoreAppointment) => void
  onAcceptAppointment: (a: FirestoreAppointment) => void
}

export default function DoctorHome({
  appointments,
  emergencies,
  symptoms,
  selectedAppointment,
  chatMessages,
  messageText,
  setMessageText,
  onSendMessage,
  onSelectAppointment,
  onAcceptAppointment,
}: DoctorHomeProps) {
  return (
    <div className='mx-auto w-full'>
      <div className="bg-white rounded-lg shadow p-4  mb-6">
        <h2 className="text-lg font-semibold mb-4">Overview</h2>
        <div className="flex space-x-3 text-sm text-gray-600">
          <div className="px-3 py-2 bg-green-50 rounded">
            <div className="text-xs">Appointments</div>
            <div className="font-semibold">{appointments.length} Today</div>
          </div>
          <div className="px-3 py-2 bg-blue-50 rounded">
            <div className="text-xs">Consultations</div>
            <div className="font-semibold">
              {appointments.filter((a) => a.status === 'consultation').length} Today
            </div>
          </div>
          <div className="px-3 py-2 bg-red-50 rounded">
            <div className="text-xs">Urgent</div>
            <div className="font-semibold">{emergencies.length}</div>
          </div>
          <button onClick={() => onAcceptAppointment(appointments[0])}>Accept</button>
          {/* <IncomingCallModal /> */}

        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <AppointmentList
          appointments={appointments}
          selectedAppointment={selectedAppointment}
          onSelect={onSelectAppointment}
          onAccept={onAcceptAppointment}
          onCall={() => {}}
          onOpenPatient={() => {}}
        />
        <SymptomsList symptoms={symptoms} onOpenPatient={() => {}} />
        <div className="space-y-4">
          <ChatSection
            selectedAppointment={selectedAppointment}
            messages={chatMessages}
            messageText={messageText}
            setMessageText={setMessageText}
            onSend={onSendMessage}
            user={null as unknown as User}
          />
          <EmergencyList emergencies={emergencies} onOpenPatient={() => {}} onCall={() => {}} />
        </div>
      </div>
    </div>
  )
}
