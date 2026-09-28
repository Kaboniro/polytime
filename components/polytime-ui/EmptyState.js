// Not from the source polytime-ui package — a new piece in the same spirit,
// for the one kind of screen that stayed plain everywhere: "nothing here
// yet." A faceted low-poly gem, reusing the same validated --gantt-1..8
// categorical colors as HexClockLogo (muted with opacity here, since an
// empty state should read as quiet, not loud) so it feels like part of the
// same family instead of a new decoration bolted on.
export function EmptyGem({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="mx-auto mb-3">
      <polygon points="20,3 33,14 20,20" fill="var(--gantt-1)" opacity="0.3" />
      <polygon points="33,14 20,37 20,20" fill="var(--gantt-2)" opacity="0.22" />
      <polygon points="20,37 7,14 20,20" fill="var(--gantt-3)" opacity="0.22" />
      <polygon points="7,14 20,3 20,20" fill="var(--gantt-7)" opacity="0.26" />
      <polygon
        points="20,3 33,14 20,37 7,14"
        fill="none"
        stroke="var(--color-neutral-600)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <line x1={7} y1={14} x2={33} y2={14} stroke="var(--color-neutral-600)" strokeWidth={1} />
      <line x1={20} y1={3} x2={20} y2={37} stroke="var(--color-neutral-600)" strokeWidth={1} />
    </svg>
  );
}

// Drop-in replacement for the plain dashed-border "nothing here" boxes used
// across the site — same flat border, just with the gem above the message.
export function EmptyState({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-dashed border-neutral-800 p-10 text-center text-neutral-500 ${className}`}>
      <EmptyGem />
      <div>{children}</div>
    </div>
  );
}
