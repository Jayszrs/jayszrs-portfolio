import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { mergeContent } from "@/backend/lib/content-defaults";

const filePath = path.join(process.cwd(), "backend", "data", "content.json");

let supabaseClient;
let supabaseWriteClient;

function getSupabase() {
  if (supabaseClient !== undefined) return supabaseClient;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  supabaseClient = url && key ? createClient(url, key) : null;
  return supabaseClient;
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

function withLocalFallback(localData, remoteData) {
  const local = mergeContent(localData);
  const remote = mergeContent(remoteData || {});

  function pick(localValue, remoteValue) {
    if (Array.isArray(localValue) || Array.isArray(remoteValue)) {
      return Array.isArray(remoteValue) && remoteValue.length > 0 ? remoteValue : localValue;
    }

    if (
      localValue &&
      remoteValue &&
      typeof localValue === "object" &&
      typeof remoteValue === "object"
    ) {
      const keys = new Set([...Object.keys(localValue), ...Object.keys(remoteValue)]);
      return [...keys].reduce((next, key) => {
        next[key] = pick(localValue[key], remoteValue[key]);
        return next;
      }, {});
    }

    if (typeof remoteValue === "string") {
      return remoteValue.trim() ? remoteValue : localValue;
    }

    return remoteValue ?? localValue;
  }

  return mergeContent(pick(local, remote));
}

export async function readContent() {
  const localContent = await readLocalContent();
  const supabase = getSupabase();

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
