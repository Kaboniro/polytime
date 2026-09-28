"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Relative time that is stable across server/client render: only computed
// after mount (see `now` state), so there's no hydration mismatch.
function ago(iso, now) {
  if (!iso || !now) return "—";
  const s = Math.round((now - Date.parse(iso)) / 1000);
  if (s < 0) return "in " + span(-s);
  return s < 5 ? "just now" : span(s) + " ago";
}
function span(s) {
  if (s < 90) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 90) return `${m} min`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h} h` : `${Math.round(h / 24)} d`;
}

export default function CrawlerPanel({ initial }) {
  const router = useRouter();
  const [status, setStatus] = useState(initial);
  const [now, setNow] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showRuns, setShowRuns] = useState(false);
  const lastRunId = useRef(initial.runs[0]?.id);
  const lastAdded = useRef(initial.pendingFromCrawler);

  const apply = useCallback(
    (next) => {
      setStatus(next);
      // A new run finished or the crawler queued items: refresh the queue beside us.
      const runId = next.runs[0]?.id;
      if (runId !== lastRunId.current || next.pendingFromCrawler !== lastAdded.current) {
        lastRunId.current = runId;
        lastAdded.current = next.pendingFromCrawler;
        router.refresh();
      }
    },
    [router]
  );

  useEffect(() => {
    setNow(Date.now());
    const clock = setInterval(() => setNow(Date.now()), 1000);
    const poll = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/crawler", { cache: "no-store" });
        if (res.ok) apply(await res.json());
      } catch {
        // Transient network error: keep showing the last known status.
      }
    }, 5000);
    return () => {
      clearInterval(clock);
      clearInterval(poll);
    };
  }, [apply]);

  async function act(action) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/crawler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong.");
      else apply(data);
    } finally {
      setBusy(false);
    }
  }

  const { state, runs, enabled, searchEnabled, pendingFromCrawler } = status;
  const last = runs.find((r) => r.status !== "running");
  const running = state.online && state.state === "running";

  let label;
  let dot;
  if (!state.online) {
    label = enabled ? "Not running" : "Disabled (CRAWLER_ENABLED=0)";
    dot = "bg-neutral-500";
  } else if (running) {
    label = state.current_note ? `Running — ${state.current_note}` : "Running";
    dot = "bg-emerald-400 animate-pulse";
  } else if (state.paused) {
    label = "Paused";
    dot = "bg-amber-400";
  } else {
    label = now && Date.parse(state.next_run_at) <= now ? "Idle — run due, starting shortly" : `Idle — next run ${ago(state.next_run_at, now)}`;
    dot = "bg-emerald-400";
  }

  const btn =
    "rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800 disabled:opacity-50";

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
        <h2 className="text-sm font-semibold text-neutral-50">Event crawler</h2>
      </div>
      <p className="mt-1 text-xs text-neutral-400" aria-live="polite">{label}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={btn} disabled={busy || !state.online || running} onClick={() => act("run")}>
          Run now
        </button>
        {state.paused ? (
          <button type="button" className={btn} disabled={busy || !state.online} onClick={() => act("resume")}>
            Resume
          </button>
        ) : (
          <button type="button" className={btn} disabled={busy || !state.online} onClick={() => act("pause")}>
            Pause
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <dt className="text-neutral-500">In queue from crawler</dt>
        <dd className="text-right font-medium text-neutral-100">{pendingFromCrawler}</dd>
        <dt className="text-neutral-500">Last run</dt>
        <dd className="text-right text-neutral-200">
          {last ? (last.status === "error" ? "failed" : `${ago(last.finished_at, now)}`) : "none yet"}
        </dd>
        {last && last.status === "ok" && (
          <>
            <dt className="text-neutral-500">Pages read</dt>
            <dd className="text-right text-neutral-200">{last.pages}</dd>
            <dt className="text-neutral-500">Added to queue</dt>
            <dd className="text-right text-neutral-200">{last.added}</dd>
          </>
        )}
      </dl>
      {last?.status === "error" && <p className="mt-2 text-xs text-red-400">{last.error}</p>}

      {!searchEnabled && (
        <p className="mt-3 rounded-lg bg-neutral-800/70 px-3 py-2 text-xs text-neutral-400">
          Web search is off, so only seed sites are scanned. Set <code>SEARXNG_URL</code> (free, self-hosted) or
          <code> BRAVE_API_KEY</code> in <code>.env.local</code> for local-language searches.
        </p>
      )}

      {last?.summary?.unreachable?.length > 0 && (
        <details className="mt-3 text-xs text-neutral-400">
          <summary className="cursor-pointer">{last.summary.unreachable.length} site(s) unreachable last run</summary>
          <ul className="mt-1 space-y-1">
            {last.summary.unreachable.map((u) => (
              <li key={u.host}>
                <span className="text-neutral-200">{u.host}</span> — {u.why}
              </li>
            ))}
          </ul>
        </details>
      )}

      {runs.length > 0 && (
        <div className="mt-3 border-t border-neutral-800 pt-3">
          <button type="button" className="text-xs text-neutral-400 hover:text-neutral-200" onClick={() => setShowRuns((v) => !v)} aria-expanded={showRuns}>
            {showRuns ? "Hide" : "Show"} recent runs
          </button>
          {showRuns && (
            <ul className="mt-2 space-y-1 text-xs text-neutral-400">
              {runs.map((r) => (
                <li key={r.id} className="flex justify-between gap-2">
                  <span>
                    {ago(r.started_at, now)} · {r.trigger}
                  </span>
                  <span className={r.status === "error" ? "text-red-400" : "text-neutral-200"}>
                    {r.status === "running" ? "running" : r.status === "error" ? "failed" : `+${r.added}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
