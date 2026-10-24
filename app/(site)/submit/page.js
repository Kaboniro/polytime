"use client";

import { useState } from "react";
import HeadingInfo from "@/components/HeadingInfo";
import SideImage from "@/components/SideImage";
import LocationPicker from "@/components/LocationPicker";
import { AxisGizmo } from "@/components/polytime-ui";
import { EVENT_CATEGORIES, EVENT_TYPES, LINK_CATEGORIES, QUERY_KINDS } from "@/lib/constants";
import { geographyGroups } from "@/lib/geography";

const TABS = [
  { key: "event", label: "Event / challenge" },
  { key: "link", label: "Link" },
  { key: "query", label: "Query" },
];

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-neutral-300 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-neutral-500 mt-1">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500";

function EventForm({ onDone }) {
  const [form, setForm] = useState({
    title: "", description: "", url: "", host: "", category: "general", software: "",
    geography: "international",
    event_type: "event", start_date: "", end_date: "", submission_deadline: "",
    location: "online", submitted_by: "", submitter_note: "",
  });
  const [state, setState] = useState({ loading: false, error: null });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setState({ loading: true, error: null });
    const res = await fetch("/api/submit/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setState({ loading: false, error: data.error || "Something went wrong." });
      return;
    }
    setState({ loading: false, error: null });
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title *">
        <input required className={inputClass} value={form.title} onChange={set("title")} placeholder="e.g. Blender Conference 2026" />
      </Field>
      <Field label="Description">
        <textarea className={inputClass} rows={3} value={form.description} onChange={set("description")} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Link">
          <input type="url" className={inputClass} value={form.url} onChange={set("url")} placeholder="https://" />
        </Field>
        <Field label="Host / platform">
          <input className={inputClass} value={form.host} onChange={set("host")} placeholder="e.g. CGTrader" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Category">
          <select className={inputClass} value={form.category} onChange={set("category")}>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Software" hint={'Comma-separated, or "Any" if all software is allowed.'}>
          <input className={inputClass} value={form.software} onChange={set("software")} placeholder="e.g. Blender, ZBrush" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Type">
          <select className={inputClass} value={form.event_type} onChange={set("event_type")}>
            {EVENT_TYPES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Geography" hint="Where it's centered — a country, a continent, or International.">
          <select className={inputClass} value={form.geography} onChange={set("geography")}>
            {geographyGroups().map((g, i) =>
              g.label ? (
                <optgroup key={g.label} label={g.label}>
                  {g.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </optgroup>
              ) : (
                g.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))
              )
            )}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Start date" hint="Leave blank if not fixed">
          <input type="date" className={inputClass} value={form.start_date} onChange={set("start_date")} />
        </Field>
        <Field label="End date">
          <input type="date" className={inputClass} value={form.end_date} onChange={set("end_date")} />
        </Field>
        <Field label="Submission deadline">
          <input type="date" className={inputClass} value={form.submission_deadline} onChange={set("submission_deadline")} />
        </Field>
      </div>
      {/* Not a <Field>: that's a <label>, and clicking a label that wraps
          several buttons would press the first one. */}
      <div>
        <span className="block text-sm font-medium text-neutral-300 mb-1">Location</span>
        <LocationPicker value={form.location} onChange={(v) => setForm((f) => ({ ...f, location: v }))} inputClass={inputClass} />
      </div>
      <Field label="Your email (optional)" hint="Only so we can follow up if we have a question — never shown publicly.">
        <input type="email" className={inputClass} value={form.submitted_by} onChange={set("submitted_by")} />
      </Field>
      <Field label="Anything else we should know? (optional)">
        <textarea className={inputClass} rows={2} value={form.submitter_note} onChange={set("submitter_note")} />
      </Field>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button
        disabled={state.loading}
        className="rounded-lg bg-go hover:bg-go-hover disabled:opacity-50 text-ink font-medium px-4 py-2 text-sm transition-colors"
      >
        {state.loading ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}

function LinkForm({ onDone }) {
  const [form, setForm] = useState({
    title: "", url: "", description: "", category: "community", submitted_by: "", submitter_note: "",
  });
  const [state, setState] = useState({ loading: false, error: null });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setState({ loading: true, error: null });
    const res = await fetch("/api/submit/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setState({ loading: false, error: data.error || "Something went wrong." });
      return;
    }
    setState({ loading: false, error: null });
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title *">
        <input required className={inputClass} value={form.title} onChange={set("title")} />
      </Field>
      <Field label="URL *">
        <input required type="url" className={inputClass} value={form.url} onChange={set("url")} placeholder="https://" />
      </Field>
      <Field label="Description">
        <textarea className={inputClass} rows={2} value={form.description} onChange={set("description")} />
      </Field>
      <Field label="Category">
        <select className={inputClass} value={form.category} onChange={set("category")}>
          {LINK_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </Field>
      <Field label="Your email (optional)">
        <input type="email" className={inputClass} value={form.submitted_by} onChange={set("submitted_by")} />
      </Field>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button
        disabled={state.loading}
        className="rounded-lg bg-go hover:bg-go-hover disabled:opacity-50 text-ink font-medium px-4 py-2 text-sm transition-colors"
      >
        {state.loading ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}

// Not content for the site: a message to the admin (content removal request,
// correction, question). Goes to /admin/queries, never to the public pages.
function QueryForm({ onDone }) {
  const [form, setForm] = useState({ kind: "removal", subject: "", page_url: "", message: "", contact: "", website: "" });
  const [state, setState] = useState({ loading: false, error: null, errors: {} });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setState({ loading: true, error: null, errors: {} });
    let res;
    try {
      res = await fetch("/api/submit/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {
      setState({ loading: false, error: "Couldn't reach the server. Please try again in a moment.", errors: {} });
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setState({ loading: false, error: data.error || "Something went wrong.", errors: data.errors || {} });
      return;
    }
    setState({ loading: false, error: null, errors: {} });
    onDone();
  }

  const bad = (k) => (state.errors[k] ? "border-red-500/70" : "");
  const fieldError = (k) => state.errors[k] && <span className="block text-xs text-red-400 mt-1">{state.errors[k]}</span>;

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="What is this about? *">
        <select className={`${inputClass} ${bad("kind")}`} value={form.kind} onChange={set("kind")}>
          {QUERY_KINDS.map((k) => (
            <option key={k.value} value={k.value}>{k.label}</option>
          ))}
        </select>
        {fieldError("kind")}
      </Field>
      <Field label="Subject *">
        <input className={`${inputClass} ${bad("subject")}`} value={form.subject} onChange={set("subject")} maxLength={200} placeholder="e.g. Please remove my event listing" />
        {fieldError("subject")}
      </Field>
      <Field label="Page or link it concerns" hint="Paste the address of the event, link or page on this site or elsewhere, if there is one.">
        <input type="url" className={`${inputClass} ${bad("page_url")}`} value={form.page_url} onChange={set("page_url")} placeholder="https://" />
        {fieldError("page_url")}
      </Field>
      <Field label="Message *">
        <textarea className={`${inputClass} ${bad("message")}`} rows={6} value={form.message} onChange={set("message")} maxLength={5000} />
        {fieldError("message")}
      </Field>
      <Field label="Your email">
        <input type="email" className={`${inputClass} ${bad("contact")}`} value={form.contact} onChange={set("contact")} />
        {fieldError("contact")}
      </Field>
      {/* Honeypot: hidden from people, irresistible to form-filling bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
        </label>
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button
        disabled={state.loading}
        className="rounded-lg bg-go hover:bg-go-hover disabled:opacity-50 text-ink font-medium px-4 py-2 text-sm transition-colors"
      >
        {state.loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

export default function SubmitPage() {
  const [tab, setTab] = useState("event");
  const [done, setDone] = useState(false);

  return (
    <div className="flex items-stretch gap-12">
    <div className="w-full shrink-0 lg:w-3/5">
      <div className="mb-8 flex items-start gap-3">
        <AxisGizmo size={30} />
        <HeadingInfo as="h1" title="Submit something" className="flex-1">
          Tell us about an event or a link we're missing. Everything is reviewed before it appears
          on the site — nothing is published automatically.
          {tab === "query" && (
            <span className="mt-3 block">
              The Query tab is for messages to us rather than content for the site: asking for something to be
              removed, pointing out a mistake, or asking a question. Removal requests are read by a person and
              acted on if valid.
            </span>
          )}
          {tab === "event" && (
            <span className="mt-3 block">
              Submitting your own competition, conference, or challenge? Welcome — every submission is
              reviewed and checked against the event's own page before it's listed. It won't go live
              automatically just because you're the organizer.
            </span>
          )}
        </HeadingInfo>
      </div>

      {done ? (
        <div className="rounded-2xl border border-emerald-900 bg-emerald-500/10 p-6 text-emerald-300">
          <p className="font-medium mb-1">{tab === "query" ? "Thanks — your message has been sent." : "Thanks — it's in the review queue."}</p>
          <p className="text-sm text-emerald-400/80 mb-4">
            {tab === "query" ? "We'll read it and reply by email if you left one." : "We'll check it and publish it if it's a good fit."}
          </p>
          <button
            onClick={() => setDone(false)}
            className="text-sm underline hover:text-emerald-200"
          >
            Submit another
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-1 mb-6 border-b border-neutral-800">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === t.key
                    ? "border-orange-500 text-neutral-50"
                    : "border-transparent text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === "event" && <EventForm onDone={() => setDone(true)} />}
          {tab === "link" && <LinkForm onDone={() => setDone(true)} />}
          {tab === "query" && <QueryForm onDone={() => setDone(true)} />}
        </>
      )}
    </div>
    <SideImage src="/images/emma-candy1.jpg" position="30% 50%" />
    </div>
  );
}
