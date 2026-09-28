"use client";

// Two ways to move between pages, one component: pass `basePath` (+
// optional `query`, the *other* current filter values as plain
// strings — never a function, which a Server Component can't hand a
// Client Component at all) for a server-driven list, where the page number
// lives in the URL like FilterBar's own filters — a real navigation, not
// client-side routing, consistent with why this site avoids that elsewhere.
// Or pass `onChange(page)` for a purely client-side list (admin's
// ResourceTable, whose search/status filters are already local state, not
// URL state). Renders nothing once everything fits on one page.
export default function Pagination({ page, totalPages, basePath, query = {}, onChange }) {
  if (totalPages <= 1) return null;

  function hrefForPage(targetPage) {
    const params = new URLSearchParams(query);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const itemClass = (disabled) =>
    `px-3 py-1.5 text-sm border border-neutral-700 text-neutral-300 hover:bg-neutral-800 ${
      disabled ? "pointer-events-none opacity-40" : ""
    }`;

  function Item({ targetPage, disabled, children }) {
    if (basePath) {
      return (
        <a href={disabled ? undefined : hrefForPage(targetPage)} aria-disabled={disabled} className={itemClass(disabled)}>
          {children}
        </a>
      );
    }
    return (
      <button type="button" disabled={disabled} onClick={() => onChange(targetPage)} className={itemClass(disabled)}>
        {children}
      </button>
    );
  }

  return (
    <nav aria-label="Pagination" className="mt-4 flex flex-wrap items-center gap-2">
      <Item targetPage={page - 1} disabled={page <= 1}>
        ‹ Prev
      </Item>
      <span className="px-2 text-sm text-neutral-500">
        Page {page} of {totalPages}
      </span>
      <Item targetPage={page + 1} disabled={page >= totalPages}>
        Next ›
      </Item>
    </nav>
  );
}
