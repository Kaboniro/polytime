import { requireAdminPage } from "@/lib/adminGuard";
import { PUBLIC_PATHS, RANGE_LABELS, getActivityReport, parsePageFilter, parseRange } from "@/lib/analytics";
import { geographyIconInfo, geographyLabel } from "@/lib/geography";
import GeoIcon from "@/components/GeoIcon";
import HeadingInfo from "@/components/HeadingInfo";
import StatTile from "@/components/admin/StatTile";
import ActivityControls from "@/components/admin/ActivityControls";
import { Heatmap, TrendChart } from "@/components/admin/ActivityCharts";
import { Delta, SplitBar } from "@/components/admin/ActivityParts";
import PagedBarList from "@/components/admin/PagedBarList";
import { count, duration, pageLabel, percent } from "@/components/admin/activityFormat";

export const dynamic = "force-dynamic";
export const metadata = { title: "Activity — PolyTime Admin" };

function Card({ title, note, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 ${className}`}>
      <h2 className="text-sm font-semibold text-neutral-50">{title}</h2>
      {note && <p className="mt-0.5 mb-3 text-xs text-neutral-500">{note}</p>}
      {!note && <div className="mb-3" />}
      {children}
    </section>
  );
}

export default async function ActivityPage({ searchParams }) {
  await requireAdminPage();
  const sp = await searchParams;
  const range = parseRange(sp?.range);
  const page = parsePageFilter(sp?.page);
  const r = getActivityReport({ range, page });
  const { current: c, previous: p } = r;
  const vs = p ? `vs previous ${RANGE_LABELS[range].toLowerCase()}` : "";

  const sub = (cur, prev, opts) => (
    <span className="inline-flex flex-wrap gap-x-1.5">
      <Delta current={cur} previous={prev} {...opts} />
      {p && <span className="text-neutral-500">{vs}</span>}
    </span>
  );

  return (
    <div>
      <div className="mb-5">
        <HeadingInfo as="h1" title="Activity">
          Visitors who accepted the cookie banner — a fraction of total traffic, not all of it. Nothing here
          is tied to a name or account, only a random id. Times are UTC. A <em>session</em> is one visitor's
          run of page views with no gap over 30 minutes; a <em>bounce</em> is a session of a single page. See{" "}
          <a href="/privacy" className="text-orange-400 hover:underline">/privacy</a> for what's collected.
        </HeadingInfo>
      </div>

      <ActivityControls range={range} page={page} pages={PUBLIC_PATHS} />

      {r.hiddenViews > 0 && (
        <p className="mb-5 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-400">
          {r.hiddenViews.toLocaleString()} recorded view{r.hiddenViews === 1 ? "" : "s"} of pages that don't
          exist on the site (
          {r.hiddenPaths.map((h, i) => (
            <span key={h.path}>
              {i > 0 && ", "}
              <code className="text-neutral-200">{h.path}</code> ×{h.views}
            </span>
          ))}
          ) are ignored in every number below.
        </p>
      )}

      {c.views === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-10 text-center text-neutral-500">
          No activity in this period{page ? ` on ${pageLabel(page)}` : ""} — either nobody visited, or nobody has
          accepted the cookie banner yet. Try a longer range.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Page views" value={count(c.views)} sub={sub(c.views, p?.views, { minBase: 10 })} />
            <StatTile label="Unique visitors" value={count(c.visitors)} sub={sub(c.visitors, p?.visitors, { minBase: 10 })} />
            <StatTile label="Sessions" value={count(c.sessions)} sub={sub(c.sessions, p?.sessions, { minBase: 10 })} />
            <StatTile label="Pages per session" value={c.pagesPerSession.toFixed(1)} sub={sub(c.pagesPerSession, p?.pagesPerSession)} />
            <StatTile label="Bounce rate" value={percent(c.bounceRate)} sub={sub(c.bounceRate, p?.bounceRate, { goodWhenDown: true })} />
            <StatTile label="Avg. session" value={duration(c.avgSeconds)} sub={sub(c.avgSeconds, p?.avgSeconds)} />
          </div>

          <Card title="Traffic over time" note={`${RANGE_LABELS[range]}${page ? ` · ${pageLabel(page)}` : ""}`}>
            <TrendChart data={r.trend} weekly={r.weekly} />
          </Card>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Card title="When visitors come" note="Page views by weekday and hour of day (UTC).">
              <Heatmap heat={r.heat} />
            </Card>
            <Card title="New vs returning" note="New = first ever visit falls in this period.">
              <SplitBar a={{ label: "New visitors", value: r.newVisitors }} b={{ label: "Returning visitors", value: r.returningVisitors }} />
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
            <Card title="Top pages" note={page ? "Filtered to one page." : "Only pages that exist on the site."}>
              <PagedBarList
                items={r.topPages.map((t) => ({
                  key: t.path,
                  label: (
                    <>
                      {t.title || pageLabel(t.path)} <code className="ml-1 text-xs text-neutral-500">{t.path}</code>
                    </>
                  ),
                  value: t.views,
                  sub: `${count(t.visitors)} visitor${t.visitors === 1 ? "" : "s"} · ${percent(t.views / c.views)}`,
                }))}
              />
            </Card>
            <Card title="Where visitors go next" note="Moves from one page to another on this site.">
              <PagedBarList
                tone="flow"
                empty="No navigation between pages recorded yet."
                items={r.flows.map((f) => ({
                  key: `${f.from}>${f.to}`,
                  label: `${pageLabel(f.from)} → ${pageLabel(f.to)}`,
                  value: f.n,
                }))}
              />
            </Card>

          <Card title="Visitors by country" note="Best-effort, from a header Cloudflare or Vercel add to each request.">
            {r.countries.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No location data in this period. Countries come from the header Cloudflare adds to each visit, so
                only visits made through Cloudflare (and with the cookie banner accepted) have one.
              </p>
            ) : (
              <PagedBarList
                tone="visitors"
                items={r.countries.map((k) => {
                  const value = `country:${k.country}`;
                  return {
                    key: k.country,
                    label: (
                      <span className="inline-flex items-center gap-1.5">
                        <GeoIcon info={geographyIconInfo(value)} /> {geographyLabel(value)}
                      </span>
                    ),
                    value: k.views,
                    sub: `${count(k.visitors)} visitor${k.visitors === 1 ? "" : "s"}`,
                  };
                })}
              />
            )}
            {r.unknownLocationViews > 0 && r.countries.length > 0 && (
              <p className="mt-3 text-xs text-neutral-500">{count(r.unknownLocationViews)} view(s) had no location.</p>
            )}
          </Card>
          </div>
        </div>
      )}
    </div>
  );
}
