import LinkCard from "@/components/LinkCard";
import FilterBar from "@/components/FilterBar";
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

export default async function LinksPage({ searchParams }) {
  const sp = await searchParams;
  const category = pickOption(sp?.category, LINK_CATEGORIES);
  const pageNum = Math.max(1, parseInt(sp?.page, 10) || 1);
  const allLinks = getApprovedLinks({ category });

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

      <FilterBar
        basePath="/links"
        filters={[{ name: "category", label: "Category", allLabel: "All categories", options: LINK_CATEGORIES, value: category }]}
      />

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
              {links.map((l, i) => (
                <LinkCard key={l.id} l={l} index={i} />
              ))}
            </div>
          </ViewportGrid>
          <Pagination page={page} totalPages={totalPages} basePath="/links" query={pageQuery} />
        </>
      )}
    </div>
  );
}
