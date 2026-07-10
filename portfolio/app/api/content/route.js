import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// GET: Mengambil data JSON dari database
export async function GET() {
  const { data, error } = await supabase
    .from("portfolio_data") // Sesuai nama tabel baru
    .select("data")
    .eq("id", 1)
    .single();

  if (error || !data || !data.data) {
    // Jika kosong, kembalikan objek kosong. Frontend akan mengurus default-nya.
    return NextResponse.json({});
  }

  // Kembalikan HANYA isi dari kolom 'data'
  return NextResponse.json(data.data);
}

// POST: Menyimpan paket JSON ke database
export async function POST(request) {
  const session = cookies().get("jayszrs_admin");
  if (!session || session.value !== "ok") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Simpan SELURUH body ke dalam satu kolom bernama 'data'
    const { error } = await supabase
      .from("portfolio_data")
      .upsert({
        id: 1,
        data: body // <--- Rahasianya di sini! Semua masuk ke kolom JSONB
      });

    if (error) {
      console.error("Supabase Upsert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API Route Error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}