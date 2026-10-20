const { createHash, createHmac, randomBytes, timingSafeEqual } = require("node:crypto");
const SESSION_SECONDS = 60 * 60 * 8;

function signingKey() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  return secret ? createHash("sha256").update(`jayszrs-admin-session-v1:${secret}`).digest() : null;
}

function checkAdminPassword(value) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || typeof value !== "string" || value.length > 2048) return false;
  return timingSafeEqual(createHash("sha256").update(value).digest(), createHash("sha256").update(password).digest());
}

function createAdminSession(now = Date.now()) {
  const key = signingKey();
  if (!key || !process.env.ADMIN_PASSWORD) throw new Error("Admin is not configured");
  const issuedAt = Math.floor(now / 1000);
  const payload = Buffer.from(JSON.stringify({ v: 1, iat: issuedAt, exp: issuedAt + SESSION_SECONDS, nonce: randomBytes(16).toString("hex") })).toString("base64url");
  return `${payload}.${createHmac("sha256", key).update(payload).digest("base64url")}`;
}

function verifyAdminSession(value, now = Date.now()) {
  const key = signingKey();
  if (!key || !process.env.ADMIN_PASSWORD || typeof value !== "string" || value.length > 1024) return false;
  const match = /^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]{43})$/.exec(value);
  if (!match) return false;
  const expected = createHmac("sha256", key).update(match[1]).digest();
  const actual = Buffer.from(match[2], "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  try {
    const payload = JSON.parse(Buffer.from(match[1], "base64url").toString("utf8"));
    const time = Math.floor(now / 1000);
    return payload.v === 1 && Number.isSafeInteger(payload.iat) && Number.isSafeInteger(payload.exp)
      && payload.iat <= time + 60 && payload.exp > time && payload.exp - payload.iat === SESSION_SECONDS
      && /^[a-f0-9]{32}$/.test(payload.nonce);
  } catch { return false; }
}

module.exports = { checkAdminPassword, createAdminSession, verifyAdminSession, SESSION_SECONDS };
