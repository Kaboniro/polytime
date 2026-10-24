"use client";

import { usePathname } from "next/navigation";

// Plain <a> (not next/link) on purpose — see FilterBar.js's note on why this
// site avoids client-side routing. usePathname only marks the current page.
// `onDark`: for the public header's midnight-violet band (cream text).
export default function NavLinks({ items, onDark = false }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap items-center justify-center gap-1 text-sm">
      {items.map((n) => {
        const exact = n.exact ?? n.href === "/";
        const active = exact ? pathname === n.href : pathname.startsWith(n.href);
        return (
          <a
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
              active
                ? "bg-orange-500 text-black"
                : onDark
                  ? "text-cream/85 hover:bg-cream/10 hover:text-cream"
                  : "text-neutral-300 hover:bg-neutral-800 hover:text-neutral-50"
            }`}
          >
            {n.label}
          </a>
        );
      })}
    </nav>
  );
}
