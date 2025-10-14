'use client'

import React from 'react'
import type { FirestoreAppointment } from '../../../types/DoctorTypes'

interface VideoAppointmentsProps {
  appointments: FirestoreAppointment[]
  onStartVideo: (appt: FirestoreAppointment) => void
}

export default function VideoAppointments({ appointments, onStartVideo }: VideoAppointmentsProps) {
  const videoAppointments = appointments.filter((a) => a.type === 'video') // assuming type field
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Video Appointments</h2>
      {videoAppointments.length === 0 && <div className="text-gray-500">No video appointments.</div>}
      <ul>
        {videoAppointments.map((appt) => {
          const patient = appt.patient || { name: 'Unknown' }
          return (
            <li
              key={appt.id}
              className="p-3 rounded cursor-pointer mb-2 border hover:bg-gray-50"
              onClick={() => onStartVideo(appt)}
            >
              <div className="font-medium">{patient.name}</div>
              <div className="text-sm text-gray-500">Scheduled: {appt.scheduledAt?.toDate().toLocaleString()}</div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
