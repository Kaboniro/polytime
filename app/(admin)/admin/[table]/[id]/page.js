import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/adminGuard";
import { getResource } from "@/lib/resources";
import { getRow } from "@/lib/adminQueries";
import ResourceForm from "@/components/admin/ResourceForm";

export const dynamic = "force-dynamic";

export default async function EditResourcePage({ params }) {
  await requireAdminPage();
  const { table, id } = await params;
  const resource = getResource(table);
  const rowId = Number(id);
  if (!resource || !Number.isInteger(rowId)) notFound();

  const row = getRow(table, rowId);
  if (!row) notFound();

  // Inputs are controlled strings; null columns become empty strings.
  const initial = Object.fromEntries(resource.fields.map((f) => [f.name, row[f.name] == null ? "" : String(row[f.name])]));

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-50 mb-1">Edit {resource.singular}</h1>
      <div className="text-neutral-500 text-xs mb-6 space-y-0.5">
        <p>Created {row.created_at} (UTC)</p>
        {row.submitted_by && <p>Submitted by {row.submitted_by}</p>}
        {row.submitter_note && <p className="italic">Submitter note: {row.submitter_note}</p>}
      </div>
      <ResourceForm table={table} resource={resource} initial={initial} id={rowId} />
    </div>
  );
}
