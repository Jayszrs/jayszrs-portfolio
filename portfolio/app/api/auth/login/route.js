import { NextResponse } from "next/server";

import { checkAdminPassword, createAdminSession, SESSION_SECONDS } from "@/backend/lib/admin-session.cjs";

export async function POST(request) {
  if (!process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Admin belum dikonfigurasi" }, { status: 503 });
  const { password } = await request.json().catch(() => ({}));

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("jayszrs_admin", createAdminSession(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_SECONDS,
  });
  return response;
}
