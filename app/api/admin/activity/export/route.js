import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminGuard";
import { getActivityReport, getRawViews } from "@/lib/analytics";
import { toCsv } from "@/lib/csv";
import { geographyLabel } from "@/lib/geography";

export const dynamic = "force-dynamic";

// GET /api/admin/activity/export?type=views|daily|pages|countries|flows|report
//                               &range=7d|30d|90d|365d|all&page=/links&format=csv|json
// Same scope as the Activity tab (only pages that exist, UTC times). `views`
// is the raw page-view rows; `report` is the whole report as JSON.
const TABLES = {
  views: { columns: [["id", "ID"], ["created_at", "Time (UTC)"], ["path", "Page"], ["referrer_path", "Came from"], ["country", "Country"], ["region", "Region"], ["visitor_id", "Visitor ID"]] },
  daily: { columns: [["date", "Date (UTC)"], ["views", "Page views"], ["visitors", "Unique visitors"]] },
  pages: { columns: [["path", "Page"], ["views", "Page views"], ["visitors", "Unique visitors"], ["share", "Share of views (%)"]] },
  countries: { columns: [["country", "Country code"], ["name", "Country"], ["views", "Page views"], ["visitors", "Unique visitors"]] },
  flows: { columns: [["from", "From"], ["to", "To"], ["n", "Times"]] },
};

export async function GET(req) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "report";
  const format = url.searchParams.get("format") === "json" ? "json" : "csv";
  const range = url.searchParams.get("range");
  const page = url.searchParams.get("page");

  if (type !== "report" && !TABLES[type]) {
    return NextResponse.json({ error: "Unknown export type." }, { status: 400 });
  }

  const report = getActivityReport({ range, page });
  const stamp = new Date().toISOString().slice(0, 10);
  const base = `polytime-activity-${type}-${report.range}${report.page ? "-" + (report.page === "/" ? "home" : report.page.replace(/\W+/g, "")) : ""}-${stamp}`;

  let rows;
  if (type === "report") {
    // The heatmap and trend are included in full; nothing here is personal data.
    return download(JSON.stringify({ generatedAt: new Date().toISOString(), timezone: "UTC", ...report }, null, 2), "application/json", `${base}.json`);
  } else if (type === "views") {
    rows = getRawViews({ range, page });
  } else if (type === "daily") {
    rows = report.trend;
  } else if (type === "pages") {
    const total = report.current.views || 1;
    rows = report.topPages.map((p) => ({ ...p, share: Math.round((p.views / total) * 1000) / 10 }));
  } else if (type === "countries") {
    rows = report.countries.map((c) => ({ ...c, name: geographyLabel(`country:${c.country}`) }));
  } else {
    rows = report.flows;
  }

  if (format === "json") return download(JSON.stringify(rows, null, 2), "application/json", `${base}.json`);
  const columns = TABLES[type].columns.map(([key, label]) => ({ key, label }));
  return download(toCsv(rows, columns), "text/csv; charset=utf-8", `${base}.csv`);
}

function download(body, type, filename) {
  return new NextResponse(body, {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
