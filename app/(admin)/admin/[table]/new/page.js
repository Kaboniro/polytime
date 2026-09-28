import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/adminGuard";
import { emptyValues, getResource } from "@/lib/resources";
import ResourceForm from "@/components/admin/ResourceForm";

export const dynamic = "force-dynamic";

export default async function NewResourcePage({ params }) {
  await requireAdminPage();
  const { table } = await params;
  const resource = getResource(table);
  if (!resource) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-50 mb-1">New {resource.singular}</h1>
      <p className="text-neutral-400 text-sm mb-6">
        Added as Approved by default, so it goes live immediately. Set Status to Pending to keep it hidden.
      </p>
      <ResourceForm table={table} resource={resource} initial={emptyValues(resource)} />
    </div>
  );
}
