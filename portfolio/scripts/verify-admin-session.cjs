const assert = require("node:assert/strict");
const { checkAdminPassword, createAdminSession, verifyAdminSession, SESSION_SECONDS } = require("../backend/lib/admin-session.cjs");
const previous = { password: process.env.ADMIN_PASSWORD, secret: process.env.ADMIN_SESSION_SECRET };
try {
  process.env.ADMIN_PASSWORD = "local-unit-test-password-only";
  delete process.env.ADMIN_SESSION_SECRET;
  const now = Date.now();
  const token = createAdminSession(now);
  assert.ok(checkAdminPassword("local-unit-test-password-only"));
  assert.equal(checkAdminPassword("wrong"), false);
  assert.equal(checkAdminPassword({}), false);
  assert.ok(verifyAdminSession(token, now));
  assert.equal(verifyAdminSession("ok", now), false, "Legacy forgeable cookie must be rejected");
  assert.equal(verifyAdminSession(token.replace(/^./, token[0] === "a" ? "b" : "a"), now), false);
  assert.equal(verifyAdminSession(token, now + SESSION_SECONDS * 1000), false, "Expired session accepted");
  assert.equal(verifyAdminSession(token, now - 120000), false, "Future session accepted");
  assert.notEqual(createAdminSession(now), token, "Sessions must have unique nonces");
  process.env.ADMIN_PASSWORD = "rotated-test-password";
  assert.equal(verifyAdminSession(token, now), false);
  delete process.env.ADMIN_PASSWORD;
  assert.equal(checkAdminPassword("jayszrs123"), false, "Hardcoded default password must not exist");
  assert.equal(verifyAdminSession(token, now), false);
  assert.throws(() => createAdminSession());
  console.log("PASS: signed sessions, expiry, tampering, key rotation, unique nonces, and rejection of legacy/default credentials.");
} finally {
  for (const [key, value] of [["ADMIN_PASSWORD", previous.password], ["ADMIN_SESSION_SECRET", previous.secret]]) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
}
