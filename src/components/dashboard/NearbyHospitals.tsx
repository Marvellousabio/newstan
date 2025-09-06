'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Users, 
  Star,
  Navigation,
  Heart,
  Ambulance,
  Wifi,
  WifiOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NearbyHospitalsProps {
  currentLocation: { lat: number; lng: number } | null;
  isOnline: boolean;
  showAll?: boolean;
  onRecenter?: (loc: { lat: number; lng: number }) => void;
}

interface Hospital {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  phone: string;
  level: 'primary' | 'secondary' | 'tertiary';
  distance: number; // in km
  eta: number; // in minutes
  doctorsAvailable: number;
  nursesAvailable: number;
  ambulancesAvailable: number;
  isOpen: boolean;
  rating: number;
  reviews: number;
  specialties: string[];
  sponsorship: 'private' | 'government' | 'ngo';
  operatingHours: {
    open: string;
    close: string;
  };
}

// Mock data for demonstration
const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: 'Black Lion Hospital',
    location: { lat: 8.9900, lng: 38.7600 },
    address: 'Addis Ababa, Ethiopia',
    phone: '+251-11-123-4567',
    level: 'tertiary',
    distance: 2.3,
    eta: 8,
    doctorsAvailable: 5,
    nursesAvailable: 12,
    ambulancesAvailable: 3,
    isOpen: true,
    rating: 4.8,
    reviews: 1247,
    specialties: ['Obstetrics', 'Gynecology', 'Emergency Medicine', 'Pediatrics'],
    sponsorship: 'government',
    operatingHours: { open: '00:00', close: '23:59' }
  },
  {
    id: '2',
    name: 'Tikur Anbessa Hospital',
    location: { lat: 8.9750, lng: 38.7450 },
    address: 'Addis Ababa, Ethiopia',
    phone: '+251-11-234-5678',
    level: 'tertiary',
    distance: 3.1,
    eta: 12,
    doctorsAvailable: 3,
    nursesAvailable: 8,
    ambulancesAvailable: 2,
    isOpen: true,
    rating: 4.6,
    reviews: 892,
    specialties: ['Obstetrics', 'Gynecology', 'Surgery'],
    sponsorship: 'government',
    operatingHours: { open: '00:00', close: '23:59' }
  },
  {
    id: '3',
    name: 'St. Paul\'s Hospital',
    location: { lat: 8.9850, lng: 38.7700 },
    address: 'Addis Ababa, Ethiopia',
    phone: '+251-11-345-6789',
    level: 'secondary',
    distance: 4.2,
    eta: 15,
    doctorsAvailable: 2,
    nursesAvailable: 6,
    ambulancesAvailable: 1,
    isOpen: true,
    rating: 4.4,
    reviews: 567,
    specialties: ['Obstetrics', 'Gynecology'],
    sponsorship: 'private',
    operatingHours: { open: '06:00', close: '22:00' }
  },
  {
    id: '4',
    name: 'Hope Medical Center',
    location: { lat: 8.9700, lng: 38.7300 },
    address: 'Addis Ababa, Ethiopia',
    phone: '+251-11-456-7890',
    level: 'primary',
    distance: 5.1,
    eta: 18,
    doctorsAvailable: 1,
    nursesAvailable: 3,
    ambulancesAvailable: 0,
    isOpen: false,
    rating: 4.2,
    reviews: 234,
    specialties: ['General Medicine', 'Obstetrics'],
    sponsorship: 'ngo',
    operatingHours: { open: '08:00', close: '17:00' }
  }
];

export default function NearbyHospitals({ currentLocation, isOnline, showAll = false, onRecenter }: NearbyHospitalsProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'tertiary'>('all');
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (currentLocation) {
      loadHospitals();
    }
  }, [currentLocation, filter]);

  const loadHospitals = async () => {
    setLoading(true);
    
    try {
      if (isOnline) {
        // Fetch real nearby facilities from API, map to Hospital shape
        const res = await fetch(`/api/facilities/nearby?lat=${currentLocation!.lat}&lng=${currentLocation!.lng}&radius=25`);
        const data = await res.json();
        const hospitalsWithDistance = (data.facilities || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          location: { lat: f.latitude, lng: f.longitude },
          address: f.address || 'Unknown',
          phone: f.phone || '',
          level: f.level === 'specialist' ? 'tertiary' : f.level === 'hospital' ? 'secondary' : 'primary',
          distance: Math.round((f.distanceKm || 0) * 10) / 10,
          eta: Math.max(1, Math.round((f.distanceKm || 0) * 2.5)),
          doctorsAvailable: f.availability?.doctors ?? 0,
          nursesAvailable: f.availability?.nurses ?? 0,
          ambulancesAvailable: 0,
          isOpen: (f.availability?.status ?? 'available') !== 'offline',
          rating: 4.5,
          reviews: 100,
          specialties: f.services || [],
          sponsorship: 'government',
          operatingHours: { open: '00:00', close: '23:59' },
        }));

        // Cache for offline use
        try {
          localStorage.setItem('hospitalsCache', JSON.stringify(hospitalsWithDistance));
        } catch {}

        let filteredHospitals = hospitalsWithDistance;
        if (filter === 'open') {
          filteredHospitals = hospitalsWithDistance.filter((h: any) => h.isOpen);
        } else if (filter === 'tertiary') {
          filteredHospitals = hospitalsWithDistance.filter((h: any) => h.level === 'tertiary');
        }

        setHospitals(filteredHospitals);
      } else {
        // Use cached data in offline mode
        try {
          const cached = localStorage.getItem('hospitalsCache');
          if (cached) {
            const parsed = JSON.parse(cached);
            setHospitals(parsed);
          } else {
            setHospitals(mockHospitals.slice(0, 3));
          }
        } catch {
          setHospitals(mockHospitals.slice(0, 3));
        }
        toast('Showing cached hospital data (offline mode)');
      }
    } catch (error) {
      toast.error('Failed to load hospitals');
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const geocodePlace = async (place: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const coords = await geocodePlace(query.trim());
      if (!coords) {
        toast.error('Place not found');
        return;
      }
      const hospitalsWithDistance = mockHospitals
        .map(h => {
          const distance = calculateDistance(coords.lat, coords.lng, h.location.lat, h.location.lng);
          return { ...h, distance: Math.round(distance * 10) / 10, eta: Math.round(distance * 2.5) };
        })
        .sort((a, b) => a.distance - b.distance);
      setHospitals(hospitalsWithDistance);
      if (onRecenter) onRecenter({ lat: coords.lat, lng: coords.lng });
      toast.success('Location updated');
    } finally {
      setIsSearching(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getSponsorshipColor = (sponsorship: string) => {
    switch (sponsorship) {
      case 'government': return 'bg-blue-100 text-blue-800';
      case 'ngo': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'tertiary': return 'bg-red-100 text-red-800';
      case 'secondary': return 'bg-yellow-100 text-yellow-800';
      case 'primary': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCallHospital = (hospital: Hospital) => {
    window.open(`tel:${hospital.phone}`);
  };

  const handleGetDirections = (hospital: Hospital) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.location.lat},${hospital.location.lng}`;
    window.open(url, '_blank');
  };

  const handleRequestAmbulance = (hospital: Hospital) => {
    if (hospital.ambulancesAvailable > 0) {
      toast.success(`Ambulance requested from ${hospital.name}`);
    } else {
      toast.error('No ambulances available at this hospital');
    }
  };

  if (!currentLocation) {
    return (
      <div className="card p-6 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Location Required
        </h3>
        <p className="text-gray-600">
          Please enable location services to find nearby hospitals
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {showAll ? 'All Hospitals' : 'Nearby Hospitals'}
          </h2>
          <p className="text-gray-600">
            {isOnline ? 'Real-time availability' : 'Cached data (offline)'}
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex space-x-2">
          <form onSubmit={handleSearch} className="hidden sm:flex items-center space-x-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search place or address"
              className="px-3 py-2 border rounded text-sm w-64"
            />
            <button disabled={isSearching} className="btn btn-sm btn-outline">
              <Search className="w-4 h-4 mr-1" /> {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`btn btn-sm ${filter === 'open' ? 'btn-primary' : 'btn-outline'}`}
          >
            Open Now
          </button>
          <button
            onClick={() => setFilter('tertiary')}
            className={`btn btn-sm ${filter === 'tertiary' ? 'btn-primary' : 'btn-outline'}`}
          >
            Tertiary
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center space-x-2 text-sm">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
          {isOnline ? 'Live data' : 'Offline mode'}
        </span>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Finding nearby hospitals...</p>
        </div>
      )}

      {/* Hospitals List */}
      <AnimatePresence>
        {!loading && hospitals.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {hospitals.map((hospital, index) => (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Hospital Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {hospital.name}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(hospital.level)}`}>
                            {hospital.level.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSponsorshipColor(hospital.sponsorship)}`}>
                            {hospital.sponsorship.toUpperCase()}
                          </span>
                          {hospital.isOpen ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              OPEN
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              CLOSED
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{hospital.rating}</span>
                        <span className="text-sm text-gray-500">({hospital.reviews})</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{hospital.distance} km</p>
                          <p className="text-xs text-gray-500">Distance</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{hospital.eta} min</p>
                          <p className="text-xs text-gray-500">ETA</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{hospital.doctorsAvailable}</p>
                          <p className="text-xs text-gray-500">Doctors</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Ambulance className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{hospital.ambulancesAvailable}</p>
                          <p className="text-xs text-gray-500">Ambulances</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-1">
                        {hospital.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">
                      {hospital.address}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 lg:min-w-[200px]">
                    <button
                      onClick={() => handleCallHospital(hospital)}
                      className="btn btn-primary w-full"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Hospital
                    </button>
                    
                    <button
                      onClick={() => handleGetDirections(hospital)}
                      className="btn btn-outline w-full"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </button>
                    
                    {hospital.ambulancesAvailable > 0 && (
                      <button
                        onClick={() => handleRequestAmbulance(hospital)}
                        className="btn btn-outline w-full text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Ambulance className="w-4 h-4 mr-2" />
                        Request Ambulance
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!loading && hospitals.length === 0 && (
        <div className="card p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Hospitals Found
          </h3>
          <p className="text-gray-600">
            No hospitals match your current filters. Try adjusting your search criteria.
          </p>
        </div>
      )}

      {/* Offline Notice */}
      {!isOnline && (
        <div className="card p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">Offline Mode</h4>
              <p className="text-sm text-yellow-700">
                Showing cached hospital data. Some information may be outdated.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
