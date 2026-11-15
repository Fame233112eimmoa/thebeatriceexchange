import { ImageResponse } from "next/og";

import { site } from "@/data/site";

/**
 * The preview image shown when the site is shared (Google, Facebook, iMessage,
 * etc.). Generated as a PNG at build time; product pages use their own photo.
 */
export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#15161b",
          color: "#faf7f1",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", width: 120, height: 120, alignItems: "center", justifyContent: "center", border: "3px solid #b8955a", transform: "rotate(45deg)" }}>
          <div style={{ display: "flex", transform: "rotate(-45deg)", fontSize: 64, color: "#faf7f1" }}>B</div>
        </div>
        <div style={{ display: "flex", marginTop: 56, fontSize: 76, letterSpacing: 6 }}>BHS PREMIER</div>
        <div style={{ display: "flex", marginTop: 12, fontSize: 30, letterSpacing: 14, color: "#d9c39a" }}>PAWN &amp; JEWELRY</div>
        <div style={{ display: "flex", marginTop: 44, fontSize: 30, color: "#cfc9bd" }}>{site.tagline}</div>
      </div>
    ),
    size,
  );
}
