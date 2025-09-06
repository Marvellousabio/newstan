'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ambulance, Bike, Car, Loader2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface TransportRequestProps {
  currentLocation: { lat: number; lng: number } | null;
  isOnline: boolean;
}

export default function TransportRequest({ currentLocation, isOnline }: TransportRequestProps) {
  const [vehicleType, setVehicleType] = useState<'ambulance' | 'motorcycle' | 'tricycle'>('ambulance');
  const [isRequesting, setIsRequesting] = useState(false);
  const [eta, setEta] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'requested' | 'driver_assigned'>('idle');
  const [driver, setDriver] = useState<{ name: string; vehicle: string } | null>(null);

  const requestTransport = async () => {
    if (!currentLocation) {
      toast.error('Location not available. Please enable GPS.');
      return;
    }

    setIsRequesting(true);
    try {
      const res = await fetch('/api/transport/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: currentLocation.lat, lng: currentLocation.lng, mode: vehicleType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      setEta(data.etaMinutes ?? null);
      setStatus('requested');
      toast.success('Transport request sent. Awaiting driver.');

      // Simulate driver acceptance after a short delay
      setTimeout(() => {
        setDriver({ name: 'Amanuel G.', vehicle: vehicleType });
        setStatus('driver_assigned');
        toast('Driver assigned. Live tracking started.');
      }, 2000);
    } catch (e) {
      toast.error('Failed to request transport. Try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-700">
            {currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'Location not set'}
          </span>
        </div>
        <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={() => setVehicleType('ambulance')}
          className={`btn w-full ${vehicleType === 'ambulance' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Ambulance className="w-4 h-4 mr-2" /> Ambulance
        </button>
        <button
          onClick={() => setVehicleType('motorcycle')}
          className={`btn w-full ${vehicleType === 'motorcycle' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Bike className="w-4 h-4 mr-2" /> Motorcycle
        </button>
        <button
          onClick={() => setVehicleType('tricycle')}
          className={`btn w-full ${vehicleType === 'tricycle' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Car className="w-4 h-4 mr-2" /> Tricycle
        </button>
      </div>

      <button onClick={requestTransport} disabled={isRequesting || !currentLocation} className="btn btn-primary w-full">
        {isRequesting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending request...
          </>
        ) : (
          <>Request Transport</>
        )}
      </button>

      {status !== 'idle' && (
        <div className="mt-4 card p-4">
          <div className="text-sm text-gray-700">Status: {status.replace('_', ' ')}</div>
          {eta !== null && <div className="text-sm text-gray-700">Estimated arrival: {eta} min</div>}
          {driver && (
            <div className="text-sm text-gray-700">Driver: {driver.name} ({driver.vehicle})</div>
          )}
        </div>
      )}
    </motion.div>
  );
}





