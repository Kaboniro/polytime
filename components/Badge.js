// Plain text, not a filled/bordered pill — a tag's job here is a label, not
// a button or a box to click. Tone is carried by text color and weight
// alone; uppercase + tracking sets it apart from body text without an
// enclosure around it.
const TONES = {
  neutral: "text-neutral-400",
  orange: "text-orange-400",
  green: "text-emerald-400",
  blue: "text-sky-400",
  purple: "text-violet-400",
};

export default function Badge({ children, tone = "neutral" }) {
  return (
    <span className={`text-[11px] font-semibold uppercase tracking-wide ${TONES[tone] || TONES.neutral}`}>
      {children}
    </span>
  );
}
