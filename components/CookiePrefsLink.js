"use client";

// Re-opens the CookieConsent banner (see that component) via a plain window
// event — no shared state/context needed for one signal with one listener.
export default function CookiePrefsLink({ className = "underline hover:text-neutral-300" }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("cg:open-cookie-prefs"))}
      className={className}
    >
      Cookie preferences
    </button>
  );
}
