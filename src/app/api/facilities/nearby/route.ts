import { NextRequest, NextResponse } from "next/server";
import { findNearbyFacilities, haversineDistanceKm } from "@/lib/facilities";

type OverpassElement = {
    type: 'node' | 'way' | 'relation';
    id: number;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
};

async function fetchOverpassFacilities(lat: number, lng: number, radiusKm: number) {
    const radiusMeters = Math.min(Math.max(Math.floor(radiusKm * 1000), 500), 50000);
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
        node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
        way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
        way["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      );
      out center 50;
    `;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
        body: new URLSearchParams({ data: query }).toString(),
        // 10s timeout via AbortController if needed (skip here for brevity)
    });
    if (!res.ok) throw new Error(`Overpass ${res.status}`);
    const data = await res.json();
    const elements: OverpassElement[] = data.elements || [];
    return elements
        .map((el) => {
            const coords = el.type === 'node' ? { lat: el.lat!, lon: el.lon! } : el.center;
            if (!coords) return null;
            const tags = el.tags || {};
            const name = tags.name || tags["addr:housename"] || "Unknown Hospital";
            const address = [
                tags["addr:street"],
                tags["addr:city"],
                tags["addr:state"],
                tags["addr:country"],
            ].filter(Boolean).join(", ");
            const level = (tags["amenity"] === 'hospital' ? 'hospital' : 'clinic') as 'hospital' | 'clinic';
            return {
                id: String(el.id),
                name,
                latitude: coords.lat,
                longitude: coords.lon,
                level,
                services: ['maternal', 'emergency'],
                availability: { doctors: 0, nurses: 0, status: 'available' as const },
                phone: tags.phone || tags["contact:phone"] || '',
                address,
            };
        })
        .filter(Boolean);
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));
    const radius = Number(searchParams.get("radius")) || 25;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return NextResponse.json({ error: "lat,lng required" }, { status: 400 });
    }

    try {
        const facilities = await fetchOverpassFacilities(lat, lng, radius);
        if (facilities && facilities.length > 0) {
            // Compute distances server-side to aid sorting
            const withDistance = facilities.map((f) => ({
                ...f,
                distanceKm: haversineDistanceKm(lat, lng, f.latitude, f.longitude),
            }))
                .sort((a, b) => a.distanceKm - b.distanceKm);
            return NextResponse.json({ facilities: withDistance });
        }
    } catch (e) {
        // Swallow and fallback
    }

    // Fallback to local mock list if Overpass fails
    const results = findNearbyFacilities(lat, lng, radius);
    return NextResponse.json({ facilities: results });
}


