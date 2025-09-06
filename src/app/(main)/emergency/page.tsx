"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { ButtonHTMLAttributes } from "react";
import { Phone, Navigation, MapPin, Ambulance, Bike, Bus, Loader2 } from "lucide-react";
import { useSpring, animated } from "@react-spring/web";

type LatLng = { lat: number; lng: number };

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

function ActionButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`btn ${props.className || "btn-primary"}`} />;
}

export default function EmergencyPage() {
  const [loc, setLoc] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<LatLng>({ lat: 8.9806, lng: 38.7578 });

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const center = useMemo<LatLng>(() => loc || mapCenter, [loc, mapCenter]);

  useEffect(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLoading(false);
        },
        () => setLoading(false),
        { enableHighAccuracy: true, timeout: 7000 }
      );
    } else {
      setLoading(false);
    }
  }, []);

  const fetchNearby = useCallback(async () => {
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
      const res = await fetch(`${base}/api/facilities/nearby?lat=${center.lat}&lng=${center.lng}&radius=30`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFacilities(data.facilities || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch');
      setFacilities([]);
    }
  }, [center.lat, center.lng]);

  useEffect(() => {
    fetchNearby();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.lat, center?.lng]);

  const requestTransport = useCallback(async (mode: "ambulance" | "motorcycle" | "tricycle") => {
    if (!center) return;
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
      const res = await fetch(`${base}/api/transport/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: center.lat, lng: center.lng, mode }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      alert(data.ok ? `Transport requested. ETA ~${data.etaMinutes} min.` : "Request failed");
    } catch (e: any) {
      alert(e?.message || 'Failed to fetch');
    }
  }, [center]);

  const mapSpring = useSpring({
    from: { opacity: 0, transform: "scale(0.95)" },
    to: { opacity: 1, transform: "scale(1)" },
    delay: 300,
  });

  return (
    <main className="px-6 md:px-10">
      <section className="mx-auto max-w-6xl py-6 md:py-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Maternal Emergency Locator</h1>
            <p className="text-gray-600">Find the nearest maternal facility, see availability, and request transport.</p>
          </div>
          <button onClick={() => fetchNearby()} className="btn btn-muted inline-flex items-center">
            <Navigation className="h-4 w-4 mr-1" /> Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-[color:var(--color-warn)] bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
            {error}. Please check your connection and try again.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <animated.div style={mapSpring} className="lg:col-span-2 card bg-white/90 p-2 backdrop-blur">
            <div className="relative h-[380px] w-full overflow-hidden rounded-md">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={13}
                  options={mapOptions}
                >
                  {loc && (
                    <Marker
                      position={loc}
                      title="You are here"
                      icon={{
                        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="8" fill="#2E7D32" stroke="white" stroke-width="2"/>
                            <circle cx="12" cy="12" r="3" fill="white"/>
                          </svg>
                        `),
                        scaledSize: new google.maps.Size(24, 24),
                      }}
                    />
                  )}
                  {facilities.map((f) => (
                    <Marker
                      key={f.id}
                      position={{ lat: f.latitude, lng: f.longitude }}
                      title={f.name}
                      onClick={() => setSelectedFacility(f)}
                      icon={{
                        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="12" fill="${f.sponsorship === 'ngo' ? '#4CAF50' : f.sponsorship === 'government' ? '#2196F3' : '#FF9800'}" stroke="white" stroke-width="2"/>
                            <path d="M16 8L20 16H16V24L12 16H16V8Z" fill="white"/>
                          </svg>
                        `),
                        scaledSize: new google.maps.Size(32, 32),
                      }}
                    />
                  ))}
                  {selectedFacility && (
                    <InfoWindow
                      position={{ lat: selectedFacility.latitude, lng: selectedFacility.longitude }}
                      onCloseClick={() => setSelectedFacility(null)}
                    >
                      <div className="p-2">
                        <h3 className="font-semibold text-sm">{selectedFacility.name}</h3>
                        <p className="text-xs text-gray-600">{(selectedFacility.distanceKm ?? 0).toFixed(1)} km away</p>
                        <p className="text-xs text-gray-500">{selectedFacility.level}</p>
                        {selectedFacility.phone && (
                          <a href={`tel:${selectedFacility.phone}`} className="text-xs text-blue-600 hover:underline">
                            {selectedFacility.phone}
                          </a>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}
              {loading && (
                <div className="absolute inset-0 grid place-items-center bg-white/60">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </div>
          </animated.div>

          <div className="space-y-4">
            <div className="card bg-white/90 p-4 backdrop-blur">
              <p className="mb-2 font-medium">Nearest facilities</p>
              <div className="space-y-3">
                {facilities.slice(0, 4).map((f) => (
                  <div key={f.id} className="rounded border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{f.name}</p>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {(f.distanceKm ?? 0).toFixed(1)} km · {f.level}
                        </p>
                      </div>
                      {f.phone ? (
                        <a href={`tel:${f.phone}`} className="a-link inline-flex items-center text-sm"><Phone className="h-4 w-4 mr-1" /> Call</a>
                      ) : null}
                    </div>
                  </div>
                ))}
                {!facilities.length && <p className="text-sm text-gray-600">No facilities nearby yet.</p>}
              </div>
            </div>

            <div className="card bg-white/90 p-4 backdrop-blur">
              <p className="mb-2 font-medium">Request emergency transport</p>
              <div className="flex flex-wrap gap-2">
                <ActionButton onClick={() => requestTransport("ambulance")} className="btn-primary inline-flex items-center"><Ambulance className="h-4 w-4 mr-2" /> Ambulance</ActionButton>
                <ActionButton onClick={() => requestTransport("motorcycle")} className="btn-muted inline-flex items-center"><Bike className="h-4 w-4 mr-2" /> Motorcycle</ActionButton>
                <ActionButton onClick={() => requestTransport("tricycle")} className="btn-muted inline-flex items-center"><Bus className="h-4 w-4 mr-2" /> Tricycle</ActionButton>
              </div>
            </div>

            <div className="card bg-white/90 p-4 backdrop-blur">
              <p className="mb-1 font-medium">Access and Sponsorship</p>
              <p className="text-sm text-gray-600">Private hospitals can subscribe for premium placement and analytics. Rural access can be sponsored by government or NGOs to ensure zero-cost emergency routing for mothers.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


