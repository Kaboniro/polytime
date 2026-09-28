// Site-wide constants used for SEO (canonical URLs, sitemap, structured data,
// social cards). Set SITE_URL in the environment to the address the site is
// actually served from, e.g. https://polytime.example — every absolute URL
// (canonicals, sitemap entries, share images) is built from it. Without it,
// localhost is used, which is fine for development but must not be deployed.
export const SITE_NAME = "PolyTime";
export const SITE_TAGLINE = "3D art events, competitions & challenges";
export const SITE_DESCRIPTION =
  "A community-curated calendar of 3D art competitions, conferences, rolling challenges and ongoing contests from around the world, plus a directory of useful communities, tools and tutorials.";

export function siteUrl() {
  const raw = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").trim();
  return raw.replace(/\/+$/, "");
}

export const absoluteUrl = (path = "/") => siteUrl() + (path.startsWith("/") ? path : "/" + path);

export function isProductionUrl() {
  return !/localhost|127\.0\.0\.1/.test(siteUrl());
}
