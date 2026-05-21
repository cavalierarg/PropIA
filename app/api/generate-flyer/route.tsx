import { ImageResponse } from "next/og";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

type FlyerType = "feed" | "story" | "banner";

async function fetchImageAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get("content-type") || "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    type: FlyerType;
    imageUrl: string;
    precio: string;
    zona: string;
    metros: string;
    car1: string;
    car2: string;
    agente: string;
    primaryColor?: string;
    accentColor?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    type, imageUrl, precio, zona, metros, car1, car2, agente,
    primaryColor = "#1a2744",
    accentColor  = "#c9a227",
  } = body;

  let imageData: string;
  try {
    imageData = await fetchImageAsDataUrl(imageUrl);
  } catch {
    return NextResponse.json({ error: "Failed to fetch property image" }, { status: 400 });
  }

  const dims: Record<FlyerType, { width: number; height: number }> = {
    feed:   { width: 1080, height: 1080 },
    story:  { width: 1080, height: 1920 },
    banner: { width: 1200, height: 628  },
  };
  const { width, height } = dims[type] ?? dims.feed;

  /* ── Flyer 1: Feed 1080×1080 ── */
  if (type === "feed") {
    return new ImageResponse(
      (
        <div style={{ display: "flex", flexDirection: "column", width: 1080, height: 1080, fontFamily: "sans-serif", overflow: "hidden" }}>
          {/* Foto — 60% */}
          <div style={{ display: "flex", width: 1080, height: 648, flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageData} alt="" style={{ width: 1080, height: 648, objectFit: "cover", objectPosition: "center" }} />
          </div>

          {/* Panel inferior — 40% */}
          <div style={{ display: "flex", flexDirection: "column", width: 1080, height: 432, backgroundColor: primaryColor, padding: "44px 64px", flexShrink: 0 }}>
            {/* Precio */}
            <div style={{ display: "flex", fontSize: 82, fontWeight: 900, color: accentColor, lineHeight: 1, letterSpacing: "-2px" }}>
              {precio}
            </div>

            {/* Zona · m² */}
            <div style={{ display: "flex", fontSize: 36, color: "rgba(255,255,255,0.85)", marginTop: 14, marginBottom: "auto" }}>
              {zona}&nbsp;·&nbsp;{metros} m²
            </div>

            {/* Fila inferior */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {agente ? (
                  <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.45)" }}>{agente}</div>
                ) : null}
                <div style={{ display: "flex", backgroundColor: accentColor, color: primaryColor, fontSize: 28, fontWeight: 800, padding: "14px 36px", borderRadius: 100 }}>
                  Consultá ahora
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      { width, height }
    );
  }

  /* ── Flyer 2: Story 1080×1920 ── */
  if (type === "story") {
    return new ImageResponse(
      (
        <div style={{ display: "flex", flexDirection: "column", width: 1080, height: 1920, fontFamily: "sans-serif", overflow: "hidden" }}>
          {/* Foto — 50% */}
          <div style={{ display: "flex", width: 1080, height: 960, flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageData} alt="" style={{ width: 1080, height: 960, objectFit: "cover", objectPosition: "center" }} />
          </div>

          {/* Panel inferior — 50% */}
          <div style={{ display: "flex", flexDirection: "column", width: 1080, height: 960, backgroundColor: primaryColor, padding: "72px 80px 80px", flexShrink: 0 }}>
            {/* Precio */}
            <div style={{ display: "flex", fontSize: 112, fontWeight: 900, color: accentColor, lineHeight: 1, letterSpacing: "-3px" }}>
              {precio}
            </div>

            {/* Zona · m² */}
            <div style={{ display: "flex", fontSize: 48, color: "rgba(255,255,255,0.82)", marginTop: 20, marginBottom: 36 }}>
              {zona}&nbsp;·&nbsp;{metros} m²
            </div>

            {/* Característica 1 */}
            {car1 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
                <div style={{ display: "flex", width: 36, height: 36, backgroundColor: accentColor, borderRadius: "50%", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22, color: primaryColor, fontWeight: 900 }}>
                  ✓
                </div>
                <div style={{ display: "flex", fontSize: 42, color: "rgba(255,255,255,0.8)" }}>{car1}</div>
              </div>
            ) : null}

            {/* Característica 2 */}
            {car2 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: "auto" }}>
                <div style={{ display: "flex", width: 36, height: 36, backgroundColor: accentColor, borderRadius: "50%", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22, color: primaryColor, fontWeight: 900 }}>
                  ✓
                </div>
                <div style={{ display: "flex", fontSize: 42, color: "rgba(255,255,255,0.8)" }}>{car2}</div>
              </div>
            ) : (
              <div style={{ display: "flex", marginBottom: "auto" }} />
            )}

            {/* CTA + agente */}
            <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 20 }}>
              <div style={{ display: "flex", backgroundColor: accentColor, color: primaryColor, fontSize: 44, fontWeight: 800, padding: "22px 64px", borderRadius: 100, alignSelf: "flex-start" }}>
                Consultá ahora
              </div>
              {agente ? (
                <div style={{ display: "flex", fontSize: 30, color: "rgba(255,255,255,0.4)" }}>{agente}</div>
              ) : null}
            </div>
          </div>
        </div>
      ),
      { width, height }
    );
  }

  /* ── Flyer 3: Banner 1200×628 ── */
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: 1200, height: 628, fontFamily: "sans-serif", overflow: "hidden" }}>
        {/* Foto izquierda — 45% */}
        <div style={{ display: "flex", width: 540, height: 628, flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageData} alt="" style={{ width: 540, height: 628, objectFit: "cover", objectPosition: "center" }} />
        </div>

        {/* Panel derecho — 55% */}
        <div style={{ display: "flex", flexDirection: "column", width: 660, height: 628, backgroundColor: primaryColor, padding: "44px 52px", flexShrink: 0 }}>
          {/* Precio */}
          <div style={{ display: "flex", fontSize: 64, fontWeight: 900, color: accentColor, lineHeight: 1, letterSpacing: "-2px" }}>
            {precio}
          </div>

          {/* Zona · m² */}
          <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.82)", marginTop: 14, marginBottom: 22 }}>
            {zona}&nbsp;·&nbsp;{metros} m²
          </div>

          {/* Característica 1 */}
          {car1 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", color: accentColor, fontSize: 24, fontWeight: 900 }}>✓</div>
              <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.78)" }}>{car1}</div>
            </div>
          ) : null}

          {/* Característica 2 */}
          {car2 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{ display: "flex", color: accentColor, fontSize: 24, fontWeight: 900 }}>✓</div>
              <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.78)" }}>{car2}</div>
            </div>
          ) : null}

          {/* CTA + agente */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 10 }}>
            {agente ? (
              <div style={{ display: "flex", fontSize: 18, color: "rgba(255,255,255,0.4)" }}>{agente}</div>
            ) : null}
            <div style={{ display: "flex" }}>
              <div style={{ display: "flex", backgroundColor: accentColor, color: primaryColor, fontSize: 24, fontWeight: 800, padding: "14px 36px", borderRadius: 100 }}>
                Consultá ahora
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width, height }
  );
}
