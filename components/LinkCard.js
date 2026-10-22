import Badge from "@/components/Badge";
import { labelFor, LINK_CATEGORIES } from "@/lib/constants";
import { linkDomain } from "@/lib/links";

// Each link category has its own color, so a card's color says what kind of
// resource it is and the Links page can filter by it (its tabs use the same
// colors). The first four are the site palette (grapefruit-pink,
// light-sea-green, cerulean, apricot-cream); lavender, green and grey extend
// it to seven. Fixed values rather than theme tokens on purpose: the tints
// must stay light whatever the neutral scale does.
export const LINK_COLORS = {
  community: { fill: "#ffe3e4", edge: "#fe6d73" },
  tool: { fill: "#d2f4ef", edge: "#17c3b2" },
  software: { fill: "#d6e8f0", edge: "#227c9d" },
  "asset-library": { fill: "#fff1d6", edge: "#e8a93a" },
  tutorial: { fill: "#ebe5ff", edge: "#8b6fe0" },
  "job-board": { fill: "#e3f4d7", edge: "#5aa02c" },
  other: { fill: "#eeeeee", edge: "#8a8a8a" },
};

export const linkColor = (category) => LINK_COLORS[category] || LINK_COLORS.other;

// Same rounded + hover-tilt-and-shadow treatment as EventCard
// (components/polytime-ui).
export default function LinkCard({ l }) {
  const c = linkColor(l.category);
  const domain = linkDomain(l.url);
  return (
    <a
      href={l.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ "--card-fill": c.fill, "--card-edge": c.edge }}
      className="group flex flex-col gap-2 rounded-2xl border-2 border-[var(--card-edge)] bg-[var(--card-fill)] p-5 no-underline transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:-rotate-[0.35deg] hover:shadow-[5px_5px_0_var(--card-edge)] focus-visible:-translate-y-1 focus-visible:-rotate-[0.35deg] focus-visible:shadow-[5px_5px_0_var(--card-edge)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-orange-500 motion-reduce:!transform-none"
    >
      <div className="flex items-center gap-3">
        {/* The site's own icon, served from our server (app/api/link-icon). */}
        <img
          src={`/api/link-icon/${domain}?c=${encodeURIComponent(c.edge)}`}
          alt=""
          width={32}
          height={32}
          loading="lazy"
          decoding="async"
          className="h-8 w-8 shrink-0 rounded-lg bg-white object-contain p-0.5 shadow-sm"
        />
        <h3 className="min-w-0 font-semibold leading-snug text-neutral-50">{l.title}</h3>
      </div>
      <Badge>{labelFor(LINK_CATEGORIES, l.category)}</Badge>
      {l.description && <p className="text-sm text-neutral-300">{l.description}</p>}
      <div className="mt-auto flex items-center justify-between gap-3 pt-1 text-sm">
        <span className="truncate text-neutral-500">{domain}</span>
        <span className="shrink-0 font-semibold text-neutral-50 group-hover:underline">
          Visit <span aria-hidden="true">↗</span>
        </span>
      </div>
    </a>
  );
}
