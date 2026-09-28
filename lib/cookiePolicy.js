// Single source of truth for the cookies a *visitor* can actually get, so
// /privacy and the CookieConsent banner's own inline policy can't drift
// apart — both render this same list.
//
// Deliberately excludes cg_admin (the signed admin session cookie from
// lib/auth.js): it's never set for an ordinary visitor, and naming it here
// would be disclosing internal auth mechanics to the public with no benefit
// to them — a public cookie policy should cover what affects the visitor,
// not the site's own admin implementation.
//
// "Necessary" cookies are set regardless of the banner choice (the site
// can't function without them, or — for cg_consent — the banner couldn't
// remember your answer without it, which is a standard exemption). Only
// "Unnecessary" cookies are gated on Accept, and are exactly what Decline
// prevents.
export const COOKIE_POLICY = [
  {
    name: "cg_consent",
    category: "necessary",
    purpose: "Remembers your cookie choice (Accept or Decline) so the banner doesn't ask again on every visit.",
    duration: "1 year",
  },
  {
    name: "cg_visitor",
    category: "unnecessary",
    purpose:
      "A random id with no other information attached, used only if you accept, so this site's own Activity dashboard can count visits and see which pages are useful. Never shared outside this site.",
    duration: "1 year",
  },
];

export const CATEGORY_LABEL = {
  necessary: "Necessary",
  unnecessary: "Unnecessary (optional)",
};
