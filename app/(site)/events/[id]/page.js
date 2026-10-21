import { notFound } from "next/navigation";
import Badge from "@/components/Badge";
import GeoIcon from "@/components/GeoIcon";
import JsonLd from "@/components/JsonLd";
import SideImage, { imageForId } from "@/components/SideImage";
import { EVENT_CATEGORIES, labelFor } from "@/lib/constants";
import { fmtDate, fmtDateRange } from "@/lib/dates";
import { eventPhase } from "@/lib/filters";
import { geographyIconInfo, geographyLabel } from "@/lib/geography";
import { getApprovedEventById } from "@/lib/queries";
import { breadcrumbJsonLd, eventDescription, eventJsonLd, eventPath, realLocation } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const e = getApprovedEventById(id);
  if (!e) return { title: "Event not found", robots: { index: false, follow: false } };
  const description = eventDescription(e);
  return {
    title: e.title,
    description,
    alternates: { canonical: eventPath(e) },
    openGraph: { type: "website", title: e.title, description, url: eventPath(e) },
    twitter: { card: "summary_large_image", title: e.title, description },
  };
}

function Fact({ label, children }) {
  if (!children) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-neutral-100">{children}</dd>
    </div>
  );
}

// One approved event on its own page: the thing a search engine (or someone
// sharing a link) can land on directly. Everything shown here is public
// data already visible in the events table — never the submitter's email or notes.
export default async function EventPage({ params }) {
  const { id } = await params;
  const e = getApprovedEventById(id);
  if (!e) notFound();

  const phase = eventPhase(e);
  const range = fmtDateRange(e.start_date, e.end_date);
  const ld = [
    eventJsonLd(e),
    breadcrumbJsonLd([
      { name: "Events", path: "/" },
      { name: e.title, path: eventPath(e) },
    ]),
  ];

  return (
    <div className="flex items-stretch gap-12">
    <article className="w-full max-w-2xl shrink-0">
      <JsonLd data={ld} />
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-neutral-500">
        <a href="/" className="hover:text-neutral-200 hover:underline">All events</a>
        <span aria-hidden="true"> / </span>
        <span>{labelFor(EVENT_CATEGORIES, e.category)}</span>
      </nav>

      <header className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          {phase === "running" && <Badge tone="green">Running</Badge>}
          {phase === "archived" && <Badge tone="neutral">Archived</Badge>}
        </div>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-neutral-50">{e.title}</h1>
        {e.host && <p className="mt-1 text-neutral-400">Hosted by {e.host}</p>}
      </header>

      <dl className="mb-6 grid gap-x-8 gap-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 sm:grid-cols-2">
        <Fact label="When">{range || (e.event_type === "rolling" ? "Rolling — recurring" : e.event_type === "ongoing" ? "Ongoing — no fixed date" : "Dates to be announced")}</Fact>
        <Fact label="Submission deadline">{fmtDate(e.submission_deadline)}</Fact>
        <Fact label="Category">{labelFor(EVENT_CATEGORIES, e.category)}</Fact>
        <Fact label="Where">
          <span className="inline-flex items-center gap-1.5">
            <GeoIcon info={geographyIconInfo(e.geography)} /> {geographyLabel(e.geography)}
          </span>
        </Fact>
        <Fact label="Location">{realLocation(e)}</Fact>
        <Fact label="Software">{e.software}</Fact>
      </dl>

      {e.description && <p className="mb-6 whitespace-pre-line leading-relaxed text-neutral-200">{e.description}</p>}

      {e.url && (
        <a
          href={e.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2.5 font-semibold text-black transition-colors hover:bg-orange-400"
        >
          Visit the official event page <span aria-hidden="true">↗</span>
        </a>
      )}

      <p className="mt-10 text-xs text-neutral-500">
        Spotted something wrong or want this removed? <a href="/submit" className="underline hover:text-neutral-300">Send us a query</a>.
      </p>
    </article>
    <SideImage {...imageForId(e.id)} />
    </div>
  );
}
