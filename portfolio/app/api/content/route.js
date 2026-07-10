import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// GET: Untuk mengambil data dengan struktur aman
export async function GET() {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", 1)
    .single();

  // Jika data belum ada atau error, kita kirim "default" data
  // Ini mencegah error "undefined" di frontend
  if (error || !data) {
    return NextResponse.json({
      id: 1,
      brand_name: "",
      full_name: "",
      role_label: "",
      tagline: "",
      proyek: [],        // Penting: pastikan array kosong agar frontend tidak crash
      pengalaman: [],
      pencapaian: []
    });
  }

  return NextResponse.json(data);
}

// POST: Untuk menyimpan/update data
export async function POST(request) {
  const session = cookies().get("jayszrs_admin");
  if (!session || session.value !== "ok") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Upsert: Update jika id=1 ada, Insert jika id=1 belum ada
  const { error } = await supabase
    .from("profile")
    .upsert({ id: 1, ...body });

  if (error) {
    console.error("Supabase Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}