import { absoluteUrl, siteUrl } from "@/lib/site";

// Rendered per request, like sitemap.js: SITE_URL is a runtime setting, and a
// build-time render bakes in whatever the build machine had (localhost).
export const dynamic = "force-dynamic";

// Crawlers may read the public site; the admin panel and API are off limits
// (they also send noindex, since robots.txt alone doesn't remove a URL that
// is linked from elsewhere).
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
