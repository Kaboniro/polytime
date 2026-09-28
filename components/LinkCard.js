import Badge from "@/components/Badge";
import { labelFor, LINK_CATEGORIES } from "@/lib/constants";

// Each card gets its own color from the site palette (grapefruit-pink,
// light-sea-green, cerulean, apricot-cream): a soft tint for the fill and the
// full color for the border and hover shadow. Colors cycle by position, so
// neighbouring cards in the 3-column grid always differ. Fixed values rather
// than theme tokens on purpose: these are the palette's own hues, and the
// tints must stay light whatever the neutral scale does.
const CARD_COLORS = [
  { fill: "#ffe3e4", edge: "#fe6d73" },
  { fill: "#d2f4ef", edge: "#17c3b2" },
  { fill: "#d6e8f0", edge: "#227c9d" },
  { fill: "#fff1d6", edge: "#ffcb77" },
];

// Same rounded + hover-tilt-and-shadow treatment as EventCard
// (components/polytime-ui).
export default function LinkCard({ l, index = 0 }) {
  const c = CARD_COLORS[index % CARD_COLORS.length];
  return (
    <a
      href={l.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ "--card-fill": c.fill, "--card-edge": c.edge }}
      className="group flex flex-col gap-2 rounded-2xl border-2 border-[var(--card-edge)] bg-[var(--card-fill)] p-5 no-underline transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:-rotate-[0.35deg] hover:shadow-[5px_5px_0_var(--card-edge)] focus-visible:-translate-y-1 focus-visible:-rotate-[0.35deg] focus-visible:shadow-[5px_5px_0_var(--card-edge)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-orange-500 motion-reduce:!transform-none"
    >
      <h3 className="font-semibold text-neutral-50">{l.title}</h3>
      <Badge>{labelFor(LINK_CATEGORIES, l.category)}</Badge>
      {l.description && <p className="text-sm text-neutral-300">{l.description}</p>}
      <span className="truncate text-xs text-neutral-500">{l.url}</span>
    </a>
  );
}
