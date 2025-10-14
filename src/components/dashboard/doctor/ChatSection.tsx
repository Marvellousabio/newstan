// components/DoctorDashboard/ChatSection.tsx
'use client';

import React from 'react';
import type { User } from '@/types';
import type { FirestoreAppointment } from '../../../types/DoctorTypes';

type Props = {
  selectedAppointment: FirestoreAppointment | null;
  messages: any[];
  messageText: string;
  setMessageText: (s: string) => void;
  onSend: () => void;
  user?: User | null;
};

export default function ChatSection({ selectedAppointment, messages, messageText, setMessageText, onSend, user }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Chat</h3>
        <div className="text-sm text-gray-500">{selectedAppointment ? selectedAppointment.motherName : 'No conversation selected'}</div>
      </div>

      <div className="flex-1 overflow-auto max-h-[36vh] space-y-3 p-2 border rounded">
        {messages.map((m) => (
          <div key={m.id} className={`p-2 rounded ${m.senderId === user?.id ? 'bg-green-50 self-end' : 'bg-gray-100 self-start'}`}>
            <div className="text-sm">{m.text}</div>
            <div className="text-xs text-gray-400 mt-1">{m.senderId}</div>
          </div>
        ))}

        {messages.length === 0 && <div className="text-sm text-gray-500">No messages yet</div>}
      </div>

      <div className="mt-3 flex items-center space-x-2">
        <input value={messageText} onChange={(e) => setMessageText(e.target.value)} className="flex-1 border rounded px-3 py-2 text-sm" placeholder="Write a message to the mother" onKeyDown={(e) => { if (e.key === 'Enter') onSend(); }} />
        <button onClick={onSend} className="px-4 py-2 rounded bg-blue-600 text-white text-sm">Send</button>
      </div>
    </div>
  );
}
