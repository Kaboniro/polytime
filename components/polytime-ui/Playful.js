// Ported from the polytime-ui reference package. HexClockLogo's six wedges
// reuse the same 8-hue validated categorical palette GanttChart already
// uses (--gantt-1..6, app/globals.css) instead of inventing new colors;
// AxisGizmo reuses EventCard's three accent tones for the same reason.
const INK = "var(--color-neutral-100)";
const HAND = "var(--color-orange-500)";

// Hexagon clock with a slowly turning minute hand. Decorative.
export function HexClockLogo({ size = 36, label }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <polygon points="20,20 20,2 35.6,11" fill="var(--gantt-4)" />
      <polygon points="20,20 35.6,11 35.6,29" fill="var(--gantt-2)" />
      <polygon points="20,20 35.6,29 20,38" fill="var(--gantt-8)" />
      <polygon points="20,20 20,38 4.4,29" fill="var(--gantt-7)" />
      <polygon points="20,20 4.4,29 4.4,11" fill="var(--gantt-1)" />
      <polygon points="20,20 4.4,11 20,2" fill="var(--gantt-3)" />
      <polygon
        points="20,2 35.6,11 35.6,29 20,38 4.4,29 4.4,11"
        fill="none"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle cx={20} cy={20} r={8} fill="var(--color-neutral-900)" stroke={INK} strokeWidth={1.5} />
      <line x1={20} y1={20} x2={20} y2={15} stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
      <line
        className="origin-[20px_20px] animate-[pt-spin_12s_linear_infinite] motion-reduce:animate-none"
        style={{ transformBox: "view-box" }}
        x1={20}
        y1={20}
        x2={25}
        y2={20}
        stroke={HAND}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}

// The X/Y/Z orientation widget from 3D viewports. Decorative.
export function AxisGizmo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden>
      <line x1={12} y1={22} x2={28} y2={22} stroke="var(--color-orange-500)" strokeWidth={2} strokeLinecap="round" />
      <line x1={12} y1={22} x2={12} y2={5} stroke="var(--color-sky-400)" strokeWidth={2} strokeLinecap="round" />
      <line x1={12} y1={22} x2={4} y2={30} stroke="var(--color-violet-400)" strokeWidth={2} strokeLinecap="round" />
      <circle cx={28} cy={22} r={3.5} fill="var(--color-orange-500)" />
      <circle cx={12} cy={5} r={3.5} fill="var(--color-sky-400)" />
      <circle cx={4} cy={30} r={3.5} fill="var(--color-violet-400)" />
      <circle cx={12} cy={22} r={2.2} fill={INK} />
    </svg>
  );
}

// Wraps any section in the faint 3D-viewport floor grid.
export function ViewportGrid({ as: Tag = "div", gridSize = 40, className = "", children }) {
  return (
    <Tag
      className={className}
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }}
    >
      {children}
    </Tag>
  );
}
