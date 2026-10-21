import GeoIcon from "@/components/GeoIcon";

// The home page's sections: the main EventTable for dated events, and small
// tables for ongoing and rolling entries laid out beside it. Server-only on
// purpose (no "use client"): these tables are plain links to /events/[id],
// and rows arrive already shaped by app/(site)/page.js so only public fields
// are ever rendered.

export function GridSection({ title, count, note, children, className = "" }) {
  return (
    <section className={`min-w-0 ${className}`}>
      <div className="mb-2 flex items-baseline gap-2">
        <h2 className="text-base font-bold text-neutral-50">{title}</h2>
        <span className="text-sm text-neutral-500">{count}</span>
      </div>
      {note && <p className="mb-3 text-xs text-neutral-500">{note}</p>}
      {children}
    </section>
  );
}

const cell = "px-2.5 py-2.5 align-top";

// Compact table for ongoing and rolling entries: no dates to show, so just
// what it is, who runs it and where. Same header/row styling as EventTable.
export function CompactEventTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-800">
      <table className="w-full min-w-[330px] border-collapse text-sm">
        <thead>
          <tr className="bg-neutral-950 text-left text-xs uppercase tracking-wide text-neutral-50">
            <th scope="col" className="w-[48%] border-b-2 border-neutral-50 px-2.5 py-2 font-semibold">Name</th>
            <th scope="col" className="w-[26%] border-b-2 border-neutral-50 px-2.5 py-2 font-semibold">Host</th>
            <th scope="col" className="w-[26%] border-b-2 border-neutral-50 px-2.5 py-2 font-semibold">Where</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-neutral-800 bg-neutral-950 text-neutral-100 last:border-b-0 hover:bg-neutral-900">
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
