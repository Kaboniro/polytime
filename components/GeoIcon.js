// Renders the icon half of a geography value: a real flag image for a
// country (an SVG from the flag-icons package, via its CSS class), or a
// plain globe emoji for a region/International. See lib/geography.js's
// geographyIconInfo for why these need different treatment — a flag emoji
// doesn't render as a picture on Windows. `info` is that function's return
// value. aria-hidden since callers always show the text label right next to it.
export default function GeoIcon({ info }) {
  if (info.kind === "flag") {
    return <span className={`fi ${info.className}`} aria-hidden="true" />;
  }
  return <span aria-hidden="true">{info.glyph}</span>;
}
