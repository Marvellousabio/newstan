import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Clear legacy and session cookies
  res.headers.append("Set-Cookie", "auth=; Path=/; Max-Age=0; SameSite=Lax");
  res.headers.append("Set-Cookie", "auth=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly");
  res.headers.append("Set-Cookie", "session=; Path=/; Max-Age=0; SameSite=Lax");
  res.headers.append("Set-Cookie", "session=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly");
  return res;
}

export async function GET() {
  return POST();
}
