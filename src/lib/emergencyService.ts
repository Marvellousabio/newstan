import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '@/types';
import { Emergency, Notification, User } from '@/types';

// Emergency service for handling emergency alerts and responses
export class EmergencyService {
  // Create a new emergency alert
  async createEmergency(emergencyData: Omit<Emergency, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const emergencyRef = await addDoc(collection(db, COLLECTIONS.EMERGENCIES), {
        ...emergencyData,
        alertSent: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Send notifications to relevant parties
      await this.sendEmergencyNotifications(emergencyRef.id, emergencyData);

      return emergencyRef.id;
    } catch (error) {
      console.error('Error creating emergency:', error);
      throw error;
    }
  }

  // Send emergency notifications to doctors, admins, and available drivers
  private async sendEmergencyNotifications(emergencyId: string, emergency: Omit<Emergency, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const notifications: Omit<Notification, 'id' | 'createdAt'>[] = [];

      // Get all doctors and admins
      const usersQuery = query(
        collection(db, COLLECTIONS.USERS),
        where('role', 'in', ['doctor', 'admin', 'hospital_admin'])
      );
      const usersSnapshot = await getDocs(usersQuery);

      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data() as User;
        notifications.push({
          userId: userData.id,
          title: 'Emergency Alert',
          body: `Emergency reported at location (${emergency.currentLocation.lat}, ${emergency.currentLocation.lng})`,
          type: 'emergency',
          data: { emergencyId, location: emergency.currentLocation },
          isRead: false,
        });
      });

      // Get available drivers
      const driversQuery = query(
        collection(db, COLLECTIONS.DRIVERS),
        where('status', '==', 'available')
      );
      const driversSnapshot = await getDocs(driversQuery);

      driversSnapshot.forEach((driverDoc) => {
        const driverData = driverDoc.data() as any;
        notifications.push({
          userId: driverData.id,
          title: 'Emergency Transport Request',
          body: `Emergency transport needed at (${emergency.currentLocation.lat}, ${emergency.currentLocation.lng})`,
          type: 'transport',
          data: { emergencyId, location: emergency.currentLocation },
          isRead: false,
        });
      });

      // Create notification documents
      const notificationPromises = notifications.map(notification =>
        addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
          ...notification,
          createdAt: Timestamp.now(),
        })
      );

      await Promise.all(notificationPromises);

      // Mark emergency as alert sent
      await updateDoc(doc(db, COLLECTIONS.EMERGENCIES, emergencyId), {
        alertSent: true,
        updatedAt: Timestamp.now(),
      });

    } catch (error) {
      console.error('Error sending emergency notifications:', error);
      throw error;
    }
  }

  // Assign driver to emergency
  async assignDriver(emergencyId: string, driverId: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.EMERGENCIES, emergencyId), {
        assignedDriverId: driverId,
        status: 'driver_assigned',
        updatedAt: Timestamp.now(),
      });

      // Update driver status
      await updateDoc(doc(db, COLLECTIONS.DRIVERS, driverId), {
        status: 'busy',
        updatedAt: Timestamp.now(),
      });

    } catch (error) {
      console.error('Error assigning driver:', error);
      throw error;
    }
  }

  // Update emergency status
  async updateEmergencyStatus(emergencyId: string, status: Emergency['status'], updates: Partial<Emergency> = {}): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.EMERGENCIES, emergencyId), {
        status,
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating emergency status:', error);
      throw error;
    }
  }

  // Get emergency by ID
  async getEmergency(emergencyId: string): Promise<Emergency | null> {
    try {
      const emergencyDoc = await getDoc(doc(db, COLLECTIONS.EMERGENCIES, emergencyId));
      if (emergencyDoc.exists()) {
        return {
          id: emergencyDoc.id,
          ...emergencyDoc.data(),
        } as Emergency;
      }
      return null;
    } catch (error) {
      console.error('Error getting emergency:', error);
      throw error;
    }
  }

  // Listen to emergency updates in real-time
  onEmergencyUpdate(emergencyId: string, callback: (emergency: Emergency) => void): () => void {
    const emergencyRef = doc(db, COLLECTIONS.EMERGENCIES, emergencyId);
    return onSnapshot(emergencyRef, (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data(),
        } as Emergency);
      }
    });
  }

  // Get active emergencies for a hospital
  async getActiveEmergencies(hospitalId?: string): Promise<Emergency[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.EMERGENCIES),
        where('status', 'in', ['pending', 'driver_assigned', 'en_route']),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      if (hospitalId) {
        q = query(q, where('assignedHospitalId', '==', hospitalId));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Emergency));
    } catch (error) {
      console.error('Error getting active emergencies:', error);
      throw error;
    }
  }
}

// Singleton instance
export const emergencyService = new EmergencyService();