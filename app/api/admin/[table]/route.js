import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminGuard";
import { getResource } from "@/lib/resources";
import { validateResource } from "@/lib/resourceValidate";
import { insertRow } from "@/lib/adminQueries";

// POST /api/admin/{events|links}: create a row (any status, so the
// admin can publish directly instead of going through the review queue).
export async function POST(req, ctx) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { table } = await ctx.params;
  if (!getResource(table)) return NextResponse.json({ error: "Unknown table." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const result = validateResource(table, body);
  if (result.errors) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", errors: result.errors }, { status: 400 });
  }

  const id = insertRow(table, result.values);
  return NextResponse.json({ ok: true, id }, { status: 201 });
}
