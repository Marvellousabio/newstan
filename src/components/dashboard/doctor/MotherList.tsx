'use client'

import React, { useEffect, useState } from 'react'
import { fetchMothers, authenticateSession, Mother } from '@/lib/api'

interface MotherListProps {
  doctorId: string
}

export default function MotherList({ doctorId }: MotherListProps) {
  const [mothers, setMothers] = useState<Mother[]>([])

  useEffect(() => {
    if (!doctorId) return

    const loadMothers = async () => {
      try {
        await authenticateSession()
        const mothersData = await fetchMothers()
        setMothers(mothersData)
      } catch (error) {
        console.error('Failed to load mothers:', error)
      }
    }

    loadMothers()
  }, [doctorId])

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">My Mothers</h2>
      {mothers.length === 0 ? (
        <p>No mothers found.</p>
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
            {mothers.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{m.name}</td>
                <td className="border px-4 py-2">{m.email || '-'}</td>
                <td className="border px-4 py-2">{m.phone || '-'}</td>
                <td className="border px-4 py-2">
                  {m.createdAt ? new Date(typeof m.createdAt === 'object' && 'seconds' in m.createdAt ? m.createdAt.seconds * 1000 : m.createdAt as string).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
