// components/DoctorDashboard/IncomingCallModal.tsx
'use client';

import React from 'react';
import type { FirestoreCall } from '../../../types/DoctorTypes';

type Props = {
  incomingCall: FirestoreCall | null;
  onAccept: () => void;
  onDecline: () => void;
};

export default function IncomingCallModal({ incomingCall, onAccept, onDecline }: Props) {
  if (!incomingCall) return null;

  const time = incomingCall.createdAt?.seconds ? new Date(incomingCall.createdAt.seconds * 1000).toLocaleTimeString() : '';

  return (
    <div className="fixed right-6 bottom-6 z-50 w-96">
      <div className="bg-white border rounded-lg shadow p-4 flex items-start space-x-3">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Incoming Call</div>
              <div className="text-xs text-gray-500">From, {incomingCall.motherName || incomingCall.motherId || 'Mother'}</div>
              <div className="text-xs text-gray-400 mt-1">Channel, {incomingCall.channel || incomingCall.id}</div>
            </div>
            <div className="text-xs text-gray-400">{time}</div>
          </div>

          <div className="mt-3 flex space-x-2">
            <button onClick={onAccept} className="px-3 py-1 rounded bg-green-600 text-white text-sm">Accept</button>
            <button onClick={onDecline} className="px-3 py-1 rounded bg-gray-100 text-sm">Decline</button>
          </div>
        </div>
      </div>
    </div>
  );
}
