import { ImageResponse } from "next/og";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { logFeatureUsage } from "@/lib/actions/analytics.actions";
import { checkAndIncrementUsage } from "@/lib/actions/usage.actions";
import sharp from "sharp";

export const runtime = "nodejs";

const FF = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const W = 1080;
const H = 1080;
const OPTS = { width: W, height: H };
const DARK_BLUE = "#0f3460";
const N = 5;

const BADGE_BG: Record<string, string> = {
  "En Venta": "#16a34a",
  "Alquiler": "#2563eb",
  "Alquiler temporal": "#0891b2",
};

function formatPrecio(precio: string): string {
  return precio.replace(/\d+/g, (n) =>
    n.length > 3 ? n.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : n
  );
}

async function toDataUrl(url: string): Promise<string> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get("content-type") || "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function processLogo(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const inputBuf = Buffer.from(await res.arrayBuffer());

    const { data, info } = await sharp(inputBuf)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = new Uint8ClampedArray(data.buffer);
    const { width, height } = info;

    const corners = [
      [0, 0], [width - 1, 0],
      [0, height - 1], [width - 1, height - 1],
    ] as const;

    let sumR = 0, sumG = 0, sumB = 0;
    for (const [x, y] of corners) {
      const i = (y * width + x) * 4;
      sumR += pixels[i]; sumG += pixels[i + 1]; sumB += pixels[i + 2];
    }
    const bgR = Math.round(sumR / 4);
    const bgG = Math.round(sumG / 4);
    const bgB = Math.round(sumB / 4);

    const threshold = 30;
    for (let i = 0; i < pixels.length; i += 4) {
      if (
        Math.abs(pixels[i] - bgR) < threshold &&
        Math.abs(pixels[i + 1] - bgG) < threshold &&
        Math.abs(pixels[i + 2] - bgB) < threshold
      ) {
        pixels[i + 3] = 0;
      }
    }

    const pngBuf = await sharp(Buffer.from(pixels.buffer), {
      raw: { width, height, channels: 4 },
    }).png().toBuffer();

    return `data:image/png;base64,${pngBuf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabaseAdminClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();
  if (sub?.plan !== "pro_max" || sub?.status !== "active") {
    return NextResponse.json({ error: "PRO_MAX_REQUIRED" }, { status: 403 });
  }

  const usage = await checkAndIncrementUsage(userId);
  if (!usage.allowed) return NextResponse.json({ error: "LIMIT_REACHED" }, { status: 403 });

  let body: {
    slide: number;
    imageUrl?: string;
    precio: string;
    operacion: string;
    zona: string;
    metros: string;
    dormitorios?: string;
    banios?: string;
    cocheras?: string;
    caracteristicas?: string[];
    colorMarca: string;
    accentColor: string;
    nombreAgente: string;
    nombreAgencia?: string;
    whatsapp?: string;
    instagram?: string;
    logoUrl?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    slide,
    imageUrl,
    precio,
    operacion,
    zona,
    metros,
    dormitorios = "",
    banios = "",
    cocheras = "",
    caracteristicas = [],
    colorMarca = DARK_BLUE,
    accentColor = "#00c9c9",
    nombreAgente,
    nombreAgencia = "",
    whatsapp = "",
    instagram = "",
    logoUrl,
  } = body;

  const badgeBg = BADGE_BG[operacion] ?? "#16a34a";
  const precioFmt = formatPrecio(precio);
  const priceFontSize = precioFmt.length > 16 ? 72 : precioFmt.length > 12 ? 86 : 100;
  const igHandle = instagram ? `@${instagram.replace(/^@/, "")}` : "";

  try {
    // ── SLIDE 1 — Full-bleed foto + precio + badge + logo ────────
    if (slide === 1) {
      if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
      let imgData: string;
      try { imgData = await toDataUrl(imageUrl); }
      catch { return NextResponse.json({ error: "Could not fetch image" }, { status: 400 }); }

      let logoData: string | null = null;
      if (logoUrl) logoData = await processLogo(logoUrl);

      void logFeatureUsage("carrusel");

      return new ImageResponse(
        <div style={{ display: "flex", position: "relative", width: W, height: H, fontFamily: FF, overflow: "hidden" }}>
          <img src={imgData} alt="" style={{ position: "absolute", top: 0, left: 0, width: W, height: H, objectFit: "cover" }} />
          {/* Bottom gradient */}
          <div style={{ display: "flex", position: "absolute", bottom: 0, left: 0, right: 0, height: 580, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 50%, transparent 100%)" }} />
          {/* Top gradient for badge/counter readability */}
          <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: 220, background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)" }} />

          {/* Badge — top left */}
          <div style={{ display: "flex", position: "absolute", top: 52, left: 52, backgroundColor: badgeBg, padding: "14px 32px", borderRadius: 10 }}>
            <span style={{ color: "#fff", fontSize: 34, fontWeight: 700, letterSpacing: "0.06em" }}>{operacion.toUpperCase()}</span>
          </div>

          {/* Counter — top right */}
          <div style={{ display: "flex", position: "absolute", top: 52, right: 52, backgroundColor: "rgba(0,0,0,0.45)", padding: "14px 28px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)" }}>
            <span style={{ color: "rgba(255,255,255,0.88)", fontSize: 30, fontWeight: 600 }}>1 / {N}</span>
          </div>

          {/* Logo — bottom right */}
          {logoData ? (
            <img src={logoData} alt="" style={{ position: "absolute", bottom: 56, right: 52, height: 80, width: 200, objectFit: "contain", objectPosition: "right center" }} />
          ) : null}

          {/* Price + zona — bottom left */}
          <div style={{ display: "flex", position: "absolute", bottom: 72, left: 60, right: logoData ? 280 : 80, flexDirection: "column", gap: 14 }}>
            <span style={{ fontSize: priceFontSize, fontWeight: 900, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.02em" }}>{precioFmt}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", width: 6, height: 34, backgroundColor: accentColor, borderRadius: 3, flexShrink: 0 }} />
              <span style={{ fontSize: 34, color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>{zona}</span>
            </div>
          </div>
        </div>,
        OPTS
      );
    }

    // ── SLIDE 2 — LAS CIFRAS ─────────────────────────────────────
    if (slide === 2) {
      let imgData: string | null = null;
      if (imageUrl) {
        try { imgData = await toDataUrl(imageUrl); } catch { imgData = null; }
      }

      const stats = [
        dormitorios ? { value: dormitorios, label: "Dormitorios" } : null,
        banios ? { value: banios, label: "Baños" } : null,
        { value: metros, label: "m²" },
        cocheras ? { value: cocheras, label: "Cocheras" } : null,
      ].filter((s): s is { value: string; label: string } => s !== null);

      return new ImageResponse(
        <div style={{ display: "flex", position: "relative", width: W, height: H, fontFamily: FF, backgroundColor: colorMarca, overflow: "hidden" }}>
          {imgData ? (
            <img src={imgData} alt="" style={{ position: "absolute", top: 0, left: 0, width: W, height: H, objectFit: "cover", opacity: 0.22 }} />
          ) : null}
          <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15,52,96,0.70)" }} />

          <div style={{ display: "flex", position: "relative", flexDirection: "column", width: W, height: H, padding: "80px" }}>
            {/* Header */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 52 }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: accentColor, letterSpacing: "0.26em" }}>LAS CIFRAS</span>
              <div style={{ display: "flex", width: 80, height: 5, backgroundColor: accentColor, borderRadius: 3 }} />
            </div>

            {/* Stats 2x2 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 32, flex: 1 }}>
              {stats.map((s) => (
                <div key={s.label} style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 444, height: 334, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 24, padding: "36px 48px", gap: 10, border: "1px solid rgba(0,201,201,0.18)" }}>
                  <span style={{ fontSize: 108, fontWeight: 900, color: accentColor, lineHeight: 1 }}>{s.value}</span>
                  <span style={{ fontSize: 34, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Counter */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 24, marginTop: 12 }}>
              <span style={{ fontSize: 28, color: "rgba(255,255,255,0.32)", fontWeight: 500 }}>2 / {N}</span>
            </div>
          </div>
        </div>,
        OPTS
      );
    }

    // ── SLIDE 3 — QUÉ INCLUYE ────────────────────────────────────
    if (slide === 3) {
      const items = caracteristicas.slice(0, 7);
      const itemH = items.length > 5 ? 100 : 114;

      return new ImageResponse(
        <div style={{ display: "flex", position: "relative", flexDirection: "column", width: W, height: H, fontFamily: FF, backgroundColor: "#ffffff", padding: "80px" }}>
          {/* Top accent bar */}
          <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: 10, backgroundColor: accentColor }} />

          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 52, marginTop: 18 }}>
            <span style={{ fontSize: 48, fontWeight: 800, color: colorMarca, lineHeight: 1 }}>QUÉ INCLUYE</span>
            <div style={{ display: "flex", width: 80, height: 6, backgroundColor: accentColor, borderRadius: 3 }} />
          </div>

          {/* Features list with numbered circles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
            {items.map((c, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 28, height: itemH, backgroundColor: "#f8fafc", borderRadius: 16, padding: "0 36px", borderLeft: `6px solid ${accentColor}` }}>
                <div style={{ display: "flex", width: 50, height: 50, borderRadius: "50%", backgroundColor: accentColor, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontSize: 24, fontWeight: 900 }}>{idx + 1}</span>
                </div>
                <span style={{ fontSize: items.length > 5 ? 34 : 38, fontWeight: 500, color: "#1e293b" }}>{c}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24, marginTop: 16, borderTop: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", width: 5, height: 26, backgroundColor: colorMarca, borderRadius: 3 }} />
              <span style={{ fontSize: 26, color: "#94a3b8" }}>{zona}</span>
            </div>
            <span style={{ fontSize: 26, color: "#cbd5e1" }}>3 / {N}</span>
          </div>
        </div>,
        OPTS
      );
    }

    // ── SLIDE 4 — UBICACIÓN ──────────────────────────────────────
    if (slide === 4) {
      return new ImageResponse(
        <div style={{ display: "flex", position: "relative", flexDirection: "column", width: W, height: H, fontFamily: FF, backgroundColor: colorMarca, alignItems: "center", justifyContent: "center", padding: "80px" }}>
          {/* Left accent bar */}
          <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: 8, height: H, backgroundColor: accentColor }} />

          <span style={{ fontSize: 28, color: accentColor, letterSpacing: "0.28em", fontWeight: 700, marginBottom: 28 }}>UBICACIÓN</span>
          <span style={{ fontSize: zona.length > 20 ? 64 : zona.length > 14 ? 80 : 96, fontWeight: 900, color: "#ffffff", textAlign: "center", lineHeight: 1.15, marginBottom: 52 }}>{zona}</span>
          <div style={{ display: "flex", width: 100, height: 2, backgroundColor: "rgba(255,255,255,0.2)", marginBottom: 52 }} />
          <span style={{ fontSize: priceFontSize, fontWeight: 900, color: accentColor, letterSpacing: "-0.02em", marginBottom: 40 }}>{precioFmt}</span>

          <div style={{ display: "flex", backgroundColor: badgeBg, padding: "16px 52px", borderRadius: 48 }}>
            <span style={{ color: "#fff", fontSize: 32, fontWeight: 700 }}>{operacion}</span>
          </div>

          <span style={{ position: "absolute", bottom: 52, right: 56, fontSize: 28, color: "rgba(255,255,255,0.28)", fontWeight: 500 }}>4 / {N}</span>
        </div>,
        OPTS
      );
    }

    // ── SLIDE 5 — Contacto ───────────────────────────────────────
    if (slide === 5) {
      let logoData: string | null = null;
      if (logoUrl) logoData = await processLogo(logoUrl);

      return new ImageResponse(
        <div style={{ display: "flex", position: "relative", flexDirection: "column", width: W, height: H, fontFamily: FF, background: `linear-gradient(155deg, #0a1628 0%, ${colorMarca} 58%, rgba(0,201,201,0.10) 100%)`, alignItems: "center", justifyContent: "center", padding: "80px" }}>
          {/* Top accent */}
          <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: 10, backgroundColor: accentColor }} />

          {/* Logo */}
          {logoData ? (
            <img src={logoData} alt="" style={{ height: 110, width: 320, objectFit: "contain", objectPosition: "center", marginBottom: 32 }} />
          ) : (
            <div style={{ display: "flex", width: 100, height: 100, borderRadius: "50%", backgroundColor: accentColor, alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
              <span style={{ color: colorMarca, fontSize: 48, fontWeight: 900 }}>A</span>
            </div>
          )}

          {nombreAgencia ? (
            <span style={{ fontSize: 32, fontWeight: 700, color: accentColor, marginBottom: 8 }}>{nombreAgencia}</span>
          ) : null}

          <span style={{ fontSize: 54, fontWeight: 800, color: "#ffffff", marginBottom: 44, textAlign: "center", lineHeight: 1.2 }}>{nombreAgente}</span>

          <div style={{ display: "flex", width: 100, height: 3, backgroundColor: accentColor, borderRadius: 2, marginBottom: 44 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 26, alignItems: "center", marginBottom: 52 }}>
            {whatsapp ? (
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ display: "flex", width: 54, height: 54, borderRadius: 14, backgroundColor: "#25D366", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontSize: 22, fontWeight: 900 }}>WA</span>
                </div>
                <span style={{ fontSize: 40, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>{whatsapp}</span>
              </div>
            ) : null}
            {igHandle ? (
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ display: "flex", width: 54, height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0, background: "linear-gradient(135deg, #f9a825 0%, #e1306c 50%, #7c3aed 100%)" }}>
                  <span style={{ color: "#fff", fontSize: 22, fontWeight: 900 }}>IG</span>
                </div>
                <span style={{ fontSize: 40, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>{igHandle}</span>
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", backgroundColor: accentColor, padding: "24px 84px", borderRadius: 18 }}>
            <span style={{ color: colorMarca, fontSize: 44, fontWeight: 800 }}>Consultá ahora</span>
          </div>

          <span style={{ position: "absolute", bottom: 48, right: 56, fontSize: 28, color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>5 / {N}</span>

          {/* Bottom accent */}
          <div style={{ display: "flex", position: "absolute", bottom: 0, left: 0, right: 0, height: 8, backgroundColor: accentColor }} />
        </div>,
        OPTS
      );
    }

    return NextResponse.json({ error: "Invalid slide number" }, { status: 400 });
  } catch (err) {
    console.error("[generate-carousel] Error:", err);
    return NextResponse.json({ error: "Image generation failed", detail: String(err) }, { status: 500 });
  }
}
