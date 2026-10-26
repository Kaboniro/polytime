import { Nunito } from "next/font/google";
import "../globals.css";
// GeoIcon renders real flag SVGs (see app/(site)/layout.js's note) and is
// also used here — the Events admin table and the Activity page's location
// table both show a country flag next to geography values.
import "flag-icons/css/flag-icons.min.css";
import { cookies } from "next/headers";
import { isAdminRequest } from "@/lib/auth";
import LogoutClient from "@/components/LogoutClient";
import NavLinks from "@/components/NavLinks";
import { HexClockLogo } from "@/components/polytime-ui";

const ADMIN_NAV = [
  { href: "/admin", label: "Review queue", exact: true },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/links", label: "Links" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/activity", label: "Activity" },
];

// Same font as the public site (app/(site)/layout.js) — one typeface site-
// wide, not just on the public pages.
const nunito = Nunito({ subsets: ["latin"], variable: "--font-sans-ui", display: "swap" });

export const metadata = {
  title: "Admin — PolyTime",
  // Never indexed, and not followed: this whole area is private.
  robots: { index: false, follow: false },
};

// A separate root layout from app/(site)/layout.js (see that file's note) —
// no public nav, footer, or cookie banner here, just this panel. The login
// page renders inside this same shell before a session exists, so the top
// bar is the only thing shown unconditionally; everything nav-related below
// it only appears once isAdminRequest confirms a real session, not just
// because the visitor is somewhere under /admin.
export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const authed = isAdminRequest(cookieStore);

  return (
    <html lang="en" className={nunito.variable}>
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
          <div className="mx-auto flex min-h-16 max-w-[1760px] flex-wrap items-center justify-between gap-x-4 px-4 py-2 sm:px-6">
            <a href={authed ? "/admin" : "/"} className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <HexClockLogo size={28} />
              PolyTime
              <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-black">Admin</span>
            </a>
            <div className="flex flex-wrap items-center gap-1">
              {authed && <NavLinks items={ADMIN_NAV} />}
              <a href="/" className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-50">
                Public site ↗
              </a>
              {authed && <LogoutClient />}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1760px] px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
