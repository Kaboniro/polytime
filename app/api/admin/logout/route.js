import { NextResponse } from "next/server";
import { clearedCookie, clearedPendingCookie } from "@/lib/auth";

export async function POST() {
  const cookie = clearedCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  const pending = clearedPendingCookie();
  res.cookies.set(pending.name, pending.value, pending.options);
  return res;
}
