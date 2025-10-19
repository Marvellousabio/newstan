import { ref, set, onValue, update, DatabaseReference, DataSnapshot } from 'firebase/database';
import { realtimeDb } from './firebase';
import { REALTIME_PATHS } from '@/types';

// Location data structure for Realtime Database
export interface LocationData {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

// Location tracking service
export class LocationService {
  private locationRefs: Map<string, DatabaseReference> = new Map();
  private watchers: Map<string, () => void> = new Map();

  // Update user location in real-time
  async updateLocation(userId: string, location: LocationData): Promise<void> {
    const locationRef = ref(realtimeDb, `${REALTIME_PATHS.LOCATIONS}/${userId}`);
    await set(locationRef, {
      ...location,
      lastUpdated: Date.now(),
    });
  }

  // Watch location updates for a specific user
  watchLocation(userId: string, callback: (location: LocationData) => void): () => void {
    const locationRef = ref(realtimeDb, `${REALTIME_PATHS.LOCATIONS}/${userId}`);

    const unsubscribe = onValue(locationRef, (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        callback(data as LocationData);
      }
    });

    this.watchers.set(userId, unsubscribe);
    return unsubscribe;
  }

  // Stop watching location for a user
  unwatchLocation(userId: string): void {
    const unsubscribe = this.watchers.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.watchers.delete(userId);
    }
  }

  // Get current location for a user
  async getCurrentLocation(userId: string): Promise<LocationData | null> {
    const locationRef = ref(realtimeDb, `${REALTIME_PATHS.LOCATIONS}/${userId}`);
    return new Promise((resolve) => {
      onValue(locationRef, (snapshot: any) => {
        const data = snapshot.val();
        resolve(data ? (data as LocationData) : null);
      }, { onlyOnce: true });
    });
  }

  // Update availability status for hospitals/drivers
  async updateAvailability(entityId: string, availability: {
    status: 'available' | 'busy' | 'offline';
    lastUpdated: number;
    capacity?: number;
  }): Promise<void> {
    const availabilityRef = ref(realtimeDb, `${REALTIME_PATHS.AVAILABILITY}/${entityId}`);
    await update(availabilityRef, availability);
  }

  // Watch availability changes
  watchAvailability(entityId: string, callback: (availability: Record<string, unknown>) => void): () => void {
    const availabilityRef = ref(realtimeDb, `${REALTIME_PATHS.AVAILABILITY}/${entityId}`);

    const unsubscribe = onValue(availabilityRef, (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    });

    return unsubscribe;
  }

  // Clean up all watchers
  cleanup(): void {
    this.watchers.forEach(unsubscribe => unsubscribe());
    this.watchers.clear();
  }
}

// Singleton instance
export const locationService = new LocationService();