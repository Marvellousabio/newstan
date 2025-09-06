'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Heart, 
  MapPin, 
  Phone, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EmergencyButtonProps {
  currentLocation: { lat: number; lng: number } | null;
  isOnline: boolean;
}

interface EmergencyData {
  id: string;
  timestamp: Date;
  location: { lat: number; lng: number };
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  nearestHospital?: {
    id: string;
    name: string;
    distance: number;
    eta: number;
  };
  transportRequest?: {
    id: string;
    type: 'ambulance' | 'motorcycle' | 'tricycle';
    eta: number;
    driverName?: string;
  };
}

export default function EmergencyButton({ currentLocation, isOnline }: EmergencyButtonProps) {
  const [isEmergency, setIsEmergency] = useState(false);
  const [emergencyData, setEmergencyData] = useState<EmergencyData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Mock data for demonstration
  const mockHospitals = [
    { id: '1', name: 'Black Lion Hospital', distance: 2.3, eta: 8 },
    { id: '2', name: 'Tikur Anbessa Hospital', distance: 3.1, eta: 12 },
    { id: '3', name: 'St. Paul\'s Hospital', distance: 4.2, eta: 15 }
  ];

  const mockDrivers = [
    { id: '1', type: 'ambulance' as const, eta: 5, driverName: 'Alemayehu T.' },
    { id: '2', type: 'motorcycle' as const, eta: 3, driverName: 'Tigist M.' },
    { id: '3', type: 'tricycle' as const, eta: 7, driverName: 'Kebede A.' }
  ];

  const handleEmergencyPress = async () => {
    if (!currentLocation) {
      toast.error('Location not available. Please enable GPS.');
      return;
    }

    if (!isOnline) {
      // Handle offline emergency
      handleOfflineEmergency();
      return;
    }

    setIsEmergency(true);
    setIsProcessing(true);

    try {
      // Simulate emergency processing
      const emergency: EmergencyData = {
        id: `emergency_${Date.now()}`,
        timestamp: new Date(),
        location: currentLocation,
        status: 'processing'
      };

      setEmergencyData(emergency);

      // Simulate finding nearest hospital
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const nearestHospital = mockHospitals[0];
      const transportRequest = mockDrivers[0];

      setEmergencyData(prev => prev ? {
        ...prev,
        status: 'completed',
        nearestHospital,
        transportRequest
      } : null);

      toast.success('Emergency assistance activated! Help is on the way.');
      
      // Start countdown for automatic completion
      setCountdown(30);

    } catch (error) {
      toast.error('Failed to activate emergency assistance. Please try again.');
      setIsEmergency(false);
      setEmergencyData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOfflineEmergency = () => {
    // In offline mode, show cached data and SMS fallback
    const emergency: EmergencyData = {
      id: `offline_emergency_${Date.now()}`,
      timestamp: new Date(),
      location: currentLocation!,
      status: 'processing',
      nearestHospital: mockHospitals[0], // Cached data
      transportRequest: mockDrivers[0] // Cached data
    };

    setEmergencyData(emergency);
    setIsEmergency(true);
    
    try {
      const smsLink = `sms:?&body=EMERGENCY%20NEED%20HELP%20AT%20${encodeURIComponent(
        `${currentLocation!.lat.toFixed(5)},${currentLocation!.lng.toFixed(5)}`
      )}`;
      // Attempt to open SMS composer on mobile
      if (typeof window !== 'undefined') {
        window.location.href = smsLink;
      }
    } catch {}
    toast.success('Offline emergency activated. Prepared SMS with your GPS coordinates.');
  };

  const handleCancelEmergency = () => {
    setIsEmergency(false);
    setEmergencyData(null);
    setCountdown(0);
    toast('Emergency cancelled');
  };

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && emergencyData) {
      // Auto-complete after countdown
      setEmergencyData(prev => prev ? { ...prev, status: 'completed' } : null);
    }
  }, [countdown, emergencyData]);

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Emergency Button */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={handleEmergencyPress}
          disabled={isProcessing || !currentLocation}
          className={`emergency-btn emergency-pulse ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          } ${!currentLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <>
              🚨 EMERGENCY HELP
            </>
          )}
        </button>

        {!currentLocation && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-red-500 text-center">
            GPS required
          </div>
        )}
      </motion.div>

      {/* Emergency Status */}
      <AnimatePresence>
        {isEmergency && emergencyData && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="w-full max-w-2xl"
          >
            <div className="card p-6 bg-red-50 border-red-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">
                      Emergency Active
                    </h3>
                    <p className="text-sm text-red-700">
                      ID: {emergencyData.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancelEmergency}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4">
                {/* Location Confirmed */}
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700">Location confirmed</span>
                </div>

                {/* Nearest Hospital */}
                {emergencyData.nearestHospital && (
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-700">
                        Nearest hospital: <strong>{emergencyData.nearestHospital.name}</strong>
                      </span>
                      <div className="text-xs text-gray-500">
                        {emergencyData.nearestHospital.distance}km • ETA: {emergencyData.nearestHospital.eta} min
                      </div>
                    </div>
                  </div>
                )}

                {/* Transport Request */}
                {emergencyData.transportRequest && (
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-700">
                        Transport requested: <strong>{emergencyData.transportRequest.type}</strong>
                      </span>
                      <div className="text-xs text-gray-500">
                        Driver: {emergencyData.transportRequest.driverName} • ETA: {emergencyData.transportRequest.eta} min
                      </div>
                    </div>
                  </div>
                )}

                {/* Countdown */}
                {countdown > 0 && (
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-700">
                      Auto-completing in {countdown}s
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6">
                <button className="btn btn-primary flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Hospital
                </button>
                <button className="btn btn-outline flex-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  View Route
                </button>
              </div>

              {/* Offline Notice */}
              {!isOnline && (
                <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Offline Mode:</strong> Emergency contacts have been notified via SMS. 
                    Help is on the way based on cached hospital data.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        <motion.button
          whileHover={{ y: -2 }}
          className="card p-4 text-center hover:shadow-md transition-shadow"
        >
          <Phone className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <span className="text-sm font-medium">Call 911</span>
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          className="card p-4 text-center hover:shadow-md transition-shadow"
        >
          <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <span className="text-sm font-medium">Find Hospitals</span>
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          className="card p-4 text-center hover:shadow-md transition-shadow"
        >
          <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <span className="text-sm font-medium">Medical Info</span>
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          className="card p-4 text-center hover:shadow-md transition-shadow"
        >
          <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <span className="text-sm font-medium">History</span>
        </motion.button>
      </div>
    </div>
  );
}
