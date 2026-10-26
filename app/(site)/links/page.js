import LinkCard, { linkColor } from "@/components/LinkCard";
import HeadingInfo from "@/components/HeadingInfo";
import Pagination from "@/components/Pagination";
import { EmptyState, ViewportGrid } from "@/components/polytime-ui";
import { pickOption } from "@/lib/filters";
import { LINK_CATEGORIES } from "@/lib/constants";
import { getApprovedLinks } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Useful links for 3D artists",
  description: "Communities, tools, plugins, asset libraries and tutorials worth knowing about, curated for 3D artists.",
  alternates: { canonical: "/links" },
};

const PAGE_SIZE = 25;

// Short names for the tabs; the full labels (LINK_CATEGORIES) stay on the cards.
const TAB_LABEL = {
  community: "Community",
  tool: "Tools & plugins",
  software: "Software",
  "asset-library": "Asset libraries",
  "3d-printing": "3D printing",
  tutorial: "Tutorials",
  "job-board": "Jobs",
  other: "Other",
};
const ORDER = Object.fromEntries(LINK_CATEGORIES.map((c, i) => [c.value, i]));

// One tab per category in that category's card color, so "filter by color"
// and "filter by category" are the same click. Plain links, like the rest of
// the site's filters (see FilterBar.js on why there's no client-side routing).
function CategoryTabs({ category, counts, total }) {
  const tabs = [{ value: "all", label: "All", count: total }, ...LINK_CATEGORIES.map((c) => ({ value: c.value, label: TAB_LABEL[c.value] || c.label, count: counts[c.value] || 0 }))];
  return (
    <nav aria-label="Link categories" className="mb-6 flex flex-wrap gap-2">
      {tabs.map((t) => {
        const active = t.value === category;
        const c = t.value === "all" ? { fill: "var(--color-neutral-50)", edge: "var(--color-neutral-50)", ink: "var(--color-neutral-950)" } : linkColor(t.value);
        return (
          <a
            key={t.value}
            href={t.value === "all" ? "/links" : `/links?category=${t.value}`}
            aria-current={active ? "page" : undefined}
            style={{ "--tab-fill": c.fill, "--tab-edge": c.edge, "--tab-ink": c.ink }}
            className={`inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-sm no-underline transition-colors ${
              active
                ? "border-[var(--tab-edge)] bg-[var(--tab-fill)] font-semibold text-[var(--tab-ink)]"
                : "border-neutral-800 text-neutral-300 hover:border-[var(--tab-edge)]"
            } ${t.count === 0 && !active ? "opacity-50" : ""}`}
          >
            {t.value !== "all" && (
              <span className={`h-3 w-3 shrink-0 rounded-full ${active ? "ring-2 ring-[var(--tab-ink)]/40" : ""}`} style={{ backgroundColor: c.fill }} aria-hidden="true" />
            )}
            {t.label}
            <span className={`text-xs ${active ? "" : "text-neutral-500"}`}>{t.count}</span>
          </a>
        );
      })}
    </nav>
  );
}

export default async function LinksPage({ searchParams }) {
  const sp = await searchParams;
  const category = pickOption(sp?.category, LINK_CATEGORIES);
  const pageNum = Math.max(1, parseInt(sp?.page, 10) || 1);
  // Everything once: the tabs need every category's count. "All" is grouped by
  // category in tab order (so same-colored cards sit together), then by title.
  const everything = getApprovedLinks();
  const counts = {};
  for (const l of everything) counts[l.category] = (counts[l.category] || 0) + 1;
  const allLinks =
    category === "all"
      ? [...everything].sort((a, b) => (ORDER[a.category] ?? 99) - (ORDER[b.category] ?? 99) || a.title.localeCompare(b.title))
      : everything.filter((l) => l.category === category);

  const totalPages = Math.max(1, Math.ceil(allLinks.length / PAGE_SIZE));
  const page = Math.min(pageNum, totalPages);
  const links = allLinks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Plain serializable data, not a function — a Server Component can't hand
  // a function prop to Pagination (a Client Component) at all.
  const pageQuery = {};
  if (category !== "all") pageQuery.category = category;

  return (
    <div>
      <div className="mb-8">
        <HeadingInfo as="h1" title="Useful links">
          Communities, tools, asset libraries, and tutorials worth knowing about.
        </HeadingInfo>
      </div>

      <CategoryTabs category={category} counts={counts} total={everything.length} />

      {allLinks.length === 0 ? (
        <EmptyState>
          Nothing listed yet.{" "}
          <a href="/submit" className="text-orange-400 hover:underline">
            Suggest one.
          </a>
        </EmptyState>
      ) : (
        <>
          <ViewportGrid as="div" gridSize={40} className="mb-4 rounded-2xl border border-neutral-800 p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {links.map((l) => (
                <LinkCard key={l.id} l={l} />
              ))}
            </div>
          </ViewportGrid>
          <Pagination page={page} totalPages={totalPages} basePath="/links" query={pageQuery} />
        </>
      )}
    </div>
  );
}
