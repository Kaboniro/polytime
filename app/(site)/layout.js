import { cookies, headers } from "next/headers";
import { Nunito } from "next/font/google";
import "../globals.css";
// Real flag SVGs for the Geography column/filter (see lib/geography.js) —
// not Unicode flag emoji, which Windows renders as bare two-letter text
// instead of a flag picture. Next.js resolves this package's stylesheet and
// the flag images its rules reference into the build automatically, the
// same as importing any other third-party CSS. MIT licensed:
// https://github.com/lipis/flag-icons
import "flag-icons/css/flag-icons.min.css";
import { recordPageView } from "@/lib/analytics";
import { isAdminRequest } from "@/lib/auth";
import CookieConsent from "@/components/CookieConsent";
import JsonLd from "@/components/JsonLd";
import { websiteJsonLd } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, siteUrl } from "@/lib/site";
import CookiePrefsLink from "@/components/CookiePrefsLink";
import NavLinks from "@/components/NavLinks";
import { HexClockLogo } from "@/components/polytime-ui";

// Warm, rounded, still very legible at small sizes — pairs with the
// rounded-corner "playful" accents (components/polytime-ui) and the new
// palette better than a plain system sans would. Wired to --font-sans-ui,
// which app/globals.css's body rule and @theme inline block both read.
const nunito = Nunito({ subsets: ["latin"], variable: "--font-sans-ui", display: "swap" });

// Search engine ownership checks, as <meta> tags on every public page. Set
// only the ones you use in .env.production (the values aren't secret: they
// appear in the page). Google can also verify by DNS instead.
const env = (k) => process.env[k] || undefined;
const verification = {
  google: env("GOOGLE_SITE_VERIFICATION"),
  yandex: env("YANDEX_SITE_VERIFICATION"),
  other: Object.fromEntries(
    [
      ["msvalidate.01", env("BING_SITE_VERIFICATION")],
      ["naver-site-verification", env("NAVER_SITE_VERIFICATION")],
    ].filter(([, v]) => v)
  ),
};

export const metadata = {
  metadataBase: new URL(siteUrl()),
  verification,
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", title: `${SITE_NAME} — ${SITE_TAGLINE}`, description: SITE_DESCRIPTION, url: "/" },
  twitter: { card: "summary_large_image", title: `${SITE_NAME} — ${SITE_TAGLINE}`, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
};

const NAV = [
  { href: "/", label: "Timeline" },
  { href: "/timeline", label: "Calendar" },
  { href: "/links", label: "Links" },
  { href: "/submit", label: "Submit" },
];

// This is a separate root layout from app/(admin)/layout.js — a Next.js
// route group, so the two areas each get their own <html>/<body> and don't
// share chrome. The admin panel isn't a "logged-in view" of the public
// site, it's a different audience doing a different job, so it never shows
// this nav/footer/cookie banner, and this file never shows admin controls.
export default async function SiteLayout({ children }) {
  // Logs this page view — only when the visitor has opted in via
  // CookieConsent (cg_consent=1 and a cg_visitor id both present). Reading
  // cookies()/headers() here opts this render into per-request rendering,
  // which is what lets a plain <a> navigation (see FilterBar.js's note on
  // why this site avoids client-side routing) log reliably on every page,
  // with no client-side beacon script needed. See lib/analytics.js for what
  // is and isn't recorded — never the IP address itself.
  const cookieStore = await cookies();
  const headerStore = await headers();
  if (cookieStore.get("cg_consent")?.value === "1") {
    const visitorId = cookieStore.get("cg_visitor")?.value;
    if (visitorId) {
      recordPageView({ visitorId, path: headerStore.get("x-pathname") || "/", headers: headerStore });
    }
  }

  // Admin-only nav link: a normal visitor never sees it, and it's never a
  // way *into* the admin panel (the login page still requires the real
  // password) — just a shortcut for whoever is already signed in and
  // browsing the public site to jump back to the panel.
  const nav = isAdminRequest(cookieStore) ? [...NAV, { href: "/admin", label: "Admin" }] : NAV;

  return (
    <html lang="en" className={nunito.variable}>
      <body className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 antialiased">
        <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur sticky top-0 z-30">
          <div className="mx-auto max-w-[1760px] px-4 sm:px-6 flex flex-wrap items-center justify-between gap-x-4 min-h-16 py-2">
            <a href="/" className="flex items-center gap-2 font-semibold text-base tracking-tight">
              <HexClockLogo size={28} />
              PolyTime
            </a>
            <NavLinks items={nav} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1760px] flex-1 px-4 sm:px-6 py-8">{children}</main>
        <footer className="mx-auto w-full max-w-[1760px] px-4 sm:px-6 py-8 text-xs text-neutral-500 border-t border-neutral-800 mt-16">
          PolyTime is community-curated.{" "}
          <a href="/submit" className="underline hover:text-neutral-300">Know one we're missing?</a>{" "}
          · <a href="/about" className="underline hover:text-neutral-300">About</a>{" "}
          · <a href="/privacy" className="underline hover:text-neutral-300">Privacy & data</a>{" "}
          · <CookiePrefsLink />
        </footer>
        <CookieConsent />
        <JsonLd data={websiteJsonLd()} />
      </body>
    </html>
  );
}
