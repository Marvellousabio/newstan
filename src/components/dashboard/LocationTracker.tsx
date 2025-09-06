'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  Wifi, 
  WifiOff, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LocationTrackerProps {
  onLocationUpdate: (location: { lat: number; lng: number } | null) => void;
}

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
}

export default function LocationTracker({ onLocationUpdate }: LocationTrackerProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [watchId, setWatchId] = useState<number | null>(null);

  // Default location (Addis Ababa) for fallback
  const defaultLocation = {
    lat: 8.9806,
    lng: 38.7578,
    accuracy: 1000,
    timestamp: new Date(),
    address: 'Addis Ababa, Ethiopia'
  };

  const getCurrentLocation = async (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
          };

          // Try to get address from coordinates (reverse geocoding)
          getAddressFromCoordinates(locationData.lat, locationData.lng)
            .then(address => {
              locationData.address = address;
              resolve(locationData);
            })
            .catch(() => {
              // If reverse geocoding fails, still resolve with coordinates
              resolve(locationData);
            });
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              setPermissionStatus('denied');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'An unknown error occurred';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using a free reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      
      const data = await response.json();
      return `${data.locality || ''} ${data.city || ''} ${data.countryName || ''}`.trim();
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const startLocationTracking = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check permission first
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setPermissionStatus(permission.state);
        
        if (permission.state === 'denied') {
          throw new Error('Location access denied. Please enable location permissions in your browser settings.');
        }
      }

      // Get initial location
      const initialLocation = await getCurrentLocation();
      setLocation(initialLocation);
      onLocationUpdate({ lat: initialLocation.lat, lng: initialLocation.lng });
      setPermissionStatus('granted');

      // Start watching location changes
      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation: LocationData = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date(),
            };

            setLocation(newLocation);
            onLocationUpdate({ lat: newLocation.lat, lng: newLocation.lng });

            // Update address periodically (not on every location update)
            if (Math.random() < 0.1) { // 10% chance
              getAddressFromCoordinates(newLocation.lat, newLocation.lng)
                .then(address => {
                  setLocation(prev => prev ? { ...prev, address } : null);
                })
                .catch(() => {
                  // Ignore address update errors
                });
            }
          },
          (error) => {
            console.error('Location watch error:', error);
            // Don't show error for watch position failures
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000 // 1 minute
          }
        );

        setWatchId(id);
      }

      toast.success('Location tracking started');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
      
      // Fallback to default location
      setLocation(defaultLocation);
      onLocationUpdate({ lat: defaultLocation.lat, lng: defaultLocation.lng });
    } finally {
      setIsLoading(false);
    }
  };

  const stopLocationTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setLocation(null);
    onLocationUpdate(null);
    toast('Location tracking stopped');
  };

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissionStatus('granted');
          startLocationTracking();
        },
        () => {
          setPermissionStatus('denied');
          toast.error('Location permission denied');
        }
      );
    }
  };

  useEffect(() => {
    // Auto-start location tracking on component mount
    startLocationTracking();

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Location Status</h3>
            <p className="text-sm text-gray-600">
              {location ? 'GPS Active' : 'GPS Inactive'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : location ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
      </div>

      {location && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Coordinates:</span>
            <span className="font-mono text-gray-900">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </span>
          </div>
          
          {location.address && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Address:</span>
              <span className="text-gray-900 text-right max-w-xs truncate">
                {location.address}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Accuracy:</span>
            <span className="text-gray-900">
              ±{Math.round(location.accuracy)}m
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last Updated:</span>
            <span className="text-gray-900">
              {location.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </motion.div>
      )}

      {permissionStatus === 'denied' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Location access denied. Enable in browser settings.
              </span>
            </div>
            <button
              onClick={requestLocationPermission}
              className="text-sm text-yellow-800 underline hover:text-yellow-900"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex space-x-2 mt-4">
        {!location ? (
          <button
            onClick={startLocationTracking}
            disabled={isLoading}
            className="btn btn-primary btn-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2" />
                Start Tracking
              </>
            )}
          </button>
        ) : (
          <button
            onClick={stopLocationTracking}
            className="btn btn-outline btn-sm"
          >
            Stop Tracking
          </button>
        )}
      </div>
    </motion.div>
  );
}
