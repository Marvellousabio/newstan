// components/DoctorDashboard/DoctorHeader.tsx
'use client';

import React from 'react';
import { Bell, LogOut, Menu } from 'lucide-react';
import type { User } from '@/types';

type Props = {
  user?: User | null;
  onToggleSidebar: () => void;
  onLogout: () => void;
  newBookingsCount: number;
};

export default function DoctorHeader({ user, onToggleSidebar, onLogout, newBookingsCount }: Props) {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-3">
          <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100">
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-3 md:pl-10">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white">D</div>
            <div>
              <h1 className="text-lg font-bold">Doctor Dashboard</h1>
              <p className="text-xs text-gray-500">Welcome, {user?.name || 'Doctor'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
                          
          <div className="flex items-center px-3 py-1 rounded bg-white border">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700 ml-1">{newBookingsCount} new</span>
          </div>

          <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded">
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
