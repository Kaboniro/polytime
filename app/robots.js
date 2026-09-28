import { absoluteUrl, siteUrl } from "@/lib/site";

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
