import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "backend", "data", "content.json");

export async function readContent() {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

export async function writeContent(data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  return data;
}
