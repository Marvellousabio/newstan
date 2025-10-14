'use client'

import React from 'react'
import type { FirestoreAppointment } from '../../../types/DoctorTypes'

interface ChatListProps {
  appointments: FirestoreAppointment[]
  selectedAppointmentId: string | null
  onSelectAppointment: (appt: FirestoreAppointment) => void
}

export default function ChatList({ appointments, selectedAppointmentId, onSelectAppointment }: ChatListProps) {
  // Filter appointments with chat messages (if available)
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Chats</h2>
      {appointments.length === 0 && <div className="text-gray-500">No chat history.</div>}
      <ul>
        {appointments.map((appt) => {
          const patient = appt.patient || { name: 'Unknown' }
          const isSelected = selectedAppointmentId === appt.id
          return (
            <li
              key={appt.id}
              className={`p-3 rounded cursor-pointer mb-2 border ${
                isSelected ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectAppointment(appt)}
            >
              <div className="font-medium">{patient.name}</div>
              <div className="text-sm text-gray-500">Appointment: {appt.scheduledAt?.toDate().toLocaleString()}</div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
