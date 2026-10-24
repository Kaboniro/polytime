// A titled section of the home page (Events, Ongoing, Rolling), each holding
// the same EventTable so all three look and behave alike.

// `marker`: a palette colour class for the small square before the title
// (bg-band, bg-go, bg-cerulean) so each section reads at a glance.
// `as="h1"`: the page's main heading (page-title size); sections default to h2.
export function GridSection({ title, count, note, marker, as: Tag = "h2", children, className = "" }) {
  const big = Tag === "h1";
  return (
    <section className={`min-w-0 ${className}`}>
      <div className="mb-3 flex items-baseline gap-2.5">
        {marker && (
          <span className={`inline-block shrink-0 self-center rounded-[3px] ${big ? "h-4 w-4" : "h-3 w-3"} ${marker}`} aria-hidden="true" />
        )}
        <Tag className={`font-bold text-neutral-50 ${big ? "text-3xl tracking-tight" : "text-xl"}`}>{title}</Tag>
        <span className={`text-neutral-500 ${big ? "text-base" : "text-sm"}`}>{count}</span>
      </div>
      {note && <p className="mb-3 text-xs text-neutral-500">{note}</p>}
      {children}
    </section>
  );
}
