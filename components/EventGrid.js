import GeoIcon from "@/components/GeoIcon";

// The home page's sections: the main EventTable for dated events, and small
// tables for ongoing and rolling entries laid out beside it. Server-only on
// purpose (no "use client"): these tables are plain links to /events/[id],
// and rows arrive already shaped by app/(site)/page.js so only public fields
// are ever rendered.

// `marker`: a palette colour class for the small square before the title
// (bg-band, bg-go, bg-cerulean) so each section reads at a glance.
export function GridSection({ title, count, note, marker, children, className = "" }) {
  return (
    <section className={`min-w-0 ${className}`}>
      <div className="mb-2 flex items-baseline gap-2">
        {marker && <span className={`inline-block h-3 w-3 shrink-0 self-center rounded-[3px] ${marker}`} aria-hidden="true" />}
        <h2 className="text-xl font-bold text-neutral-50">{title}</h2>
        <span className="text-sm text-neutral-500">{count}</span>
      </div>
      {note && <p className="mb-3 text-xs text-neutral-500">{note}</p>}
      {children}
    </section>
  );
}

const cell = "px-3 py-3 align-top sm:px-4";

// Compact table for ongoing and rolling entries: no dates to show, so just
// what it is, who runs it and where. Same header/row styling as EventTable.
export function CompactEventTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-800">
      <table className="w-full border-collapse text-sm [&>tbody>tr:last-child]:border-b-0">
        <thead>
          <tr className="bg-neutral-900 text-left text-xs text-neutral-500">
            <th scope="col" className="w-[48%] border-b border-neutral-800 px-3 py-2.5 font-medium sm:px-4">Event</th>
            <th scope="col" className="w-[26%] border-b border-neutral-800 px-3 py-2.5 font-medium sm:px-4">Host</th>
            <th scope="col" className="w-[26%] border-b border-neutral-800 px-3 py-2.5 font-medium sm:px-4">Where</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.id}
              className={`border-b border-neutral-800 text-neutral-100 transition-colors hover:bg-neutral-900 ${i % 2 ? "bg-neutral-900/40" : "bg-neutral-950"}`}
            >
              <td className={`${cell} font-medium`}>
                <a href={r.href} className="hover:underline">{r.title}</a>
                <div className="text-xs font-normal text-neutral-500">{r.category}</div>
              </td>
              <td className={`${cell} text-neutral-300`}>{r.host || <span className="text-neutral-600">—</span>}</td>
              <td className={cell}>
                <GeoIcon info={r.geo} /> {r.geoLabel}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
