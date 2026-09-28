"use client";

import { CategoryIcon, KIND_LABEL } from "./CategoryIcon";
import { useNow, formatRemaining } from "./useCountdown";

// Ported from the polytime-ui reference package, keeping its shape and
// motion (rounded card, hover tilt + hard-edge shadow, bobbing "closing
// soon" sticker) but recolored to this site's existing dark/orange palette
// instead of the source's cream/violet/crimson — see CategoryIcon.js for
// the same reasoning applied to its accent colors.
const TINT = {
  competition: "bg-orange-500/15 text-orange-400",
  challenge: "bg-sky-500/15 text-sky-400",
  rolling: "bg-violet-500/15 text-violet-400",
};
const BAR_FILL = {
  competition: "bg-orange-500",
  challenge: "bg-sky-400",
  rolling: "bg-violet-400",
};

// Fixed locale + UTC so server and browser print the same label.
const dateLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export function EventCard({ title, kind, start, end, organizer, href, urgentWithinDays = 5, className = "" }) {
  const now = useNow();
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();

  // Before the first browser tick, show a neutral state instead of guessing.
  const pct = now === null ? 0 : Math.min(100, Math.max(0, ((now - startMs) / (endMs - startMs)) * 100));
  const remaining = now === null ? null : endMs - now;
  const urgent = remaining !== null && remaining > 0 && remaining < urgentWithinDays * 86_400_000;

  const Tag = href ? "a" : "div";

  return (
    <Tag
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`group relative flex min-h-[200px] flex-col gap-3.5 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-neutral-100 no-underline transition-[transform,box-shadow,border-color] duration-200 ease-out motion-reduce:!transform-none ${
        href
          ? "hover:-translate-y-1 hover:-rotate-[0.35deg] hover:border-neutral-500 hover:shadow-[5px_5px_0_var(--color-neutral-100)] focus-visible:-translate-y-1 focus-visible:-rotate-[0.35deg] focus-visible:border-neutral-500 focus-visible:shadow-[5px_5px_0_var(--color-neutral-100)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-orange-500"
          : ""
      } ${className}`}
    >
      <span className={`inline-flex h-[26px] items-center gap-1.5 self-start rounded-full px-2.5 text-[13px] font-semibold leading-none ${TINT[kind]}`}>
        <CategoryIcon kind={kind} />
        {KIND_LABEL[kind]}
      </span>

      <div className="flex flex-col gap-1">
        <h3 className="m-0 text-base font-extrabold leading-[1.15] tracking-tight text-neutral-50">{title}</h3>
        {organizer && <span className="text-sm text-neutral-400">{organizer}</span>}
      </div>

      <div className="mt-auto flex flex-col gap-2.5">
        <div
          className="relative h-2 rounded-full bg-neutral-800"
          role="progressbar"
          aria-label="Time elapsed"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
        >
          <div className={`h-full rounded-full ${BAR_FILL[kind]}`} style={{ width: `${pct}%` }} />
          <div
            className="absolute top-[-3px] -ml-[7px] h-3.5 w-3.5 rotate-45 border-2 border-neutral-100 bg-neutral-900"
            style={{ left: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between font-mono text-xs text-neutral-400">
          <span>{dateLabel.format(startMs)}</span>
          <span className="font-semibold text-neutral-100">
            {remaining === null ? "—" : remaining > 0 ? `${formatRemaining(remaining)} left` : "Ended"}
          </span>
          <span>{dateLabel.format(endMs)}</span>
        </div>
      </div>

      {urgent && (
        <span className="absolute -top-3 right-3.5 animate-[pt-bob_3s_ease-in-out_infinite] rounded-lg border border-neutral-100 bg-orange-500 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-black motion-reduce:animate-none">
          closing soon
        </span>
      )}
    </Tag>
  );
}
