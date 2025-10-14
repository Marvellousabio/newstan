// components/DoctorDashboard/SymptomsList.tsx
'use client';

import React from 'react';
import type { FirestoreSymptom } from '../../../types/DoctorTypes';

type Props = {
  symptoms: FirestoreSymptom[];
  onOpenPatient: (id?: string) => void;
};

export default function SymptomsList({ symptoms, onOpenPatient }: Props) {
  return (
    <div className="col-span-1 bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Symptoms & Reports</h3>
        <div className="text-sm text-gray-500">Recent</div>
      </div>

      <div className="space-y-3 max-h-[64vh] overflow-auto">
        {symptoms.map((s) => (
          <div key={s.id} className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{s.summary}</div>
                <div className="text-xs text-gray-500 truncate">{s.details || 'No details'}</div>
              </div>
              <div className="text-xs text-gray-400">{s.motherId}</div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <button onClick={() => onOpenPatient(s.motherId)} className="underline text-xs text-blue-600">Open patient</button>
            </div>
          </div>
        ))}

        {symptoms.length === 0 && <div className="text-sm text-gray-500">No symptom reports</div>}
      </div>
    </div>
  );
}
