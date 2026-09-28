import crypto from "crypto";

// No auth library (e.g. NextAuth) on purpose: this site has exactly one
// admin account, so a full auth system is unneeded complexity and attack
// surface. Instead: a password checked against an env var, and a signed
// cookie so the server can trust "this visitor already entered the
// password" without a session database. The signature (HMAC-SHA256) means
// a visitor can read the cookie's contents but cannot forge one, because
// they don't have ADMIN_SECRET.
const COOKIE_NAME = "cg_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 2 weeks

function getSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SECRET is not set. Add it to .env.local before using admin login."
    );
  }
  return secret;
}

function sign(value) {
  const secret = getSecret();
  const h = crypto.createHmac("sha256", secret).update(value).digest("hex");
  return `${value}.${h}`;
}

function verify(token) {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx === -1) return false;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = sign(value).split(".")[1];
  try {
    return (
      value === "admin" &&
      crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    );
  } catch {
    return false;
  }
}

export function checkPassword(password) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) {
    throw new Error(
      "ADMIN_PASSWORD is not set. Add it to .env.local before using admin login."
    );
  }
  if (password.length !== real.length) return false;
  return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(real));
}

export function makeSessionCookie() {
  return {
    name: COOKIE_NAME,
    value: sign("admin"),
    options: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    },
  };
}

export function clearedCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    },
  };
}

export function isAdminRequest(cookieStore) {
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verify(token);
}

export const COOKIE = COOKIE_NAME;

// ---- Step 1 of 2: "password was right, now prove the emailed code" ----
// A separate, short-lived cookie that only says which sign-in challenge this
// browser started. It is NOT a session: isAdminRequest() reads a different
// cookie and only accepts the value "admin", so this can never open the panel.
const PENDING_COOKIE = "cg_admin_pending";
const PENDING_SECONDS = 15 * 60;
const pendingOptions = (maxAge) => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge,
});

export function makePendingCookie(challengeId) {
  return { name: PENDING_COOKIE, value: sign(`pending:${challengeId}`), options: pendingOptions(PENDING_SECONDS) };
}

export function clearedPendingCookie() {
  return { name: PENDING_COOKIE, value: "", options: pendingOptions(0) };
}

// The challenge id in this browser's pending cookie, or null if absent or forged.
export function readPendingChallenge(cookieStore) {
  const token = cookieStore.get(PENDING_COOKIE)?.value;
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx === -1) return null;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  try {
    const expected = sign(value).split(".")[1];
    if (!value.startsWith("pending:") || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return value.slice("pending:".length);
}
