import { auth } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  startAt: string;
  endAt: string;
  type: string;
  status: string;
  notes?: string;
  urgent?: boolean;
  createdAt: string | { seconds: number; nanoseconds: number };
  updatedAt: string | { seconds: number; nanoseconds: number };
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  notes?: string;
  createdAt: string | { seconds: number; nanoseconds: number };
  updatedAt: string | { seconds: number; nanoseconds: number };
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: string | { seconds: number; nanoseconds: number };
}

export interface Thread {
  id: string;
  memberIds: string[];
  lastMessageAt: string | { seconds: number; nanoseconds: number };
  createdAt: string | { seconds: number; nanoseconds: number };
}

// Authenticate and set session
export async function authenticateSession(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  const idToken = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/api/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate session');
  }
}

// Appointments
export async function fetchAppointments(doctorId: string, params?: { status?: string; from?: string; to?: string; limit?: number }): Promise<Appointment[]> {
  const query = new URLSearchParams({
    doctorId,
    ...(params?.status && { status: params.status }),
    ...(params?.from && { from: params.from }),
    ...(params?.to && { to: params.to }),
    ...(params?.limit && { limit: params.limit.toString() }),
  });

  const response = await fetch(`${API_BASE_URL}/api/appointments?${query}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch appointments');
  }

  const data = await response.json();
  return data.items || [];
}

export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
  const response = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update appointment');
  }

  return response.json();
}

// Patients
export async function fetchPatients(params?: { limit?: number }): Promise<Patient[]> {
  const query = new URLSearchParams({
    ...(params?.limit && { limit: params.limit.toString() }),
  });

  const response = await fetch(`${API_BASE_URL}/api/patients?${query}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch patients');
  }

  const data = await response.json();
  return data.items || [];
}

// Messaging
export async function fetchThreads(memberId: string): Promise<Thread[]> {
  const response = await fetch(`${API_BASE_URL}/api/threads?member=${memberId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch threads');
  }

  const data = await response.json();
  return data.items || [];
}

export async function fetchMessages(threadId: string, limit?: number): Promise<Message[]> {
  const query = new URLSearchParams({
    threadId,
    ...(limit && { limit: limit.toString() }),
  });

  const response = await fetch(`${API_BASE_URL}/api/messages?${query}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  const data = await response.json();
  return data.items || [];
}

export async function sendMessage(threadId: string, text: string): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}/api/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ threadId, text }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
}

export async function createThread(members: string[]): Promise<Thread> {
  const response = await fetch(`${API_BASE_URL}/api/threads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ members }),
  });

  if (!response.ok) {
    throw new Error('Failed to create thread');
  }

  return response.json();
}