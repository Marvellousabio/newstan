import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { getMessaging, getToken, MessagePayload, onMessage } from 'firebase/messaging';
import { db, messaging } from './firebase';
import { COLLECTIONS } from '@/types';
import type { Notification } from '@/types';

// Notification service for handling push notifications and in-app notifications
export class NotificationService {
  private messagingSupported: boolean;

  constructor() {
    this.messagingSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Request notification permission and get FCM token
  async requestPermission(): Promise<string | null> {
    if (!this.messagingSupported || !messaging) {
      console.warn('Firebase messaging not supported');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        return token;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
    return null;
  }

  // Save FCM token for a user
  async saveFCMToken(userId: string, token: string): Promise<void> {
    try {
      // Update user document with FCM token
      await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
        fcmToken: token,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error saving FCM token:', error);
      throw error;
    }
  }

  // Create and send notification
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    try {
      const notificationRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        ...notification,
        createdAt: Timestamp.now(),
      });

      // Send push notification if FCM token exists
      await this.sendPushNotification(notification);

      return notificationRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Send push notification via FCM
  private async sendPushNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<void> {
    // This would typically be done via Firebase Cloud Functions
    // For now, we'll handle it client-side for development
    if (!this.messagingSupported || !messaging) return;

    try {
      // Get user's FCM token from database
      const userDoc = await getDocs(query(
        collection(db, COLLECTIONS.USERS),
        where('id', '==', notification.userId)
      ));

      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        const fcmToken = userData.fcmToken;

        if (fcmToken) {
          // In production, this should be done via Cloud Functions
          // For development, we'll use the browser notification API
          if ('serviceWorker' in navigator && 'Notification' in window) {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(notification.title, {
              body: notification.body,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
              data: notification.data,
              tag: `notification-${Date.now()}`,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
        isRead: true,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Get notifications for a user
  async getNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Notification));
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Listen to new notifications in real-time
  onNewNotification(userId: string, callback: (notification: Notification) => void): () => void {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          callback({
            id: change.doc.id,
            ...change.doc.data(),
          } as Notification);
        }
      });
    });
  }

  // Listen to foreground messages
  onForegroundMessage(callback: (payload: MessagePayload) => void): () => void {
    if (!this.messagingSupported || !messaging) {
      return () => {};
    }

    return onMessage(messaging, callback);
  }

  // Send bulk notifications (for emergencies, etc.)
  async sendBulkNotifications(notifications: Omit<Notification, 'id' | 'createdAt'>[]): Promise<void> {
    try {
      const notificationPromises = notifications.map(notification =>
        this.createNotification(notification)
      );

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService();