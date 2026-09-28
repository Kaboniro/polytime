import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

// The 1200x630 card shown when a page is shared (Slack, Discord, X, Facebook,
// search previews). Generated at request time from the site palette; Latin
// text only, since the built-in font has no CJK glyphs.
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const dot = (bg) => ({ width: 44, height: 44, borderRadius: 22, background: bg, marginRight: 14 });
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fef9ef", padding: 72, position: "relative" }}>
        <div style={{ display: "flex", position: "absolute", right: -120, top: -120, width: 460, height: 460, borderRadius: 230, background: "#fe6d73" }} />
        <div style={{ display: "flex", position: "absolute", right: 150, bottom: -150, width: 360, height: 360, borderRadius: 180, background: "#17c3b2" }} />
        <div style={{ display: "flex", position: "absolute", right: 420, top: 80, width: 150, height: 150, borderRadius: 75, background: "#ffcb77" }} />
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={dot("#227c9d")} />
          <div style={{ fontSize: 44, fontWeight: 700, color: "#0f2a35" }}>{SITE_NAME}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 86, fontWeight: 800, lineHeight: 1.05, color: "#0f2a35", maxWidth: 760 }}>3D art events, in one place</div>
          <div style={{ fontSize: 34, color: "#227c9d", marginTop: 24, maxWidth: 760 }}>Competitions, conferences and challenges from around the world</div>
        </div>
      </div>
    ),
    size
  );
}
