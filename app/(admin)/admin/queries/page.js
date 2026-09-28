import { requireAdminPage } from "@/lib/adminGuard";
import { getQueries } from "@/lib/queries";
import HeadingInfo from "@/components/HeadingInfo";
import QueryList from "@/components/admin/QueryList";

export const dynamic = "force-dynamic";

export default async function QueriesPage() {
  await requireAdminPage();
  const queries = getQueries();
  const open = queries.filter((q) => q.status === "open").length;

  return (
    <div>
      <div className="mb-6">
        <HeadingInfo as="h1" title={`Queries (${open} open)`}>
          Messages from the public Query form: content removal requests, corrections and questions.
          Nothing here is shown publicly. If a removal request is valid, delete or reject the event or
          link in its own tab, then mark the message resolved.
        </HeadingInfo>
      </div>
      <QueryList queries={queries} />
    </div>
  );
}
