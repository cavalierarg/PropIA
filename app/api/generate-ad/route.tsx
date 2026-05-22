import { ImageResponse } from "next/og";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

type AdType = "feed" | "story" | "banner";

const BLUE = "#0f3460";
const CYAN = "#00c9c9";
const WHITE = "#ffffff";

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
    type: AdType;
    imageUrl: string;
    precio: string;
    zona: string;
    metros: string;
    car1?: string;
    car2?: string;
    agente?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, imageUrl, precio, zona, metros, car1 = "", car2 = "", agente = "" } = body;

  let imageData: string;
  try {
    imageData = await fetchImageAsDataUrl(imageUrl);
  } catch {
    return NextResponse.json({ error: "Failed to fetch property image" }, { status: 400 });
  }

  const dims: Record<AdType, { width: number; height: number }> = {
    feed:   { width: 1080, height: 1080 },
    story:  { width: 1080, height: 1920 },
    banner: { width: 1200, height: 628  },
  };
  const { width, height } = dims[type] ?? dims.feed;

  /* ── Ad Feed 1080×1080 ── */
  if (type === "feed") {
    return new ImageResponse(
      (
        <div style={{ display: "flex", flexDirection: "column", width: 1080, height: 1080, fontFamily: "sans-serif", overflow: "hidden" }}>
          {/* Foto — 55% = 594px */}
          <div style={{ display: "flex", width: 1080, height: 594, flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageData} alt="" style={{ width: 1080, height: 594, objectFit: "cover", objectPosition: "center" }} />
          </div>

          {/* Franja azul — 45% = 486px */}
          <div style={{ display: "flex", flexDirection: "column", width: 1080, height: 486, backgroundColor: BLUE, padding: "36px 60px 40px", flexShrink: 0 }}>
            {/* Precio en cyan grande */}
            <div style={{ display: "flex", fontSize: 86, fontWeight: 900, color: CYAN, lineHeight: 1, letterSpacing: "-2px" }}>
              {precio}
            </div>
            {/* Zona y m² en blanco */}
            <div style={{ display: "flex", fontSize: 34, color: WHITE, marginTop: 12, opacity: 0.9 }}>
              {zona}&nbsp;·&nbsp;{metros} m²
            </div>
            {/* Fila inferior: CTA izquierda, agencia derecha */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", width: "100%", marginTop: "auto" }}>
              <div style={{ display: "flex", backgroundColor: CYAN, color: BLUE, fontSize: 28, fontWeight: 800, padding: "14px 38px", borderRadius: 100 }}>
                Consultá ahora
              </div>
              {agente ? (
                <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: WHITE }}>
                  {agente}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ),
      { width, height }
    );
  }

  /* ── Ad Story 1080×1920 ── */
  if (type === "story") {
    return new ImageResponse(
      (
        <div style={{ display: "flex", flexDirection: "column", width: 1080, height: 1920, fontFamily: "sans-serif", overflow: "hidden" }}>
          {/* Foto — 50% = 960px */}
          <div style={{ display: "flex", width: 1080, height: 960, flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageData} alt="" style={{ width: 1080, height: 960, objectFit: "cover", objectPosition: "center" }} />
          </div>

          {/* Gradiente azul oscuro — 50% = 960px */}
          <div style={{
            display: "flex", flexDirection: "column", width: 1080, height: 960,
            background: "linear-gradient(180deg, #091b33 0%, #0f3460 55%, #0a2248 100%)",
            padding: "60px 80px 70px", flexShrink: 0,
          }}>
            {/* Precio centrado grande */}
            <div style={{ display: "flex", justifyContent: "center", fontSize: 100, fontWeight: 900, color: CYAN, lineHeight: 1, letterSpacing: "-3px" }}>
              {precio}
            </div>
            {/* Zona · m² centrado */}
            <div style={{ display: "flex", justifyContent: "center", fontSize: 42, color: WHITE, marginTop: 18, opacity: 0.85, marginBottom: 44 }}>
              {zona}&nbsp;·&nbsp;{metros} m²
            </div>

            {/* Características en lista */}
            {car1 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", width: 40, height: 40, backgroundColor: CYAN, borderRadius: "50%", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22, color: BLUE, fontWeight: 900 }}>✓</div>
                <div style={{ display: "flex", fontSize: 38, color: WHITE, opacity: 0.85 }}>{car1}</div>
              </div>
            ) : null}
            {car2 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ display: "flex", width: 40, height: 40, backgroundColor: CYAN, borderRadius: "50%", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22, color: BLUE, fontWeight: 900 }}>✓</div>
                <div style={{ display: "flex", fontSize: 38, color: WHITE, opacity: 0.85 }}>{car2}</div>
              </div>
            ) : null}

            {/* CTA + agencia centrada abajo */}
            <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", alignItems: "center", gap: 24 }}>
              <div style={{ display: "flex", backgroundColor: CYAN, color: BLUE, fontSize: 44, fontWeight: 800, padding: "22px 80px", borderRadius: 100 }}>
                Consultá ahora
              </div>
              {agente ? (
                <div style={{ display: "flex", justifyContent: "center", fontSize: 32, fontWeight: 700, color: WHITE }}>
                  {agente}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ),
      { width, height }
    );
  }

  /* ── Ad Banner 1200×628 ── */
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: 1200, height: 628, fontFamily: "sans-serif", overflow: "hidden" }}>
        {/* Foto izquierda — 45% = 540px */}
        <div style={{ display: "flex", width: 540, height: 628, flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageData} alt="" style={{ width: 540, height: 628, objectFit: "cover", objectPosition: "center" }} />
        </div>

        {/* Panel azul derecho — 55% = 660px */}
        <div style={{ display: "flex", flexDirection: "column", width: 660, height: 628, backgroundColor: BLUE, padding: "36px 50px 40px", flexShrink: 0 }}>
          {/* Precio */}
          <div style={{ display: "flex", fontSize: 60, fontWeight: 900, color: CYAN, lineHeight: 1, letterSpacing: "-2px" }}>
            {precio}
          </div>
          {/* Zona · m² */}
          <div style={{ display: "flex", fontSize: 24, color: WHITE, marginTop: 10, marginBottom: 20, opacity: 0.88 }}>
            {zona}&nbsp;·&nbsp;{metros} m²
          </div>

          {/* Características con checkmarks en cyan */}
          {car1 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", color: CYAN, fontSize: 22, fontWeight: 900 }}>✓</div>
              <div style={{ display: "flex", fontSize: 20, color: WHITE, opacity: 0.82 }}>{car1}</div>
            </div>
          ) : null}
          {car2 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", color: CYAN, fontSize: 22, fontWeight: 900 }}>✓</div>
              <div style={{ display: "flex", fontSize: 20, color: WHITE, opacity: 0.82 }}>{car2}</div>
            </div>
          ) : null}

          {/* CTA + agencia abajo derecha */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 12 }}>
            <div style={{ display: "flex" }}>
              <div style={{ display: "flex", backgroundColor: CYAN, color: BLUE, fontSize: 22, fontWeight: 800, padding: "14px 36px", borderRadius: 100 }}>
                Consultá ahora
              </div>
            </div>
            {agente ? (
              <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 20, fontWeight: 700, color: WHITE }}>
                {agente}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    { width, height }
  );
}
