"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QueryItem } from "@/components/admin/QueryList";
import { SUBMISSION_TAGS as TAGS } from "@/lib/constants";

function Tag({ kind }) {
  const t = TAGS[kind];
  return <span className={`mr-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${t.className}`}>{t.label}</span>;
}

// Submitted URLs are untrusted — only link out to plain http(s) addresses.
function safeUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");

// A suggested event or link, with the same decisions as the review queue.
function EntryItem({ item }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const table = item.kind === "event" ? "events" : "links";
  const siteUrl = safeUrl(item.url);

  async function act(action) {
    if (action === "delete" && !window.confirm(`Delete "${item.title}"? This can't be undone.`)) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, id: item.id, action }),
    });
    if (!res.ok) setError("Couldn't save that change. Try again.");
    setBusy(false);
    router.refresh();
  }

  const details =
    item.kind === "event"
      ? [item.event_type, item.category, item.software, [item.start_date, item.end_date].filter(Boolean).join(" → "), item.host]
      : [item.category];
  const btn = "text-xs px-2.5 py-1.5 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-50";

  return (
    <li className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Tag kind={item.kind} />
          <h3 className="mt-1 font-semibold text-neutral-50">{item.title}</h3>
          <p className="text-xs text-neutral-500">{item.created_at} (UTC)</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
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
          <a href={`/admin/${table}/${item.id}`} className={btn}>
            Edit
          </a>
          <button
            disabled={busy}
            onClick={() => act("approve")}
            className="text-xs px-2.5 py-1.5 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
          >
            Approve
          </button>
          <button disabled={busy} onClick={() => act("reject")} className={btn}>
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

      <p className="mt-2 text-xs text-neutral-400">{details.filter(Boolean).join(" · ")}</p>
      {item.description && <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-neutral-200">{item.description}</p>}

      <dl className="mt-3 space-y-1 text-xs text-neutral-400">
        {siteUrl && (
          <div className="flex gap-2">
            <dt className="text-neutral-500">Link</dt>
            <dd className="min-w-0 truncate">{siteUrl}</dd>
          </div>
        )}
        {item.submitter_note && (
          <div className="flex gap-2">
            <dt className="text-neutral-500">Note</dt>
            <dd className="italic">&ldquo;{item.submitter_note}&rdquo;</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="text-neutral-500">From</dt>
          <dd>
            {isEmail(item.submitted_by) ? (
              <a
                href={`mailto:${item.submitted_by}?subject=${encodeURIComponent("Re: " + item.title)}`}
                className="text-orange-400 hover:underline"
              >
                {item.submitted_by}
              </a>
            ) : (
              <span className="text-neutral-500">{item.submitted_by || "no contact given"}</span>
            )}
          </dd>
        </div>
      </dl>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </li>
  );
}

export default function SubmissionList({ items }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-800 p-10 text-center text-neutral-500">
        Nothing here yet.
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((s) =>
        s.kind === "query" ? (
          <QueryItem key={`query-${s.id}`} q={{ ...s, kind: s.queryKind }} tag={<Tag kind="query" />} />
        ) : (
          <EntryItem key={`${s.kind}-${s.id}`} item={s} />
        )
      )}
    </ul>
  );
}
