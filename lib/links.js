// "https://www.polyhaven.com/textures" -> "polyhaven.com": what the Links
// cards show, and the key the site-icon route stores icons under.
export function linkDomain(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}
