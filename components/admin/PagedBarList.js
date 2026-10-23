"use client";

import { useState } from "react";
import { BarList } from "@/components/admin/ActivityParts";

// A BarList shown `perPage` rows at a time, so long lists (top pages, flows,
// countries) don't stretch the Activity tab. Paging is local to the card: it
// switches instantly and leaves the rest of the page (range, filters) as is.
// Bars stay scaled to the overall top item, and rows keep their overall rank.
export default function PagedBarList({ items, perPage = 10, ...rest }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(page, pages - 1);
  const start = current * perPage;
  const shown = items.slice(start, start + perPage);
  const max = Math.max(...items.map((i) => i.value), 1);

  const btn =
    "rounded-lg border border-neutral-700 px-2.5 py-1 text-xs text-neutral-300 transition-colors hover:bg-neutral-800 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div>
      <BarList items={shown} max={max} startRank={items.length > perPage ? start + 1 : undefined} {...rest} />
      {items.length > perPage && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-800 pt-3">
          <span className="text-xs tabular-nums text-neutral-500">
            {start + 1}–{Math.min(start + perPage, items.length)} of {items.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button type="button" className={btn} disabled={current === 0} onClick={() => setPage(current - 1)}>
              ‹ Prev
            </button>
            <span className="px-1 text-xs tabular-nums text-neutral-500">
              {current + 1} / {pages}
            </span>
            <button type="button" className={btn} disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
