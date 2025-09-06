'use client';

import { Bell } from 'lucide-react';

export default function Notifications() {
  return (
    <div className="card p-6 text-center">
      <div className="flex items-center justify-center mb-2">
        <Bell className="w-6 h-6 text-gray-500" />
      </div>
      <p className="text-sm text-gray-600">No notifications yet.</p>
    </div>
  );
}
