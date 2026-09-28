import { EVENT_CATEGORIES, EVENT_TYPES, LINK_CATEGORIES } from "@/lib/constants";
import { geographyGroups } from "@/lib/geography";

// One description of each admin-editable table. The admin forms, the list
// tables, and the API validation all read from this, so a field is added in
// exactly one place. It is also the whitelist of columns the API will ever
// write: column names in SQL come from here, never from request bodies.
//
// field.type: text | textarea | url | date | number | email | select | toggle
// (a toggle is a yes/no switch: the form holds "1" or "", and it is stored as 1/0)
// field.required: must be non-empty
// select fields carry either `options: [{ value, label }]`, or `groups:
// [{ label, options }]` to render as <optgroup>s (e.g. geography, grouped
// into International / Region / Country). Use fieldOptions(f) to read a
// select field's choices without caring which one it used.

export const STATUS_OPTIONS = [
  { value: "approved", label: "Approved (public)" },
  { value: "pending", label: "Pending (hidden)" },
  { value: "rejected", label: "Rejected (hidden)" },
  { value: "archived", label: "Archived (hidden)" },
];

const status = { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true };

export function fieldOptions(f) {
  return f.groups ? f.groups.flatMap((g) => g.options) : f.options || [];
}

export const RESOURCES = {
  events: {
    singular: "event",
    plural: "Events",
    titleField: "title",
    listColumns: ["title", "start_date", "category", "geography", "participants", "host", "status"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "url", label: "Event link", type: "url" },
      { name: "host", label: "Host / platform", type: "text" },
      { name: "category", label: "Category", type: "select", options: EVENT_CATEGORIES, required: true },
      {
        name: "geography",
        label: "Geography",
        type: "select",
        groups: geographyGroups(),
        required: true,
        hint: "Where the competition is centered — a specific country, a continent, or International.",
      },
      { name: "software", label: "Software", type: "text", hint: 'Comma-separated, or "Any" if all software is allowed.' },
      {
        name: "participants",
        label: "Participants",
        type: "number",
        format: "count", // thousands separators in the list view — see ResourceTable's display()
        min: 0,
        max: 10000000,
        placeholder: "e.g. 412",
        hint: "Total headcount, once known — an admin-tracked stat, not self-reported. Leave blank if unknown.",
        rangeHint: "Participants must be a whole number, 0 or more.",
      },
      { name: "event_type", label: "Type", type: "select", options: EVENT_TYPES, required: true },
      { name: "start_date", label: "Start date", type: "date", hint: "Leave blank if not fixed." },
      { name: "end_date", label: "End date", type: "date" },
      { name: "submission_deadline", label: "Submission deadline", type: "date" },
      { name: "location", label: "Location", type: "text", hint: "Online, or a city." },
      { name: "no_ai", label: "No AI", type: "toggle", hint: "On if the event prohibits AI-generated work." },
      status,
    ],
    defaults: { category: "general", geography: "international", event_type: "event", location: "online", status: "approved" },
  },

  links: {
    singular: "link",
    plural: "Links",
    titleField: "title",
    listColumns: ["title", "url", "category", "status"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "url", label: "URL", type: "url", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "category", label: "Category", type: "select", options: LINK_CATEGORIES, required: true },
      { name: "no_ai", label: "No AI", type: "toggle", hint: "On if this resource is AI-free (no generative AI content or tools)." },
      status,
    ],
    defaults: { category: "community", status: "approved" },
  },
};

export function getResource(table) {
  return Object.hasOwn(RESOURCES, table) ? RESOURCES[table] : null;
}

// A form's starting values: every field as an empty string, then the defaults.
export function emptyValues(resource) {
  const values = Object.fromEntries(resource.fields.map((f) => [f.name, ""]));
  return { ...values, ...resource.defaults };
}
