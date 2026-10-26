"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUERY_KINDS, labelFor } from "@/lib/constants";

const KIND_TONE = {
  removal: "bg-red-500/15 text-red-400",
  correction: "bg-amber-500/15 text-amber-500",
  question: "bg-sky-500/15 text-sky-400",
  other: "bg-neutral-800 text-neutral-300",
};

// One Query-form message. `tag`: an extra label shown before the kind (the
// Submissions tab's Event / Link / Query tag).
export function QueryItem({ q, tag = null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function act(action) {
    if (action === "delete" && !window.confirm("Delete this message? This can't be undone.")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: q.id, action }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Couldn't save that change. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const resolved = q.status === "resolved";
  const btn = "text-xs px-2.5 py-1.5 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-50";

  return (
    <li className={`rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 ${resolved ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {tag}
          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${KIND_TONE[q.kind] || KIND_TONE.other}`}>
            {labelFor(QUERY_KINDS, q.kind)}
          </span>
          {resolved && <span className="ml-2 text-[11px] font-semibold text-emerald-400">Resolved</span>}
          <h3 className="mt-1 font-semibold text-neutral-50">{q.subject}</h3>
          <p className="text-xs text-neutral-500">{q.created_at} (UTC)</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" disabled={busy} onClick={() => act(resolved ? "reopen" : "resolve")} className={btn}>
            {resolved ? "Reopen" : "Mark resolved"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => act("delete")}
            className="text-xs px-2.5 py-1.5 bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line text-sm text-neutral-200">{q.message}</p>

      <dl className="mt-3 space-y-1 text-xs text-neutral-400">
        {q.page_url && (
          <div className="flex gap-2">
            <dt className="text-neutral-500">About</dt>
            <dd className="min-w-0 truncate">
              <a href={q.page_url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
                {q.page_url}
              </a>
            </dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="text-neutral-500">Reply to</dt>
          <dd>
            {q.contact ? (
              <a
                href={`mailto:${q.contact}?subject=${encodeURIComponent("Re: " + q.subject)}`}
                className="text-orange-400 hover:underline"
              >
                {q.contact}
              </a>
            ) : (
              <span className="text-neutral-500">no contact given</span>
            )}
          </dd>
        </div>
      </dl>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </li>
  );
}

export default function QueryList({ queries }) {
  if (queries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-800 p-10 text-center text-neutral-500">
        No messages yet.
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {queries.map((q) => (
        <QueryItem key={q.id} q={q} />
      ))}
    </ul>
  );
}
