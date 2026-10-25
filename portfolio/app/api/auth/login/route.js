import { NextResponse } from "next/server";

import { checkAdminPassword, createAdminSession, SESSION_SECONDS } from "@/backend/lib/admin-session.cjs";

export async function POST(request) {
  if (!process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Admin belum dikonfigurasi" }, { status: 503 });
  const { password } = await request.json().catch(() => ({}));

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  // Di Vercel/production, selalu secure=true. sameSite="lax" aman untuk same-site POST.
  const isProduction = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
  response.cookies.set("jayszrs_admin", createAdminSession(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isProduction,
    maxAge: SESSION_SECONDS,
  });
  return response;
}
