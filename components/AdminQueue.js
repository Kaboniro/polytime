"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LABELS = {
  events: (r) => r.title,
  links: (r) => r.title,
};

const SUBLABELS = {
  events: (r) => [r.event_type, r.category, r.software, r.start_date, r.host].filter(Boolean).join(" · "),
  links: (r) => [r.category, r.url].filter(Boolean).join(" · "),
};

// Submitted URLs are untrusted — only link out to plain http(s) addresses,
// never javascript: or data: ones.
function safeUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

function Row({ table, row }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const siteUrl = safeUrl(row.url);

  async function act(action) {
    setBusy(true);
    await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, id: row.id, action }),
    });
    router.refresh();
  }

  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-neutral-900">
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-100 truncate">{LABELS[table](row)}</p>
        <p className="text-xs text-neutral-500 truncate">{SUBLABELS[table](row)}</p>
        {row.submitted_by === "crawler" ? (
          <span className="mt-1 inline-block rounded-full bg-sky-500/15 px-2 py-0.5 text-[11px] font-semibold text-sky-400">Crawler</span>
        ) : (
          row.submitted_by && <p className="text-xs text-neutral-600">from {row.submitted_by}</p>
        )}
        {row.submitter_note && <p className="text-xs text-neutral-600 italic">"{row.submitter_note}"</p>}
      </div>
      <div className="flex gap-2 shrink-0">
        {siteUrl && (
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={siteUrl}
            className="text-xs px-2.5 py-1.5 bg-sky-500/15 text-sky-400 hover:bg-sky-500/25"
          >
            Visit ↗
          </a>
        )}
        <a
          href={`/admin/${table}/${row.id}`}
          className="text-xs px-2.5 py-1.5 bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
        >
          Edit
        </a>
        <button
          disabled={busy}
          onClick={() => act("approve")}
          className="text-xs px-2.5 py-1.5 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          disabled={busy}
          onClick={() => act("reject")}
          className="text-xs px-2.5 py-1.5 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-50"
        >
          Reject
        </button>
        <button
          disabled={busy}
          onClick={() => act("delete")}
          className="text-xs px-2.5 py-1.5 bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// Only ever rendered with pending rows now (see app/admin/page.js) — approved
// and rejected items live in their own resource tab instead of a read-only
// "recently reviewed" list here.
export default function AdminQueue({ title, table, rows }) {
  if (rows.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-400 mb-2">{title} (0)</h2>
        <p className="text-xs text-neutral-600">Nothing here.</p>
      </div>
    );
  }
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-neutral-400 mb-2">
        {title} ({rows.length})
      </h2>
      <div className="border border-neutral-900 bg-neutral-900/40 px-4">
        {rows.map((r) => (
          <Row key={r.id} table={table} row={r} />
        ))}
      </div>
    </div>
  );
}
