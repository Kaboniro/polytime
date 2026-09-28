import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readPendingChallenge } from "@/lib/auth";
import { CODE_MINUTES, reissueCode } from "@/lib/adminLogin";
import { sendAdminCode } from "@/lib/mail";

// "Send me a new code": same challenge, fresh code, limited count and pace.
export async function POST() {
  const id = readPendingChallenge(await cookies());
  if (!id) return NextResponse.json({ error: "missing" }, { status: 401 });

  const r = reissueCode(id);
  if (r.error === "wait") return NextResponse.json({ error: "wait", retryInMs: r.retryInMs }, { status: 429 });
  if (r.error) return NextResponse.json({ error: r.error }, { status: r.error === "limit" ? 429 : 401 });

  try {
    const mail = await sendAdminCode(r.code, CODE_MINUTES);
    return NextResponse.json({ ok: true, devMode: mail.dev });
  } catch (e) {
    console.error("[admin login] could not resend the sign-in code:", e.message);
    return NextResponse.json({ error: "send-failed", message: e.message }, { status: 502 });
  }
}
