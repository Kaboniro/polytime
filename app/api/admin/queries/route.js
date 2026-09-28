import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminGuard";
import getDb from "@/lib/db";

// Admin actions on Query form messages: mark resolved / reopen / delete.
export async function POST(req) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id, action } = (await req.json().catch(() => ({}))) || {};
  const rowId = Number(id);
  if (!Number.isInteger(rowId)) return NextResponse.json({ error: "Bad id." }, { status: 400 });

  const db = getDb();
  if (action === "resolve" || action === "reopen") {
    db.prepare("UPDATE queries SET status = ? WHERE id = ?").run(action === "resolve" ? "resolved" : "open", rowId);
  } else if (action === "delete") {
    db.prepare("DELETE FROM queries WHERE id = ?").run(rowId);
  } else {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
