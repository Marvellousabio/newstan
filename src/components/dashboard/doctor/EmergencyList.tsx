// components/DoctorDashboard/EmergencyList.tsx
'use client';

import React from 'react';
import type { FirestoreEmergency } from '../../../types/DoctorTypes';

type Props = {
  emergencies: FirestoreEmergency[];
  onOpenPatient: (id?: string) => void;
  onCall: (e: FirestoreEmergency) => void;
};

export default function EmergencyList({ emergencies, onOpenPatient, onCall }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Emergencies</h3>
        <div className="text-sm text-gray-500">{emergencies.length}</div>
      </div>

      <div className="space-y-2 max-h-[20vh] overflow-auto">
        {emergencies.map((e) => (
          <div key={e.id} className="p-2 border rounded flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{e.motherId || e.motherName}</div>
              <div className="text-xs text-gray-500">{e.notes || 'Urgent request'}</div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <button onClick={() => onOpenPatient(e.motherId)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">Open</button>
              <button onClick={() => onCall(e)} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">Call</button>
            </div>
          </div>
        ))}

        {emergencies.length === 0 && <div className="text-sm text-gray-500">No emergencies</div>}
      </div>
    </div>
  );
}
