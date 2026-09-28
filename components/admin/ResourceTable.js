"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/Badge";
import GeoIcon from "@/components/GeoIcon";
import Pagination from "@/components/Pagination";
import { fieldOptions, STATUS_OPTIONS } from "@/lib/resources";
import { geographyIconInfo, geographyLabel } from "@/lib/geography";

const STATUS_TONE = { approved: "green", pending: "orange", rejected: "neutral", archived: "neutral" };
const todayIso = () => new Date().toISOString().slice(0, 10);
// A finished event: its end date (or start date, if it has no end) is before today.
const isPast = (row) => {
  const d = row.end_date || row.start_date;
  return Boolean(d) && d < todayIso();
};
const cell = "border border-neutral-700 px-3 py-2 align-top";
const smallBtn = "text-xs px-2 py-1 disabled:opacity-50";
const controlClass =
  " border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500";
const PAGE_SIZE = 25;

// Every row of one table, whatever its status, with search, a status filter,
// and per-row edit / approve / reject / delete. The server page hands over the
// rows; after each action router.refresh() re-reads them, and the search and
// filter state here survives that because the component stays mounted.
export default function ResourceTable({ table, resource, rows }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState(null);
  const [page, setPage] = useState(1);

  const fieldByName = Object.fromEntries(resource.fields.map((f) => [f.name, f]));
  const needle = query.trim().toLowerCase();
  const visible = rows.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (!needle) return true;
    // Match against what's actually on screen, not just the raw stored value
    // — a select field's value ("country:US") wouldn't otherwise match what
    // the column displays ("United States").
    return resource.fields.some((f) => {
      const raw = r[f.name];
      if (String(raw ?? "").toLowerCase().includes(needle)) return true;
      if (f.name === "geography") return geographyLabel(raw).toLowerCase().includes(needle);
      if (f.type === "select") return (fieldOptions(f).find((o) => o.value === raw)?.label || "").toLowerCase().includes(needle);
      return false;
    });
  });

  // A new search/filter can easily leave `page` pointing past the end of the
  // now-shorter result set — reset to the start rather than land on a blank
  // page that looks like a bug.
  useEffect(() => {
    setPage(1);
  }, [needle, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function display(row, name) {
    const f = fieldByName[name];
    const v = row[name];
    if (v == null || v === "") return <span className="text-neutral-600">—</span>;
    if (name === "status") return <Badge tone={STATUS_TONE[v]}>{v}</Badge>;
    if (name === "geography")
      return (
        <span className="inline-flex items-center gap-1.5">
          <GeoIcon info={geographyIconInfo(v)} /> {geographyLabel(v)}
        </span>
      );
    if (f?.type === "select") return fieldOptions(f).find((o) => o.value === v)?.label ?? v;
    if (f?.type === "url") return <span className="block max-w-[16rem] truncate">{v}</span>;
    // Only fields explicitly marked as a count get thousands separators — a
    // blanket rule on every type:"number" field would also reformat "year"
    // into "2,026", which is wrong for an identifier, not a quantity.
    if (f?.type === "number" && f.format === "count") return v.toLocaleString();
    return String(v);
  }

  async function act(row, action) {
    const label = row[resource.titleField];
    if (action === "delete" && !window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setBusyId(row.id);
    setMessage(null);
    const res =
      action === "delete"
        ? await fetch(`/api/admin/${table}/${row.id}`, { method: "DELETE" })
        : await fetch("/api/admin/moderate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ table, id: row.id, action }),
          });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage(res.status === 401 ? "Your session expired — log in again." : data.error || "Something went wrong.");
    }
    setBusyId(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <a
          href={`/admin/${table}/new`}
          className="bg-orange-500 hover:bg-orange-400 text-black font-medium px-4 py-2 text-sm transition-colors"
        >
          + New {resource.singular}
        </a>
        <label className="block">
          <span className="block text-xs text-neutral-500 mb-1">Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${resource.plural.toLowerCase()}…`}
            className={`${controlClass} w-56`}
          />
        </label>
        <label className="block">
          <span className="block text-xs text-neutral-500 mb-1">Status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={controlClass}>
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.value[0].toUpperCase() + o.value.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <p className="pb-2 text-xs text-neutral-500">
          {visible.length === 0
            ? `Showing 0 of ${rows.length}`
            : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, visible.length)} of ${visible.length}`}
          {visible.length !== rows.length && ` (${rows.length} total)`}
        </p>
      </div>

      {message && (
        <p role="alert" className="mb-3 text-sm text-red-400">
          {message}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="border border-dashed border-neutral-800 p-10 text-center text-neutral-500">
          No {resource.plural.toLowerCase()} yet.{" "}
          <a href={`/admin/${table}/new`} className="text-orange-400 hover:underline">
            Add the first one.
          </a>
        </div>
      ) : visible.length === 0 ? (
        <div className="border border-dashed border-neutral-800 p-10 text-center text-neutral-500">
          Nothing matches that search.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-neutral-700">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="bg-black text-left text-xs uppercase tracking-wide text-white">
                {resource.listColumns.map((name) => (
                  <th
                    key={name}
                    scope="col"
                    className={`border border-neutral-700 px-3 py-2 font-semibold ${fieldByName[name]?.type === "number" ? "text-right" : ""}`}
                  >
                    {fieldByName[name].label}
                  </th>
                ))}
                <th scope="col" className="border border-neutral-700 px-3 py-2 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => {
                const busy = busyId === row.id;
                return (
                  <tr key={row.id} className={`${i % 2 === 0 ? "bg-neutral-950" : "bg-neutral-900"} hover:bg-neutral-800`}>
                    {resource.listColumns.map((name) => (
                      <td
                        key={name}
                        className={`${cell} ${name === resource.titleField ? "font-medium" : ""} ${
                          fieldByName[name]?.type === "number" ? "text-right tabular-nums" : ""
                        }`}
                      >
                        {name === resource.titleField ? (
                          <a href={`/admin/${table}/${row.id}`} className="text-orange-400 hover:underline">
                            {row[name]}
                          </a>
                        ) : (
                          display(row, name)
                        )}
                      </td>
                    ))}
                    <td className={cell}>
                      <div className="flex flex-wrap gap-1.5">
                        <a
                          href={`/admin/${table}/${row.id}`}
                          className={`${smallBtn} bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-50`}
                        >
                          Edit
                        </a>
                        {row.status !== "approved" && row.status !== "archived" && (
                          <button
                            disabled={busy}
                            onClick={() => act(row, "approve")}
                            className={`${smallBtn} bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25`}
                          >
                            Approve
                          </button>
                        )}
                        {table === "events" && row.status === "archived" && (
                          <button
                            disabled={busy}
                            onClick={() => act(row, "unarchive")}
                            className={`${smallBtn} bg-neutral-800 text-neutral-300 hover:bg-neutral-700`}
                          >
                            Unarchive
                          </button>
                        )}
                        {table === "events" && row.status === "approved" && isPast(row) && (
                          <button
                            disabled={busy}
                            onClick={() => act(row, "archive")}
                            title="Hide this finished event from the public site (kept here, and the crawler won't re-add it)"
                            className={`${smallBtn} bg-neutral-800 text-neutral-300 hover:bg-neutral-700`}
                          >
                            Archive
                          </button>
                        )}
                        {row.status !== "rejected" && row.status !== "archived" && (
                          <button
                            disabled={busy}
                            onClick={() => act(row, "reject")}
                            className={`${smallBtn} bg-neutral-800 text-neutral-300 hover:bg-neutral-700`}
                          >
                            Reject
                          </button>
                        )}
                        <button
                          disabled={busy}
                          onClick={() => act(row, "delete")}
                          className={`${smallBtn} bg-red-500/15 text-red-400 hover:bg-red-500/25`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
