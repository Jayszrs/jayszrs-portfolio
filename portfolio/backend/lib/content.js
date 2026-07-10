import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { mergeContent } from "@/backend/lib/content-defaults";

const filePath = path.join(process.cwd(), "backend", "data", "content.json");

let supabaseClient;

function getSupabase() {
  if (supabaseClient !== undefined) return supabaseClient;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  supabaseClient = url && key ? createClient(url, key) : null;
  return supabaseClient;
}

async function readLocalContent() {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

export async function readContent() {
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from("portfolio_data")
      .select("data")
      .eq("id", 1)
      .single();

    if (!error && data?.data) {
      return mergeContent(data.data);
    }
  }

  return mergeContent(await readLocalContent());
}

export async function writeContent(data) {
  const content = mergeContent(data);
  const supabase = getSupabase();

  if (supabase) {
    const { error } = await supabase
      .from("portfolio_data")
      .upsert({ id: 1, data: content });

    if (error) throw error;
    return content;
  }

  await fs.writeFile(filePath, JSON.stringify(content, null, 2), "utf-8");
  return content;
}
