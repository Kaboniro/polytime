import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

// The 1200x630 card shown when a page is shared (Slack, Discord, X, Facebook,
// search previews). Generated at request time from the site palette; Latin
// text only, since the built-in font has no CJK glyphs.
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The PolyTime hexagon-clock logo: same six section colors as the header
// logo (HexClockLogo) and app/icon.svg.
function Logo({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ marginRight: 18 }}>
      <polygon points="32,32 32,3 57,17.5" fill="#eda100" />
      <polygon points="32,32 57,17.5 57,46.5" fill="#eb6834" />
      <polygon points="32,32 57,46.5 32,61" fill="#e34948" />
      <polygon points="32,32 32,61 7,46.5" fill="#4a3aa7" />
      <polygon points="32,32 7,46.5 7,17.5" fill="#2a78d6" />
      <polygon points="32,32 7,17.5 32,3" fill="#1baf7a" />
      <circle cx="32" cy="32" r="12" fill="#fef9ef" />
      <path d="M32 32V24M32 32l6 4" stroke="#0f2a35" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fef9ef", padding: 72, position: "relative" }}>
        <div style={{ display: "flex", position: "absolute", right: -120, top: -120, width: 460, height: 460, borderRadius: 230, background: "#fe6d73" }} />
        <div style={{ display: "flex", position: "absolute", right: 30, bottom: -190, width: 360, height: 360, borderRadius: 180, background: "#17c3b2" }} />
        <div style={{ display: "flex", position: "absolute", right: 420, top: 80, width: 150, height: 150, borderRadius: 75, background: "#ffcb77" }} />
        <div style={{ display: "flex", alignItems: "center" }}>
          <Logo size={72} />
          <div style={{ fontSize: 48, fontWeight: 700, color: "#0f2a35" }}>{SITE_NAME}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 86, fontWeight: 800, lineHeight: 1.05, color: "#0f2a35", maxWidth: 760 }}>3D art events, in one place</div>
          <div style={{ fontSize: 34, color: "#227c9d", marginTop: 24, maxWidth: 700 }}>Competitions, conferences and challenges from around the world</div>
        </div>
      </div>
    ),
    size
  );
}
