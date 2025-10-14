// components/DoctorDashboard/doctorTypes.ts
import type { Timestamp } from 'firebase/firestore';

export type MaybeTimestamp = Timestamp | number | null | undefined;

export interface FirestoreAppointment {
  id: string;
  motherId?: string;
  motherName?: string;
  notes?: string;
  scheduledAt?: MaybeTimestamp;
  createdAt?: MaybeTimestamp;
  status?: string;
  urgent?: boolean;
  [key: string]: any;
}

export interface FirestoreSymptom {
  id: string;
  motherId?: string;
  summary?: string;
  details?: string;
  createdAt?: MaybeTimestamp;
  [key: string]: any;
}

export interface FirestoreEmergency {
  id: string;
  motherId?: string;
  motherName?: string;
  notes?: string;
  priority?: string;
  createdAt?: MaybeTimestamp;
  [key: string]: any;
}

export interface FirestoreCall {
  id: string;
  motherId?: string;
  motherName?: string;
  doctorId?: string;
  status?: 'requested' | 'accepted' | 'ongoing' | 'ended' | 'declined';
  channel?: string;
  createdAt?: MaybeTimestamp;
  [key: string]: any;
}


export interface FirestoreMessage {
  id: string
  text: string
  senderId: string
  createdAt: any // could be Timestamp or number
}