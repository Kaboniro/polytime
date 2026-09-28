import { labelFor, EVENT_CATEGORIES, EVENT_TYPES } from "@/lib/constants";
import { fmtDateRange } from "@/lib/dates";
import { geographyLabel } from "@/lib/geography";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

// Helpers for search-engine metadata and structured data (JSON-LD).

export function eventPath(e) {
  return `/events/${e.id}`;
}

// A short, human description for <meta name="description"> and social cards:
// the event's own description when there is one, otherwise a factual sentence
// built from its fields. Roughly 155 characters, cut at a word.
export function eventDescription(e) {
  const clean = (e.description || "").replace(/\s+/g, " ").trim();
  if (clean.length >= 40) return clean.length <= 158 ? clean : clean.slice(0, 155).replace(/\s+\S*$/, "") + "…";
  const range = fmtDateRange(e.start_date, e.end_date);
  const bits = [
    `${labelFor(EVENT_CATEGORIES, e.category)} ${e.event_type === "conference" ? "conference" : "event"}`,
    e.host ? `hosted by ${e.host}` : null,
    range || null,
    geographyLabel(e.geography),
  ].filter(Boolean);
  return `${e.title} — ${bits.join(" · ")}. Details, dates and link on ${SITE_NAME}.`.slice(0, 200);
}

// Locations that say nothing (the crawler files "See event page"; admins sometimes type TBA)
// are treated as unknown, never shown as a place and never turned into a schema.org Place.
const PLACEHOLDER = /^(see (the )?(event )?(page|link|website|site)|tbd|tba|tbc|unknown|n\/a|-+)\.?$/i;
export const realLocation = (e) => {
  const l = (e.location || "").trim();
  return l && !PLACEHOLDER.test(l) ? l : null;
};

const isOnline = (e) => !realLocation(e) || /online|virtual|remote/i.test(e.location);

// schema.org/Event. Google needs a name, a start date and a location; events
// with no start date (rolling / ongoing) get no Event markup at all rather
// than made-up dates.
export function eventJsonLd(e) {
  if (!e.start_date) return null;
  const online = isOnline(e);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    description: eventDescription(e),
    startDate: e.start_date,
    ...(e.end_date ? { endDate: e.end_date } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: online ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
    location: online
      ? { "@type": "VirtualLocation", url: e.url || absoluteUrl(eventPath(e)) }
      : { "@type": "Place", name: e.location, address: e.location },
    url: absoluteUrl(eventPath(e)),
    ...(e.host ? { organizer: { "@type": "Organization", name: e.host } } : {}),
    image: [absoluteUrl("/opengraph-image")],
    isAccessibleForFree: true,
  };
  return ld;
}

export function websiteJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
      description: SITE_DESCRIPTION,
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
      logo: absoluteUrl("/logo.svg"),
    },
  ];
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

// JSON-LD is embedded in a <script>; a "</script>" or "<!--" inside a string
// would break out of it, so those characters are escaped.
export const jsonLdString = (data) => JSON.stringify(data).replace(/</g, "\\u003c");

export const typeLabel = (e) => labelFor(EVENT_TYPES, e.event_type);
