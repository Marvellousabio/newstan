import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid json" }, { status: 400 });
    const { lat, lng, mode } = body as { lat: number; lng: number; mode: "ambulance" | "motorcycle" | "tricycle" };
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !mode) {
        return NextResponse.json({ error: "lat,lng,mode required" }, { status: 400 });
    }
    // Mock integration success response
    return NextResponse.json({ ok: true, etaMinutes: mode === "ambulance" ? 10 : 6 });
}


