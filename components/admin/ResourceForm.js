"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500";

function FieldInput({ field, value, onChange, invalid }) {
  const common = {
    id: `f-${field.name}`,
    name: field.name,
    value,
    onChange,
    "aria-invalid": invalid || undefined,
    className: `${inputClass} ${invalid ? "border-red-500/70" : ""}`,
  };
  switch (field.type) {
    case "textarea":
      return <textarea rows={4} {...common} />;
    case "select":
      return (
        <select {...common}>
          {field.groups
            ? field.groups.map((g, i) =>
                g.label ? (
                  <optgroup key={g.label} label={g.label}>
                    {g.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                ) : (
                  // An ungrouped leading option (e.g. "International") rendered
                  // as a fragment so it sits above the groups, not inside one.
                  <Fragment key={`ungrouped-${i}`}>
                    {g.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Fragment>
                )
              )
            : field.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
        </select>
      );
    case "number":
      // min/max/placeholder default to the original "year" use of this type;
      // a field like "participants" overrides them to fit a headcount instead.
      return (
        <input
          type="number"
          min={field.min ?? 1900}
          max={field.max ?? 2100}
          step={1}
          placeholder={field.placeholder ?? "2026"}
          {...common}
        />
      );
    case "toggle": {
      const on = value === "1" || value === 1 || value === true;
      return (
        <button
          type="button"
          id={common.id}
          role="switch"
          aria-checked={on}
          onClick={() => onChange({ target: { value: on ? "" : "1" } })}
          className={`inline-flex h-7 w-12 items-center rounded-full border p-0.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500/60 ${
            on ? "border-orange-500 bg-orange-500" : "border-neutral-700 bg-neutral-800"
          }`}
        >
          <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
          <span className="sr-only">{on ? "On" : "Off"}</span>
        </button>
      );
    }
    case "url":
      return <input type="url" placeholder="https://" {...common} />;
    default:
      return <input type={field.type === "date" ? "date" : field.type} {...common} />;
  }
}

// Create (no `id`) or edit (`id`) one row. `resource` is the plain-data config
// from lib/resources.js; the server validates again, so this only needs to show
// what the API reports back.
export default function ResourceForm({ table, resource, initial, id }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const editing = id != null;

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  async function request(method, url, body) {
    let res;
    try {
      res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      // The browser couldn't reach the server at all (it is restarting, or the connection dropped).
      return { ok: false, status: 0, data: { error: "Couldn't reach the server. Wait a moment and try again; nothing was saved." } };
    }
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  }

  function done() {
    router.push(`/admin/${table}`);
    router.refresh();
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    setErrors({});
    const { ok, status, data } = editing
      ? await request("PUT", `/api/admin/${table}/${id}`, form)
      : await request("POST", `/api/admin/${table}`, form);
    if (ok) return done();
    setBusy(false);
    setErrors(data.errors || {});
    setMessage(status === 401 ? "Your session expired — log in again." : data.error || "Something went wrong.");
  }

  async function remove() {
    if (!window.confirm(`Delete this ${resource.singular}? This can't be undone.`)) return;
    setBusy(true);
    const { ok, data } = await request("DELETE", `/api/admin/${table}/${id}`);
    if (ok) return done();
    setBusy(false);
    setMessage(data.error || "Couldn't delete.");
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl">
      <div className="grid gap-4 sm:grid-cols-2">
        {resource.fields.map((f, i) => {
          const wide = f.type === "textarea" || i === 0;
          return (
            <div key={f.name} className={wide ? "sm:col-span-2" : ""}>
              <label htmlFor={`f-${f.name}`} className="block text-sm font-medium text-neutral-300 mb-1">
                {f.label}
                {f.required && <span className="text-orange-400"> *</span>}
              </label>
              <FieldInput field={f} value={form[f.name]} onChange={set(f.name)} invalid={Boolean(errors[f.name])} />
              {errors[f.name] ? (
                <p className="mt-1 text-xs text-red-400">{errors[f.name]}</p>
              ) : (
                f.hint && <p className="mt-1 text-xs text-neutral-500">{f.hint}</p>
              )}
            </div>
          );
        })}
      </div>

      {message && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {message}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          disabled={busy}
          className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black font-medium px-4 py-2 text-sm transition-colors"
        >
          {busy ? "Saving…" : editing ? "Save changes" : `Create ${resource.singular}`}
        </button>
        <a href={`/admin/${table}`} className="text-sm text-neutral-400 hover:text-neutral-50">
          Cancel
        </a>
        {editing && (
          <button
            type="button"
            disabled={busy}
            onClick={remove}
            className="ml-auto text-sm px-3 py-2 bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-50"
          >
            Delete {resource.singular}
          </button>
        )}
      </div>
    </form>
  );
}
