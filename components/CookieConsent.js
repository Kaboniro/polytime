"use client";

import { useEffect, useState } from "react";

const CONSENT_COOKIE = "cg_consent";
const VISITOR_COOKIE = "cg_visitor";
const YEAR = 60 * 60 * 24 * 365;

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// Not HttpOnly, unlike the admin session cookie in lib/auth.js — this one is
// a random opaque id with no privileges attached, so client JS setting and
// reading it directly is the right amount of protection, not a shortcut.
function setCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${YEAR}; SameSite=Lax`;
}

// Shows once, before any activity is logged (see app/layout.js /
// lib/analytics.js — nothing is recorded until cg_consent=1 and cg_visitor
// both exist). "Cookie preferences" in the footer re-opens this to change
// the choice later; see app/layout.js for that link.
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readCookie(CONSENT_COOKIE) === null) setVisible(true);
    const reopen = () => setVisible(true);
    window.addEventListener("cg:open-cookie-prefs", reopen);
    return () => window.removeEventListener("cg:open-cookie-prefs", reopen);
  }, []);

  function accept() {
    setCookie(CONSENT_COOKIE, "1");
    if (!readCookie(VISITOR_COOKIE)) setCookie(VISITOR_COOKIE, crypto.randomUUID());
    setVisible(false);
  }

  function decline() {
    setCookie(CONSENT_COOKIE, "0");
    // No visitor id set: declining means nothing gets an id to log against,
    // not just "we won't look" — there's no cookie left that could enable it.
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-700 bg-neutral-900 px-4 py-4 sm:px-6"
    >
      <div className="mx-auto max-w-[1760px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-300 max-w-2xl">
            With your OK, PolyTime remembers which pages you visit and a rough location from your
            network, to help us see what&apos;s useful. Nothing is shared with anyone else, and
            nothing is recorded unless you say yes.{" "}
            <a href="/privacy" className="text-orange-400 hover:underline">
              Read more
            </a>
            .
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={decline}
              className="border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900"
            >
              Decline
            </button>
            <button
              onClick={accept}
              className="bg-orange-500 px-4 py-2 text-sm font-medium text-black hover:bg-orange-400"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
