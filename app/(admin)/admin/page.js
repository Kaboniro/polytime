import { requireAdminPage } from "@/lib/adminGuard";
import { getCrawlerStatus, getOpenSubmissionCount, getPending } from "@/lib/queries";
import AdminQueue from "@/components/AdminQueue";
import CrawlerPanel from "@/components/admin/CrawlerPanel";
import AutoRefresh from "@/components/admin/AutoRefresh";
import HeadingInfo from "@/components/HeadingInfo";

export const dynamic = "force-dynamic";

// Just the crawler's finds waiting on a decision; everything visitors send
// through the public forms goes to the Submissions tab. Anything already
// approved/rejected lives in its own resource tab (Events / Links) with
// search and a status filter — no need to duplicate it here as a
// "recently reviewed" backlog.
export default async function AdminPage() {
  await requireAdminPage();

  const pending = getPending();
  const crawler = getCrawlerStatus();
  const openSubmissions = getOpenSubmissionCount();

  return (
    <div>
      <AutoRefresh />
      <div className="mb-8">
        <HeadingInfo as="h1" title="Review queue">
          Events and links the crawler found, waiting for a decision. Only approved items show up on the public
          pages. Anything visitors send through the site's forms is on the Submissions tab.
        </HeadingInfo>
      </div>

      {openSubmissions > 0 && (
        <a
          href="/admin/submissions"
          className="mb-6 block rounded-2xl border border-orange-500/60 bg-orange-500/10 px-4 py-3 text-sm text-neutral-100 hover:bg-orange-500/15"
        >
          <strong>{openSubmissions}</strong> open {openSubmissions === 1 ? "submission" : "submissions"} from visitors (events, links and queries) — open Submissions →
        </a>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div>
          <AdminQueue title="Pending events" table="events" rows={pending.events} />
          <AdminQueue title="Pending links" table="links" rows={pending.links} />
        </div>
        <aside className="lg:sticky lg:top-6">
          <CrawlerPanel initial={crawler} />
        </aside>
      </div>
    </div>
  );
}
