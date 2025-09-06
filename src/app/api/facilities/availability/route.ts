import { NextRequest, NextResponse } from "next/server";
import { mockFacilities } from "@/lib/facilities";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const facility = mockFacilities.find((f) => f.id === id);
    if (!facility) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ id, availability: facility.availability || null });
}


