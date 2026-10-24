"use client";

import { usePathname } from "next/navigation";

// A hand-drawn loop around the current tab: one pen stroke that circles the
// label and overshoots its start, like a quick scribble. pathLength="1" lets
// the scribble-draw keyframes (app/globals.css) draw it in from 0 to 1.
function Scribble() {
  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute -inset-x-2 -inset-y-1.5 h-[calc(100%+0.75rem)] w-[calc(100%+1rem)] overflow-visible"
    >
      <path
        d="M14 9 C 34 3, 74 2, 92 10 C 102 15, 98 30, 80 35 C 58 40, 22 39, 8 31 C -2 25, 3 12, 20 7 C 34 3, 52 4, 60 6"
        pathLength="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        strokeDasharray="1"
        className="animate-[scribble-draw_550ms_ease-out_both] motion-reduce:animate-none"
      />
    </svg>
  );
}

// Plain <a> (not next/link) on purpose — see FilterBar.js's note on why this
// site avoids client-side routing. usePathname only marks the current page.
// `onBand`: the public header's grapefruit-pink band — the current tab gets a
// scribbled loop instead of a filled pill, other tabs a wavy underline on
// hover. Without it (the admin bar) the current tab is a filled pill.
export default function NavLinks({ items, onBand = false }) {
  const pathname = usePathname();
  return (
    <nav className={`flex flex-wrap items-center justify-center text-sm ${onBand ? "gap-x-3 gap-y-1" : "gap-1"}`}>
      {items.map((n) => {
        const exact = n.exact ?? n.href === "/";
        const active = exact ? pathname === n.href : pathname.startsWith(n.href);
        if (onBand) {
          return (
            <a
              key={n.href}
              href={n.href}
              aria-current={active ? "page" : undefined}
              className={`relative px-3 py-1.5 text-ink transition-colors ${
                active ? "font-bold" : "font-medium decoration-wavy decoration-ink/60 underline-offset-[6px] hover:underline"
              }`}
            >
              {active && <Scribble />}
              {n.label}
            </a>
          );
        }
        return (
          <a
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
              active ? "bg-orange-500 text-black" : "text-neutral-300 hover:bg-neutral-800 hover:text-neutral-50"
            }`}
          >
            {n.label}
          </a>
        );
      })}
    </nav>
  );
}
