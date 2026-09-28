import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/adminGuard";
import { getResource } from "@/lib/resources";
import { listAll } from "@/lib/adminQueries";
import ResourceTable from "@/components/admin/ResourceTable";
import HeadingInfo from "@/components/HeadingInfo";

export const dynamic = "force-dynamic";

export default async function AdminResourcePage({ params }) {
  await requireAdminPage();
  const { table } = await params;
  const resource = getResource(table);
  if (!resource) notFound();

  const rows = listAll(table);

  // Participants lives as a plain column on events (see lib/resources.js),
  // not a separate resource — this one-line total is the only aggregate
  // treatment it gets, so tracking it doesn't need its own tab/page.
  let participantsNote = null;
  if (table === "events") {
    const tracked = rows.filter((r) => r.participants != null);
    if (tracked.length > 0) {
      const total = tracked.reduce((sum, r) => sum + r.participants, 0);
      participantsNote = `${total.toLocaleString()} total participants across ${tracked.length} of ${rows.length} events with a count entered.`;
    }
  }

  return (
    <div>
      <HeadingInfo as="h1" title={resource.plural} className={participantsNote ? "mb-1" : "mb-6"}>
        Everything in the database, whatever its status. Only approved rows appear on the public site.
      </HeadingInfo>
      {participantsNote && <p className="text-neutral-500 text-sm mb-6 mt-1">{participantsNote}</p>}
      <ResourceTable table={table} resource={resource} rows={rows} />
    </div>
  );
}
