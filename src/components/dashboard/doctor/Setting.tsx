'use client'

import React, { useState } from 'react'
import type { User } from '@/types'

interface DoctorSettingsProps {
  user: User | null
}

export default function DoctorSettings({ user }: DoctorSettingsProps) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  const handleSave = () => {
    console.log('Save doctor profile', { name, email })
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow max-w-md">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          className="mt-1 block w-full border rounded p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          className="mt-1 block w-full border rounded p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSave}>Save</button>
    </div>
  )
}
