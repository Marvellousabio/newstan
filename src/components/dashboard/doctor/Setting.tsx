'use client'

import React, { useState } from 'react'
import UserProfileForm from '../../common/UserProfileForm'
import type { User } from '@/types'

interface DoctorSettingsProps {
  user: User | null
}

export default function DoctorSettings({ user }: DoctorSettingsProps) {
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')


  return (
    <section className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Profile Settings</h2>

      {/* Common reusable profile form */}
      <UserProfileForm />

      
    </section>
  )
}
