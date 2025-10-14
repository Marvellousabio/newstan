// User Types
export type UserRole = 'mother' | 'doctor' | 'nurse' | 'driver' | 'admin' | 'hospital_admin';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    location?: {
        lat: number;
        lng: number;
    };
    isOnline: boolean;
    lastSeen: Date;
    profileImage?: string;
    emergencyContact?: string;
    bloodType?: string;
    medicalHistory?: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Doctor Type
export interface Doctor extends User {
    specialization: string
    hospitalId: string
    yearsOfExperience?: number
    qualifications?: string[]
    rating?: number
    isAvailable: boolean
    licenseNumber?: string
}

// Nurse Type
export interface Nurse extends User {
    hospitalId: string
    department?: string
    shift?: 'morning' | 'evening' | 'night'
    yearsOfExperience?: number
    qualifications?: string[]
    isAvailable: boolean
}

// Mother Type
export interface Mother extends User {
    age?: number
    pregnanciesCount?: number
    expectedDeliveryDate?: Date
    hospitalId?: string
    assignedDoctorId?: string
    assignedNurseId?: string
    emergencyHistory?: string[]
}

// Hospital Types
export interface Hospital {
    id: string;
    name: string;
    location: {
        lat: number;
        lng: number;
    };
    address: string;
    phone: string;
    email: string;
    level: 'primary' | 'secondary' | 'tertiary';
    capacity: number;
    doctorsAvailable: number;
    nursesAvailable: number;
    ambulancesAvailable: number;
    specialties: string[];
    isOpen: boolean;
    operatingHours: {
        open: string;
        close: string;
    };
    sponsorship: 'private' | 'government' | 'ngo';
    subscriptionTier?: 'basic' | 'premium' | 'enterprise';
    rating: number;
    reviews: number;
    createdAt: Date;
    updatedAt: Date;
}

// Emergency Types
export interface Emergency {
    id: string;
    motherId: string;
    currentLocation: {
        lat: number;
        lng: number;
    };
    status: 'pending' | 'driver_assigned' | 'en_route' | 'hospital_reached' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    symptoms: string[];
    estimatedDeliveryDate?: Date;
    pregnancyWeek?: number;
    assignedDriverId?: string;
    assignedHospitalId?: string;
    estimatedArrivalTime?: Date;
    actualArrivalTime?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Driver Types
export interface Driver {
    id: string;
    name: string;
    phone: string;
    vehicleType: 'ambulance' | 'motorcycle' | 'tricycle';
    vehicleNumber: string;
    status: 'available' | 'busy' | 'offline';
    location?: {
        lat: number;
        lng: number;
    };
    rating: number;
    totalTrips: number;
    isVerified: boolean;
    licenseNumber: string;
    insuranceValid: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Transport Request Types
export interface TransportRequest {
    id: string;
    emergencyId: string;
    motherId: string;
    fromLocation: {
        lat: number;
        lng: number;
    };
    toLocation: {
        lat: number;
        lng: number;
    };
    vehicleType: 'ambulance' | 'motorcycle' | 'tricycle';
    status: 'pending' | 'accepted' | 'en_route' | 'arrived' | 'completed' | 'cancelled';
    driverId?: string;
    estimatedTime: number; // in minutes
    actualTime?: number;
    fare?: number;
    distance: number; // in km
    createdAt: Date;
    updatedAt: Date;
}

// Video Call Types
export interface VideoCall {
    id: string;
    motherId: string;
    doctorId: string;
    emergencyId?: string;
    status: 'requested' | 'accepted' | 'ongoing' | 'ended' | 'declined';
    startTime?: Date;
    endTime?: Date;
    duration?: number; // in seconds
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Notification Types
export interface Notification {
    id: string;
    userId: string;
    title: string;
    body: string;
    type: 'emergency' | 'transport' | 'appointment' | 'general';
    data?: Record<string, any>;
    isRead: boolean;
    createdAt: Date;
}

// Referral Types
export interface Referral {
    id: string;
    fromHospitalId: string;
    toHospitalId: string;
    patientId: string;
    reason: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    medicalNotes: string;
    attachments?: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Subscription Types
export interface Subscription {
    id: string;
    hospitalId: string;
    plan: 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    startDate: Date;
    endDate: Date;
    price: number;
    features: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Location Types
export interface Location {
    lat: number;
    lng: number;
    address?: string;
    timestamp?: Date;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Search Types
export interface SearchFilters {
    location?: Location;
    radius?: number; // in km
    hospitalLevel?: 'primary' | 'secondary' | 'tertiary';
    specialties?: string[];
    isOpen?: boolean;
    hasAvailability?: boolean;
}

// Real-time Update Types
export interface RealtimeUpdate {
    type: 'location' | 'availability' | 'status' | 'emergency';
    data: any;
    timestamp: Date;
}

export function isDoctor(user: User): user is Doctor {
    return user.role === 'doctor'
}

export function isNurse(user: User): user is Nurse {
    return user.role === 'nurse'
}

export function isMother(user: User): user is Mother {
    return user.role === 'mother'
}


