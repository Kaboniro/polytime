import { requireAdminPage } from "@/lib/adminGuard";
import { getCrawlerStatus, getOpenQueryCount, getPending } from "@/lib/queries";
import AdminQueue from "@/components/AdminQueue";
import CrawlerPanel from "@/components/admin/CrawlerPanel";
import AutoRefresh from "@/components/admin/AutoRefresh";
import HeadingInfo from "@/components/HeadingInfo";

export const dynamic = "force-dynamic";

// Just the queue: items waiting on a decision. Anything already
// approved/rejected lives in its own resource tab (Events / Links) with
// search and a status filter — no need to duplicate it here as a
// "recently reviewed" backlog.
export default async function AdminPage() {
  await requireAdminPage();

  const pending = getPending();
  const crawler = getCrawlerStatus();
  const openQueries = getOpenQueryCount();

  return (
    <div>
      <AutoRefresh />
      <div className="mb-8">
        <HeadingInfo as="h1" title="Review queue">
          Visitor submissions and crawler finds waiting for a decision. Only approved items show up on the public
          pages.
        </HeadingInfo>
      </div>

      {openQueries > 0 && (
        <a
          href="/admin/queries"
          className="mb-6 block rounded-2xl border border-orange-500/60 bg-orange-500/10 px-4 py-3 text-sm text-neutral-100 hover:bg-orange-500/15"
        >
          <strong>{openQueries}</strong> open {openQueries === 1 ? "message" : "messages"} from the Query form (removal requests, corrections, questions) — open Queries →
        </a>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div>
          {/* Visitor submissions first: there are few of them and each is a
              person waiting on an answer, so they never sit below the crawler's finds. */}
          <AdminQueue title="Events from visitors" table="events" rows={pending.events.visitor} highlight />
          <AdminQueue title="Links from visitors" table="links" rows={pending.links.visitor} highlight />
          <AdminQueue title="Events found by the crawler" table="events" rows={pending.events.crawler} />
          {pending.links.crawler.length > 0 && (
            <AdminQueue title="Links found by the crawler" table="links" rows={pending.links.crawler} />
          )}
        </div>
        <aside className="lg:sticky lg:top-6">
          <CrawlerPanel initial={crawler} />
        </aside>
      </div>
    </div>
  );
}
