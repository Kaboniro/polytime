// Central place for the optional admin contact address shown on /privacy
// (see CONTACT_EMAIL in .env.example). Kept separate from ADMIN_* so it can
// be exposed to the public without touching anything auth-related.
export function getContactEmail() {
  return process.env.CONTACT_EMAIL?.trim() || null;
}

// Builds a mailto: link with a prefilled subject and body. mailto isn't a
// real query string (RFC 6068), so values are percent-encoded by hand with
// encodeURIComponent rather than URLSearchParams, which would encode spaces
// as "+" and show up literally in some mail clients.
export function mailto(email, { subject, body } = {}) {
  const parts = [];
  if (subject) parts.push(`subject=${encodeURIComponent(subject)}`);
  if (body) parts.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email}${parts.length ? `?${parts.join("&")}` : ""}`;
}
