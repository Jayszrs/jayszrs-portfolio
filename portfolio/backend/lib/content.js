import fs from "fs/promises";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { mergeContent, withLocalFallback } from "@/backend/lib/content-defaults";

const filePath = path.join(process.cwd(), "backend", "data", "content.json");

let supabaseClient;
let supabaseFreshClient;
let supabaseWriteClient;

function getSupabase({ fresh = false } = {}) {
  const cached = fresh ? supabaseFreshClient : supabaseClient;
  if (cached !== undefined) return cached;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const client = url && key ? createClient(url, key, {
    global: {
      fetch: (input, init) => fetch(input, {
        ...init,
        ...(fresh ? { cache: "no-store" } : { next: { revalidate: 60, tags: ["portfolio-content"] } }),
      }),
    },
  }) : null;
  if (fresh) supabaseFreshClient = client;
  else supabaseClient = client;
  return client;
}

function getSupabaseWriter() {
  if (supabaseWriteClient !== undefined) return supabaseWriteClient;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  supabaseWriteClient = url && key ? createClient(url, key) : null;
  return supabaseWriteClient;
}

async function readLocalContent() {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

export async function readContent({ fresh = false } = {}) {
  if (fresh) noStore();
  const localContent = await readLocalContent();
  const supabase = getSupabase({ fresh });

  if (supabase) {
    const { data, error } = await supabase
      .from("portfolio_data")
      .select("data")
      .eq("id", 1)
      .single();

    if (!error && data?.data) {
      return withLocalFallback(localContent, data.data);
    }
  }

  return mergeContent(localContent);
}

export async function writeContent(data) {
  const localContent = await readLocalContent();
  const content = withLocalFallback(localContent, data);
  const supabase = getSupabaseWriter();

  if (supabase) {
    const { error } = await supabase
      .from("portfolio_data")
      .upsert({ id: 1, data: content });

    if (error) throw error;
    return content;
  }

  if (process.env.VERCEL) {
    throw new Error("Supabase write key is not configured");
  }

  await fs.writeFile(filePath, JSON.stringify(content, null, 2), "utf-8");
  return content;
}
