import { getSitemapEvents } from "@/lib/queries";
import { absoluteUrl } from "@/lib/site";
import { eventPath } from "@/lib/seo";

// Regenerated on every request so newly approved events appear immediately.
export const dynamic = "force-dynamic";

const STATIC = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/timeline", changeFrequency: "daily", priority: 0.8 },
  { path: "/links", changeFrequency: "weekly", priority: 0.7 },
  { path: "/submit", changeFrequency: "monthly", priority: 0.4 },
  { path: "/about", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap() {
  const now = new Date();
  const pages = STATIC.map((p) => ({ url: absoluteUrl(p.path), lastModified: now, changeFrequency: p.changeFrequency, priority: p.priority }));
  const events = getSitemapEvents().map((e) => ({
    url: absoluteUrl(eventPath(e)),
    lastModified: new Date(e.created_at.replace(" ", "T") + "Z"),
    changeFrequency: "weekly",
    priority: e.ended ? 0.3 : 0.6,
  }));
  return [...pages, ...events];
}
