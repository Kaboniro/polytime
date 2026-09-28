"use client";

import { useState } from "react";

const SIZE = {
  h1: "text-xl font-bold text-neutral-50",
  h2: "text-base font-semibold text-neutral-50",
};

// A heading with its explanatory text collapsed behind an "i" toggle instead
// of always shown — same pattern as the "i" in GanttChart's and WinnerCard's
// modals: a page opens on the heading alone, description on demand.
export default function HeadingInfo({ as = "h1", title, children, className = "" }) {
  const [open, setOpen] = useState(false);
  const Tag = as;

  if (!children) {
    return <Tag className={`${SIZE[as] || SIZE.h1} ${className}`}>{title}</Tag>;
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Tag className={SIZE[as] || SIZE.h1}>{title}</Tag>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Hide description" : "Show description"}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-700 text-xs font-semibold italic text-neutral-400 hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500/60"
        >
          i
        </button>
      </div>
      {open && <div className="mt-2 max-w-2xl text-sm text-neutral-400 space-y-3">{children}</div>}
    </div>
  );
}
