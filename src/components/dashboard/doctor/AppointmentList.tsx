// components/DoctorDashboard/AppointmentList.tsx
'use client';

import React from 'react';
import { Check, Video, MessageCircle } from 'lucide-react';
import type { FirestoreAppointment } from '../../../types/DoctorTypes';

type Props = {
  appointments: FirestoreAppointment[];
  selectedAppointment: FirestoreAppointment | null;
  onSelect: (a: FirestoreAppointment) => void;
  onAccept: (a: FirestoreAppointment) => void;
  onCall: (a: FirestoreAppointment) => void;
  onOpenPatient: (id?: string) => void;
};

export default function AppointmentList({ appointments, selectedAppointment, onSelect, onAccept, onCall, onOpenPatient }: Props) {
  return (
    <div className="col-span-1 bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Today, {appointments.length} appointments</h3>
        <div className="text-sm text-gray-500">List</div>
      </div>

      <div className="space-y-3 max-h-[64vh] overflow-auto">
        {appointments.map((a) => (
          <div key={a.id} onClick={() => onSelect(a)} className={`p-3 rounded-lg cursor-pointer border ${selectedAppointment?.id === a.id ? 'border-green-300 bg-green-50' : 'border-transparent hover:bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{a.motherName || 'Mother'}</div>
                <div className="text-xs text-gray-500 truncate">{a.notes || 'No notes'}</div>
              </div>
              <div className="text-xs text-gray-400">{a.status || 'scheduled'}</div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-blue-600">{a.scheduledAt ? new Date((a.scheduledAt as { seconds: number })?.seconds * 1000).toLocaleTimeString() : 'TBD'}</div>
              <div className="flex items-center space-x-2">
                <button onClick={(e) => { e.stopPropagation(); onAccept(a); }} className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 flex items-center space-x-1">
                  <Check className="w-4 h-4" /> <span>Accept</span>
                </button>

                <button onClick={(e) => { e.stopPropagation(); onCall(a); }} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 flex items-center space-x-1">
                  <Video className="w-4 h-4" /> <span>Call</span>
                </button>

                <button onClick={(e) => { e.stopPropagation(); onOpenPatient(a.motherId); }} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" /> <span>View</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {appointments.length === 0 && <div className="text-sm text-gray-500">No appointments</div>}
      </div>
    </div>
  );
}
