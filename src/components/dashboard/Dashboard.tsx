'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
   
  Heart, 
   
  Truck,
  Video,
  Bell,
  
  LogOut,
  Menu,
  X,
  Wifi,
  WifiOff,
  Navigation,
  Clipboard
} from 'lucide-react';
import EmergencyButton from './EmergencyButton';
import LocationTracker from './LocationTracker';
import NearbyHospitals from './NearbyHospitals';
import TransportRequest from './TransportRequest';
import SymptomsForm from './SymptomsForm';
import dynamic from 'next/dynamic';
const VideoCall = dynamic(() => import('./VideoCall'), { ssr: false });
import Notifications from './Notifications';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [activeTab, setActiveTab] = useState('emergency');

  

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      try {
        await fetch('/api/logout', { method: 'POST' });
      } catch {}
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserRoleDisplay = () => {
    if (!user) return 'User';
    const role = user.displayName || 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const tabs = [
    { id: 'emergency', label: 'Emergency', icon: <Heart className="w-5 h-5" /> },
    { id: 'hospitals', label: 'Hospitals', icon: <MapPin className="w-5 h-5" /> },
    { id: 'transport', label: 'Transport', icon: <Truck className="w-5 h-5" /> },
    { id: 'video', label: 'Video Call', icon: <Video className="w-5 h-5" /> },
    { id: 'notifications', label: 'Alerts', icon: <Bell className="w-5 h-5" /> },
    { id: 'symptoms', label: 'Symptoms', icon: <Clipboard className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="offline-indicator">
          <WifiOff className="w-4 h-4 inline mr-2" />
          You're offline - Emergency features still available
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Maternal Emergency</h1>
                  <p className="text-xs text-gray-500">Welcome, {getUserRoleDisplay()}</p>
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm text-gray-600">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {currentLocation && (
                <div className="flex items-center space-x-2">
                  <Navigation className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Location Active</span>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          initial={false}
          animate={{ x: sidebarOpen ? 0 : -256 }}
        >
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-100 text-green-700 border-r-2 border-green-500'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Location Tracker */}
            <LocationTracker onLocationUpdate={setCurrentLocation} />

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'emergency' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Emergency Assistance
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      In case of maternal emergency, tap the button below to instantly 
                      find the nearest hospital and request emergency transport.
                    </p>
                  </div>
                  
                  <EmergencyButton 
                    currentLocation={currentLocation}
                    isOnline={isOnline}
                  />
                  
                  <NearbyHospitals 
                    currentLocation={currentLocation}
                    isOnline={isOnline}
                    onRecenter={(loc) => setCurrentLocation(loc)}
                  />
                </div>
              )}

              {activeTab === 'hospitals' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Nearby Hospitals
                    </h2>
                    <p className="text-gray-600">
                      Find maternal health facilities near you with real-time availability
                    </p>
                  </div>
                  
                  <NearbyHospitals 
                    currentLocation={currentLocation}
                    isOnline={isOnline}
                    showAll={true}
                    onRecenter={(loc) => setCurrentLocation(loc)}
                  />
                </div>
              )}

              {activeTab === 'transport' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Request Transport
                    </h2>
                    <p className="text-gray-600">
                      Get emergency transport to the nearest hospital
                    </p>
                  </div>
                  
                  <TransportRequest 
                    currentLocation={currentLocation}
                    isOnline={isOnline}
                  />
                </div>
              )}

              {activeTab === 'video' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Video Consultation
                    </h2>
                    <p className="text-gray-600">
                      Connect with doctors for immediate medical advice
                    </p>
                  </div>
                  
                  <VideoCall 
                    currentLocation={currentLocation}
                    isOnline={isOnline}
                  />
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Notifications & Alerts
                    </h2>
                    <p className="text-gray-600">
                      Stay updated with emergency alerts and system notifications
                    </p>
                  </div>
                  
                  <Notifications />
                </div>
              )}

              {activeTab === 'symptoms' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Symptoms & Notes
                    </h2>
                    <p className="text-gray-600">
                      Describe how you feel. A doctor can review and reply with guidance.
                    </p>
                  </div>

                  <SymptomsForm />
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}