// Shared vocab so the submit form, admin queue, and filter dropdowns all
// agree on the same values instead of drifting apart over time.

export const EVENT_CATEGORIES = [
  { value: "general", label: "General / Multi-discipline" },
  {value: "3d", label: "3D Art" },
  { value: "3d-printing", label: "3D Printing" },
  {value: "animation", label: "Animation / Motion" },
  {value: "rendering", label: "3D Fashion" },
  { value: "archviz", label: "Architectural Visualization" },
  { value: "game-art", label: "Game Art" },
  { value: "character", label: "Character / Creature" },
  { value: "vfx", label: "VFX / Motion" },
  { value: "product", label: "Product Viz" },
  { value: "sculpting", label: "Sculpting / ZBrush" },
  { value: "printing", label: "Stop Motion" },
  { value: "concept", label: "Concept / Illustration" },
  {value: "pixel", label: "Pixel Art" },
  { value: "other", label: "Other" },
];

export const EVENT_TYPES = [
  { value: "event", label: "One-off event / contest deadline" },
  { value: "conference", label: "Conference" },
  { value: "ongoing", label: "Ongoing challenge (open-ended, no fixed date)" },
  { value: "rolling", label: "Rolling / recurring (weekly, monthly, etc.)" },
];

// Types that have real dates (and so move through upcoming / running /
// archived); rolling and ongoing entries don't.
export const DATED_EVENT_TYPES = ["event", "conference"];

// Short labels for the public type filter.
export const TYPE_FILTER_OPTIONS = [
  { value: "event", label: "One-off" },
  { value: "conference", label: "Conference" },
  { value: "rolling", label: "Rolling" },
  { value: "ongoing", label: "Ongoing" },
];

export const LINK_CATEGORIES = [
  { value: "community", label: "Community (Discord, forum, subreddit)" },
  { value: "tool", label: "Tool / Plugin" },
  { value: "software", label: "Software" },
  { value: "asset-library", label: "Asset Library" },
  { value: "3d-printing", label: "3D Printing (printers, slicers, printable models)" },
  { value: "tutorial", label: "Tutorials / Learning" },
  { value: "job-board", label: "Jobs / Freelance" },
  { value: "other", label: "Other" },
];

export function labelFor(list, value) {
  return list.find((i) => i.value === value)?.label || value;
}

// Public Query form (Submit page) — what the message is about.
export const QUERY_KINDS = [
  { value: "removal", label: "Content removal request" },
  { value: "correction", label: "Correction" },
  { value: "question", label: "Question" },
  { value: "other", label: "Something else" },
];

// The admin Submissions tab's tag for each kind of visitor submission. Solid
// palette colours, dark or white text picked for at least 4.5:1 contrast.
export const SUBMISSION_TAGS = {
  event: { label: "Event", plural: "Events", className: "bg-band text-ink" },
  link: { label: "Link", plural: "Links", className: "bg-go text-ink" },
  query: { label: "Query", plural: "Queries", className: "bg-cerulean text-white" },
};
