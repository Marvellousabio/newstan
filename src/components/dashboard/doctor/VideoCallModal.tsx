'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { FirestoreCall } from '../../../types/DoctorTypes';


interface Props {
  incomingCall: FirestoreCall | null;
  appointment: FirestoreAppointment | null;
  doctorId?: string;
  onEnd: () => void;
  currentLocation?: { lat: number; lng: number } | null;
  isOnline?: boolean;
  role?: 'doctor' | 'mother';
}



export default function VideoCallModal({
  incomingCall,
  appointment,
  role,
  doctorId,
  onEnd,
  currentLocation,
  isOnline,
}: Props) {
  const name =
    incomingCall?.motherName ||
    appointment?.motherName ||
    appointment?.patient?.name ||
    'Patient';

    

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-3">
          <div className="text-sm font-medium">
            Live {role === 'doctor' ? 'Consultation' : 'Check-in'} with {name}
          </div>
          <button
            onClick={onEnd}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
           <VideoCallComponent
            currentLocation={currentLocation}
            isOnline={isOnlineProp ?? networkOnline}
            doctorId={doctorId}
            role={role}
            appointment={appointment}
            incomingCall={incomingCall}
            onEnd={onEnd}
          />

        </div>
      </div>
    </div>
  );
}
