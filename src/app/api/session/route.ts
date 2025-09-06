import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null);
        const idToken = body?.idToken as string | undefined;
        if (!idToken) {
            return NextResponse.json({ error: "idToken required" }, { status: 400 });
        }

        // TODO: Optionally verify the token with Firebase Admin and set a session cookie
        // For now, accept token and return success so the client can proceed
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: "invalid request" }, { status: 400 });
    }
}


