'use client'

import React from 'react'
import {
  
  Home,
  Users,
  MessageSquare,
  Video,
  Bell,
  Settings,
  SidebarClose,
  SidebarOpen,
} from 'lucide-react'
import type { User } from '@/types'

export interface DoctorSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  expanded: boolean
  setExpanded: (val: boolean) => void
  navItems: { name: string; key: string; icon?: React.ElementType | null }[]
  user: User | null
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function DoctorSideBar({
  sidebarOpen,
  setSidebarOpen,
  expanded,
  setExpanded,
  navItems,
  user,
  activeTab,
  setActiveTab,
}: DoctorSidebarProps) {
  const iconMap: Record<string, React.ElementType> = {
    home: Home,
    patients: Users,
    chats: MessageSquare,
    video: Video,
    alerts: Bell,
    settings: Settings,
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg border-r border-gray-100 flex flex-col
      transform transition-all duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0 ${expanded ? 'w-56' : 'w-20'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-6 border-b">
        <div className="flex items-center space-x-2">
          {expanded && <div className="text-sm font-semibold">Doctor</div>}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded hover:bg-gray-100 transition"
        >
          {expanded ? <SidebarClose className="w-5 h-5" /> : <SidebarOpen className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">

        {navItems.map((item) => {
          const Icon = item.icon || iconMap[item.key]
          const isActive = activeTab === item.key

          return (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.key)
                setSidebarOpen(false)
              }}
              className={`flex items-center w-full px-3 py-2 rounded text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-green-100 text-green-700 border-r-2 border-green-500'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {Icon && (
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? 'text-green-700' : 'text-gray-600'
                  }`}
                />
              )}
              {/* Smoothly appear/disappear name */}
              <span
                className={`ml-3 whitespace-nowrap transition-all duration-200 ${
                  expanded
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4 w-0 overflow-hidden'
                }`}
              >
                {item.name}
              </span>
            </button>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t mt-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700">
            {user?.name?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          <div
            className={`transition-all duration-200 ${
              expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 overflow-hidden'
            }`}
          >
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'Doctor'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
