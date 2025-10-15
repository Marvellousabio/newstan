import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    console.log("POST /api/session called"); 
    try {
        const body = await req.json().catch(() => null);
        const idToken = body?.idToken as string | undefined;
        if (!idToken) {
            return NextResponse.json({ error: "idToken required" }, { status: 400 });
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("POST /api/session error:", e);
        return NextResponse.json({ error: "invalid request" }, { status: 400 });
    }
}


