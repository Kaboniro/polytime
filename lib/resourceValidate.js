import { isValid, parseISO } from "date-fns";
import { fieldOptions, getResource } from "@/lib/resources";

const MAX_LENGTH = { text: 300, url: 2000, textarea: 5000, email: 320, date: 10, number: 10, select: 50 };
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Only http(s) links are allowed: these values become href/src on public
// pages, and a `javascript:` URL there would run script in visitors' browsers.
function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Validates and normalizes a create/update request body against the resource
// config. Returns { values } (ready to write, empty optionals as null) or
// { errors } keyed by field name. Anything not in the config is ignored, so a
// crafted body can never write another column (id, created_at, ...).
export function validateResource(table, input) {
  const resource = getResource(table);
  const errors = {};
  const values = {};
  const body = input && typeof input === "object" ? input : {};

  for (const f of resource.fields) {
    const raw = body[f.name];
    const text = raw == null ? "" : String(raw).trim();

    if (f.type === "toggle") {
      values[f.name] = text === "1" || text === "true" ? 1 : 0;
      continue;
    }

    if (!text) {
      if (f.required) errors[f.name] = `${f.label} is required.`;
      values[f.name] = null;
      continue;
    }
    if (text.length > MAX_LENGTH[f.type]) {
      errors[f.name] = `${f.label} is too long (max ${MAX_LENGTH[f.type]} characters).`;
      continue;
    }

    switch (f.type) {
      case "select":
        if (!fieldOptions(f).some((o) => o.value === text)) errors[f.name] = `${f.label} is not a valid choice.`;
        else values[f.name] = text;
        break;
      case "url":
        if (!isHttpUrl(text)) errors[f.name] = `${f.label} must be a full http(s) link, e.g. https://example.com`;
        else values[f.name] = text;
        break;
      case "date":
        if (!DATE_RE.test(text) || !isValid(parseISO(text))) errors[f.name] = `${f.label} must be a valid date.`;
        else values[f.name] = text;
        break;
      case "number": {
        // min/max default to a plausible year range (the original use of this
        // type); a field like "participants" overrides both to fit a headcount.
        const n = Number(text);
        const min = f.min ?? 1900;
        const max = f.max ?? 2100;
        if (!Number.isInteger(n) || n < min || n > max) errors[f.name] = f.rangeHint || `${f.label} must be a whole number between ${min} and ${max}.`;
        else values[f.name] = n;
        break;
      }
      default:
        values[f.name] = text;
    }
  }

  if (table === "events" && !errors.start_date && !errors.end_date && values.start_date && values.end_date) {
    if (values.end_date < values.start_date) errors.end_date = "End date can't be before the start date.";
  }

  return Object.keys(errors).length ? { errors } : { values };
}
