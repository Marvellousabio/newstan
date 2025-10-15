'use client'

import React, { useEffect, useState } from 'react'
import { fetchPatients, authenticateSession, Patient } from '@/lib/api'

interface PatientListProps {
  doctorId: string
}

export default function PatientList({ doctorId }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([])

  useEffect(() => {
    if (!doctorId) return

    const loadPatients = async () => {
      try {
        await authenticateSession()
        const patientsData = await fetchPatients()
        setPatients(patientsData)
      } catch (error) {
        console.error('Failed to load patients:', error)
      }
    }

    loadPatients()
  }, [doctorId])

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">My Patients</h2>
      {patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Phone</th>
              <th className="border px-4 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{p.name}</td>
                <td className="border px-4 py-2">{p.email || '-'}</td>
                <td className="border px-4 py-2">{p.phone || '-'}</td>
                <td className="border px-4 py-2">
                  {p.createdAt ? new Date(typeof p.createdAt === 'object' && 'seconds' in p.createdAt ? p.createdAt.seconds * 1000 : p.createdAt as string).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
