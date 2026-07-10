import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY // Gunakan secret key untuk akses tulis
);

// GET: Untuk mengambil data supaya tampil di dashboard admin
export async function GET() {
  const { data, error } = await supabase
    .from("profile") // Pastikan nama tabelmu di Supabase adalah 'profile'
    .select("*")
    .eq("id", 1)
    .single();

  return NextResponse.json(data || {});
}

// POST: Untuk menyimpan/update data
export async function POST(request) {
  const session = cookies().get("jayszrs_admin");
  if (!session || session.value !== "ok") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Upsert akan Update jika id=1 ada, atau Insert jika belum ada
  const { error } = await supabase
    .from("profile")
    .upsert({ id: 1, ...body });

  if (error) {
    console.error("Supabase Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}