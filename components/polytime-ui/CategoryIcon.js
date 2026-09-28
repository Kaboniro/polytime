// Ported from the polytime-ui reference package (see ../../polytime-ui at
// the project root for the original) — same low-poly shapes (pyramid,
// cube, torus), recolored to this site's existing palette instead of the
// source package's violet/crimson/mustard: competition uses the brand
// accent, challenge and rolling reuse the same sky/violet tones Badge.js
// already uses for its "blue"/"purple" tones, so no new colors are
// introduced anywhere in this port.
export const KIND_LABEL = {
  competition: "Competition",
  challenge: "Challenge",
  rolling: "Rolling",
};

const INK = "var(--color-neutral-100)";
const ACCENT = {
  competition: "var(--color-orange-500)",
  challenge: "var(--color-sky-400)",
  rolling: "var(--color-violet-400)",
};

// Decorative only — the label text next to it always carries the meaning.
export function CategoryIcon({ kind, size = 16 }) {
  const common = { width: size, height: size, viewBox: "0 0 16 16", "aria-hidden": true };
  const accent = ACCENT[kind];

  if (kind === "competition") {
    return (
      <svg {...common}>
        <polygon points="8,1.5 15,14 1,14" fill={accent} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
        <polyline points="1,14 10,11.5 15,14" fill="none" stroke={INK} strokeWidth={1.1} />
        <line x1={8} y1={1.5} x2={10} y2={11.5} stroke={INK} strokeWidth={1.1} />
      </svg>
    );
  }

  if (kind === "challenge") {
    return (
      <svg {...common}>
        <polygon
          points="8,1 14.5,4.75 14.5,11.25 8,15 1.5,11.25 1.5,4.75"
          fill={accent}
          stroke={INK}
          strokeWidth={1.3}
          strokeLinejoin="round"
        />
        <polyline points="1.5,4.75 8,8.5 14.5,4.75" fill="none" stroke={INK} strokeWidth={1.1} />
        <line x1={8} y1={8.5} x2={8} y2={15} stroke={INK} strokeWidth={1.1} />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx={8} cy={8} r={5.5} fill="none" stroke={accent} strokeWidth={3.5} />
      <circle cx={8} cy={8} r={7.25} fill="none" stroke={INK} strokeWidth={1} />
      <circle cx={8} cy={8} r={3.75} fill="none" stroke={INK} strokeWidth={1} />
    </svg>
  );
}
