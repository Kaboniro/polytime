import { labelFor, LINK_CATEGORIES } from "@/lib/constants";
import { linkDomain } from "@/lib/links";

// Each link category has its own solid color, clearly different from the
// others, so a card's color says what kind of resource it is and the Links
// page can filter by it (its tabs use the same colors). The first four are the
// site palette (grapefruit pink, light sea green, cerulean, apricot cream);
// violet, leaf green and slate are complementary additions. `ink` is the text
// colour on that fill (dark or white, whichever passes 4.5:1); `edge` a deeper
// shade for the border and hover shadow. Text on the cards is always full
// strength: faded text on a solid colour falls below readable contrast.
export const LINK_COLORS = {
  community: { fill: "#fe6d73", edge: "#d9545a", ink: "#1f2933" },
  tool: { fill: "#17c3b2", edge: "#0f998b", ink: "#1f2933" },
  software: { fill: "#227c9d", edge: "#185a73", ink: "#ffffff" },
  "asset-library": { fill: "#ffcb77", edge: "#e0a43c", ink: "#1f2933" },
  tutorial: { fill: "#7a5cc7", edge: "#5b42a3", ink: "#ffffff" },
  "job-board": { fill: "#7cc46a", edge: "#5a9a4a", ink: "#1f2933" },
  other: { fill: "#4f5d6b", edge: "#36414c", ink: "#ffffff" },
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
      style={{ "--card-fill": c.fill, "--card-edge": c.edge, color: c.ink }}
      className="group flex flex-col gap-2 rounded-2xl border-2 border-[var(--card-edge)] bg-[var(--card-fill)] p-5 no-underline transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:-rotate-[0.35deg] hover:shadow-[5px_5px_0_var(--color-ink)] focus-visible:-translate-y-1 focus-visible:-rotate-[0.35deg] focus-visible:shadow-[5px_5px_0_var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-orange-500 motion-reduce:!transform-none"
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
        <h3 className="min-w-0 font-semibold leading-snug">{l.title}</h3>
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-wide">{labelFor(LINK_CATEGORIES, l.category)}</span>
      {l.description && <p className="text-sm">{l.description}</p>}
      <div className="mt-auto flex items-center justify-between gap-3 pt-1 text-sm">
        <span className="truncate text-xs">{domain}</span>
        <span className="shrink-0 font-semibold group-hover:underline">
          Visit <span aria-hidden="true">↗</span>
        </span>
      </div>
    </a>
  );
}
