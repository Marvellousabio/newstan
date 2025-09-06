export type Facility = {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    level: "clinic" | "hospital" | "specialist";
    services: Array<"maternal" | "emergency" | "neonatal" | "surgery">;
    availability?: {
        doctors: number;
        nurses: number;
        status: "available" | "busy" | "offline";
    };
    phone?: string;
    address?: string;
};

export const mockFacilities: Facility[] = [
    {
        id: "f1",
        name: "City Women’s Hospital",
        latitude: 8.9806,
        longitude: 38.7578,
        level: "hospital",
        services: ["maternal", "emergency", "neonatal"],
        availability: { doctors: 4, nurses: 12, status: "available" },
        phone: "+251-11-123-4567",
        address: "Kazanchis, Addis Ababa",
    },
    {
        id: "f2",
        name: "St. Mary Clinic",
        latitude: 8.995,
        longitude: 38.78,
        level: "clinic",
        services: ["maternal", "emergency"],
        availability: { doctors: 1, nurses: 6, status: "busy" },
        phone: "+251-11-765-4321",
        address: "Bole, Addis Ababa",
    },
    {
        id: "f3",
        name: "Regional Referral Hospital",
        latitude: 9.03,
        longitude: 38.74,
        level: "specialist",
        services: ["maternal", "surgery", "emergency"],
        availability: { doctors: 6, nurses: 20, status: "available" },
        phone: "+251-11-222-0000",
        address: "Yeka, Addis Ababa",
    },
];

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
    const R = 6371;
    const dLat = ((bLat - aLat) * Math.PI) / 180;
    const dLng = ((bLng - aLng) * Math.PI) / 180;
    const s1 = Math.sin(dLat / 2) ** 2;
    const s2 = Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(s1 + s2), Math.sqrt(1 - (s1 + s2)));
    return R * c;
}

export function findNearbyFacilities(lat: number, lng: number, radiusKm = 25) {
    return mockFacilities
        .map((f) => ({
            ...f,
            distanceKm: haversineKm(lat, lng, f.latitude, f.longitude),
        }))
        .filter((f) => f.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);
}

// Export haversine for API fallback computations
export { haversineKm as haversineDistanceKm };


