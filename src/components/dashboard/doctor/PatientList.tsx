'use client'

import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import PatientsClient from '../PatientsClient'
import { db } from '@/lib/firebase'
import type { User } from '@/types'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  lastVisit?: string
}

interface PatientListProps {
  doctorId: string
}

export default function PatientList({ doctorId }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([])

  useEffect(() => {
    if (!doctorId) return

    const q = query(
      collection(db, 'users'),
      where('assignedDoctorId', '==', doctorId)
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const list: Patient[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }))
      setPatients(list)
    })

    return () => unsub()
  }, [doctorId])

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">My Patients</h2>
    <PatientsClient/>
      {patients.length === 0 ? (
        <p>No patients assigned yet.</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Phone</th>
              <th className="border px-4 py-2 text-left">Last Visit</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{p.name}</td>
                <td className="border px-4 py-2">{p.email}</td>
                <td className="border px-4 py-2">{p.phone}</td>
                <td className="border px-4 py-2">{p.lastVisit || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
