import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminGuard";
import { getResource } from "@/lib/resources";
import { validateResource } from "@/lib/resourceValidate";
import { deleteRow, updateRow } from "@/lib/adminQueries";

async function parse(ctx) {
  const { table, id } = await ctx.params;
  const rowId = Number(id);
  if (!getResource(table) || !Number.isInteger(rowId)) return null;
  return { table, id: rowId };
}

// PUT /api/admin/{table}/{id}: replace every editable field of a row.
export async function PUT(req, ctx) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const target = await parse(ctx);
  if (!target) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const result = validateResource(target.table, body);
  if (result.errors) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", errors: result.errors }, { status: 400 });
  }

  if (!updateRow(target.table, target.id, result.values)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/{table}/{id}
export async function DELETE(_req, ctx) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const target = await parse(ctx);
  if (!target || !deleteRow(target.table, target.id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
