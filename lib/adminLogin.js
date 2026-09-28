import crypto from "crypto";
import getDb from "@/lib/db";

// The second login step: a one-time code emailed after the password is right.
// Codes are never stored, only an HMAC of them (keyed with ADMIN_SECRET), so
// a leaked database can't be used to log in. A code works once, expires, and
// can be tried a limited number of times.
export const CODE_MINUTES = 10;
export const MAX_ATTEMPTS_PER_CODE = 5;
export const MAX_ATTEMPTS_TOTAL = 10; // across resends, so resending can't reset the guess budget
export const MAX_SENDS = 4;
export const RESEND_WAIT_MS = 30_000;

// 32 symbols with no 0/O/1/I/L lookalikes; 8 of them is 40 bits.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const secret = () => {
  if (!process.env.ADMIN_SECRET) throw new Error("ADMIN_SECRET is not set.");
  return process.env.ADMIN_SECRET;
};
const hash = (id, code) => crypto.createHmac("sha256", secret()).update(`${id}:${code}`).digest("hex");
export const normalizeCode = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

function newCode() {
  return Array.from({ length: 8 }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join("");
}

// Starts a sign-in: returns { id, code }. The code must then be emailed.
export function createChallenge() {
  const db = getDb();
  db.prepare("DELETE FROM admin_login_codes WHERE created_at < ?").run(Date.now() - 24 * 3600_000);
  const id = crypto.randomBytes(16).toString("hex");
  const code = newCode();
  const now = Date.now();
  db.prepare(
    "INSERT INTO admin_login_codes (id, code_hash, created_at, expires_at, last_sent_at) VALUES (?, ?, ?, ?, ?)"
  ).run(id, hash(id, code), now, now + CODE_MINUTES * 60_000, now);
  return { id, code };
}

export function getChallenge(id) {
  if (!/^[0-9a-f]{32}$/.test(id || "")) return null;
  const row = getDb().prepare("SELECT * FROM admin_login_codes WHERE id = ?").get(id);
  return row && !row.consumed ? { ...row } : null;
}

export function discardChallenge(id) {
  getDb().prepare("DELETE FROM admin_login_codes WHERE id = ?").run(id);
}

// -> { ok: true } | { error: "missing" | "expired" | "locked" | "wrong", attempt, attemptsLeft }
export function checkCode(id, input) {
  const db = getDb();
  const row = getChallenge(id);
  if (!row) return { error: "missing" };
  if (Date.now() > row.expires_at) return { error: "expired" };
  if (row.attempts >= MAX_ATTEMPTS_PER_CODE || row.total_attempts >= MAX_ATTEMPTS_TOTAL) return { error: "locked", attemptsLeft: 0 };

  const given = Buffer.from(hash(id, normalizeCode(input)));
  const real = Buffer.from(row.code_hash);
  if (given.length === real.length && crypto.timingSafeEqual(given, real)) {
    db.prepare("UPDATE admin_login_codes SET consumed = 1 WHERE id = ?").run(id);
    return { ok: true };
  }
  const attempts = row.attempts + 1;
  db.prepare("UPDATE admin_login_codes SET attempts = ?, total_attempts = total_attempts + 1 WHERE id = ?").run(attempts, id);
  const left = Math.max(0, MAX_ATTEMPTS_PER_CODE - attempts);
  const locked = left === 0 || row.total_attempts + 1 >= MAX_ATTEMPTS_TOTAL;
  return { error: locked ? "locked" : "wrong", attempt: attempts, attemptsLeft: locked ? 0 : left };
}

// Issues a fresh code for the same challenge. -> { code } | { error: "wait" | "limit" | "missing", retryInMs? }
export function reissueCode(id) {
  const db = getDb();
  const row = getChallenge(id);
  if (!row) return { error: "missing" };
  if (row.sent_count >= MAX_SENDS || row.total_attempts >= MAX_ATTEMPTS_TOTAL) return { error: "limit" };
  const wait = row.last_sent_at + RESEND_WAIT_MS - Date.now();
  if (wait > 0) return { error: "wait", retryInMs: wait };
  const code = newCode();
  const now = Date.now();
  db.prepare(
    "UPDATE admin_login_codes SET code_hash = ?, expires_at = ?, attempts = 0, sent_count = sent_count + 1, last_sent_at = ? WHERE id = ?"
  ).run(hash(id, code), now + CODE_MINUTES * 60_000, now, id);
  return { code };
}
