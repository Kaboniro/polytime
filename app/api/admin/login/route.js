import { NextResponse } from "next/server";
import { checkPassword, makePendingCookie } from "@/lib/auth";
import { CODE_MINUTES, createChallenge, discardChallenge } from "@/lib/adminLogin";
import { sendAdminCode } from "@/lib/mail";
import { clientIp, rateLimited } from "@/lib/rateLimit";

// Step 1 of 2. A correct password does NOT log you in: it emails a one-time
// code and hands the browser a pending cookie for /admin/verify. Only a
// correct code (app/api/admin/verify) sets the real session cookie.
export async function POST(req) {
  if (rateLimited(`login:${clientIp(req)}`, 8, 15 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Wait a few minutes and try again." }, { status: 429 });
  }

  const { password } = (await req.json().catch(() => ({}))) || {};
  let ok = false;
  try {
    ok = typeof password === "string" && password.length > 0 && checkPassword(password);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
  if (!ok) {
    await new Promise((r) => setTimeout(r, 300)); // small brake on guessing
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  let challenge;
  try {
    challenge = createChallenge();
    const mail = await sendAdminCode(challenge.code, CODE_MINUTES);
    const cookie = makePendingCookie(challenge.id);
    const res = NextResponse.json({ ok: true, next: "/admin/verify", devMode: mail.dev });
    res.cookies.set(cookie.name, cookie.value, cookie.options);
    return res;
  } catch (e) {
    if (challenge) discardChallenge(challenge.id);
    console.error("[admin login] could not send the sign-in code:", e.message);
    return NextResponse.json({ error: `Couldn't send the sign-in email. ${e.message}` }, { status: 502 });
  }
}
