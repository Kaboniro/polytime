import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearedPendingCookie, makeSessionCookie, readPendingChallenge } from "@/lib/auth";
import { checkCode } from "@/lib/adminLogin";
import { clientIp, rateLimited } from "@/lib/rateLimit";

// Step 2 of 2: the emailed code. Right code => the real admin session cookie.
// The response for a miss carries `attempt` / `attemptsLeft` so the page can
// react; it never says anything about what the code was.
export async function POST(req) {
  if (rateLimited(`verify:${clientIp(req)}`, 30, 15 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Wait a few minutes." }, { status: 429 });
  }
  const id = readPendingChallenge(await cookies());
  if (!id) return NextResponse.json({ error: "missing" }, { status: 401 });

  const { code } = (await req.json().catch(() => ({}))) || {};
  const result = checkCode(id, code);

  if (result.ok) {
    const session = makeSessionCookie();
    const gone = clearedPendingCookie();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(session.name, session.value, session.options);
    res.cookies.set(gone.name, gone.value, gone.options);
    return res;
  }
  return NextResponse.json(result, { status: 401 });
}
