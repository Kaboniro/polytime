import { requireAdminPage } from "@/lib/adminGuard";
import { getSubmissions } from "@/lib/queries";
import HeadingInfo from "@/components/HeadingInfo";
import AutoRefresh from "@/components/admin/AutoRefresh";
import SubmissionList from "@/components/admin/SubmissionList";
import { SUBMISSION_TAGS as TAGS } from "@/lib/constants";

export const dynamic = "force-dynamic";

// Everything visitors send through the public forms, in one list: suggested
// events and links (until approved or rejected) and Query messages. The
// crawler's finds stay on the review queue.
export default async function SubmissionsPage({ searchParams }) {
  await requireAdminPage();
  const sp = await searchParams;
  const all = getSubmissions();
  const type = TAGS[sp?.type] ? sp.type : "all";
  const shown = type === "all" ? all : all.filter((s) => s.kind === type);
  const open = all.filter((s) => s.open).length;
  const count = (kind) => all.filter((s) => s.kind === kind && s.open).length;

  const chips = [
    { key: "all", label: "All", n: open, href: "/admin/submissions" },
    ...Object.entries(TAGS).map(([key, t]) => ({ key, label: t.plural, n: count(key), href: `/admin/submissions?type=${key}` })),
  ];

  return (
    <div>
      <AutoRefresh />
      <div className="mb-6">
        <HeadingInfo as="h1" title={`Submissions (${open} open)`}>
          Everything sent through the public site&apos;s forms: suggested events and links, and messages from the
          Query form (removal requests, corrections, questions). Approving an event or link publishes it and moves it
          to its Events / Links tab. Nothing here is shown publicly until you approve it.
        </HeadingInfo>
      </div>
      <nav aria-label="Submission types" className="mb-5 flex flex-wrap gap-2">
        {chips.map((c) => (
          <a
            key={c.key}
            href={c.href}
            aria-current={c.key === type ? "page" : undefined}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              c.key === type
                ? "border-neutral-50 bg-neutral-50 font-semibold text-neutral-950"
                : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            {c.label} <span className="ml-1 text-xs opacity-80">{c.n}</span>
          </a>
        ))}
      </nav>
      <SubmissionList items={shown} />
    </div>
  );
}
