// "Add to Google Calendar" links. Google's event-template URL opens a
// prefilled new-event page in the visitor's own calendar; they review it and
// press Save, so the site needs no sign-in or API access.
//
// Events here are whole days, so the entries are all-day ones: `dates` is
// YYYYMMDD/YYYYMMDD with the end day exclusive (the day after the last day).

const compact = (iso) => iso.replaceAll("-", "");

function dayAfter(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Google rejects very long URLs, so long descriptions are cut short; the
// event page link at the end has the full details.
const MAX_DETAILS = 900;

export function googleCalendarUrl({ title, start, end, details = "", location = "" }) {
  const body = details.length > MAX_DETAILS ? `${details.slice(0, MAX_DETAILS).trimEnd()}…` : details;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${compact(start)}/${compact(dayAfter(end || start))}`,
  });
  if (body) params.set("details", body);
  if (location) params.set("location", location);
  return `https://calendar.google.com/calendar/render?${params}`;
}
