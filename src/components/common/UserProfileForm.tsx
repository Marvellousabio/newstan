'use client'

import { useEffect, useState } from 'react'
import { updateUserData } from '@/services/userService'
import { useUserData } from '@/hooks/useUserData'
import { Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UserProfileForm() {
  const { user, loading } = useUserData()
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    hospitalId: '',
  })

  // Sync form state when user data loads
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        hospitalId: user.hospitalId || '',
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid) return toast.error('User not found')

    setIsSaving(true)
    try {
      await updateUserData(user.uid, form)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return <p className="text-center mt-4 text-gray-600">Loading user data...</p>
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md space-y-4"
    >
      <h2 className="text-lg font-semibold text-center text-gray-800">
        Your Profile
      </h2>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
          className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Hospital ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Hospital ID</label>
        <input
          type="text"
          name="hospitalId"
          value={form.hospitalId}
          onChange={handleChange}
          placeholder="Enter your hospital ID"
          className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Save Button */}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full flex items-center justify-center bg-blue-600 text-white font-medium rounded-md py-2 hover:bg-blue-700 transition disabled:opacity-70"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </>
        )}
      </button>
    </form>
  )
}
