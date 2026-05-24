import { ImageResponse } from "next/og";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { logFeatureUsage } from "@/lib/actions/analytics.actions";

export const runtime = "nodejs";

const FF = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const W = 1080;
const H = 1080;
const OPTS = { width: W, height: H };

const BADGE_BG: Record<string, string> = {
  "En Venta": "#16a34a",
  "Alquiler": "#2563eb",
  "Alquiler temporal": "#0891b2",
};

async function toDataUrl(url: string): Promise<string> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get("content-type") || "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Plan check — Pro Max only
  const supabase = createSupabaseAdminClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();
  if (sub?.plan !== "pro_max" || sub?.status !== "active") {
    return NextResponse.json({ error: "PRO_MAX_REQUIRED" }, { status: 403 });
  }

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
    colorMarca = "#0f3460",
    accentColor = "#00c9c9",
    nombreAgente,
    nombreAgencia = "",
    whatsapp = "",
    instagram = "",
    logoUrl,
  } = body;

  const badgeBg = BADGE_BG[operacion] ?? "#16a34a";
  const priceFontSize = precio.length > 14 ? 68 : precio.length > 10 ? 80 : 96;

  try {
    // ── SLIDE 1 — Foto + precio ─────────────────────────────────
    if (slide === 1) {
      if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
      let imgData: string;
      try { imgData = await toDataUrl(imageUrl); }
      catch { return NextResponse.json({ error: "Could not fetch image" }, { status: 400 }); }

      void logFeatureUsage("carrusel");

      return new ImageResponse(
        <div style={{ display: "flex", position: "relative", width: W, height: H, fontFamily: FF, overflow: "hidden" }}>
          {/* Background photo */}
          <img src={imgData} alt="" style={{ position: "absolute", top: 0, left: 0, width: W, height: H, objectFit: "cover" }} />
          {/* Dark gradient overlay bottom half */}
          <div style={{ display: "flex", position: "absolute", bottom: 0, left: 0, right: 0, height: 520, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)" }} />
          {/* Light gradient top (for badge readability) */}
          <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: 200, background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)" }} />
          {/* Operation badge */}
          <div style={{ display: "flex", position: "absolute", top: 48, left: 52, backgroundColor: badgeBg, padding: "14px 36px", borderRadius: 10 }}>
            <span style={{ color: "#fff", fontSize: 36, fontWeight: 700, letterSpacing: "0.05em" }}>{operacion.toUpperCase()}</span>
          </div>
          {/* ColorMarca accent top-right bar */}
          <div style={{ display: "flex", position: "absolute", top: 0, right: 0, width: 12, height: H, backgroundColor: colorMarca, opacity: 0.85 }} />
          {/* Price + zona */}
          <div style={{ display: "flex", position: "absolute", bottom: 72, left: 60, right: 80, flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", fontSize: priceFontSize, fontWeight: 900, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.02em" }}>{precio}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", width: 6, height: 40, backgroundColor: accentColor, borderRadius: 3 }} />
              <span style={{ fontSize: 38, color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>{zona}</span>
            </div>
          </div>
        </div>,
        OPTS
      );
    }

    // ── SLIDE 2 — Stats sobre color de marca ────────────────────
    if (slide === 2) {
      const stats = [
        dormitorios ? { value: dormitorios, label: "Dormitorios" } : null,
        banios ? { value: banios, label: "Baños" } : null,
        { value: metros, label: "m²" },
        cocheras ? { value: cocheras, label: "Cocheras" } : null,
      ].filter(Boolean) as { value: string; label: string }[];

      return new ImageResponse(
        <div style={{ display: "flex", flexDirection: "column", width: W, height: H, fontFamily: FF, backgroundColor: colorMarca, padding: "80px" }}>
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 64 }}>
            <span style={{ fontSize: 38, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.18em" }}>CARACTERÍSTICAS</span>
            <div style={{ display: "flex", width: 88, height: 6, backgroundColor: accentColor, borderRadius: 3 }} />
          </div>

          {/* Stats grid */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 40, flex: 1 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 420, height: 300, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "36px 44px", gap: 12 }}>
                <span style={{ fontSize: 120, fontWeight: 900, color: "#ffffff", lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: 38, fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 36, marginTop: 40 }}>
            <span style={{ fontSize: 30, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
              {nombreAgencia || nombreAgente}
            </span>
          </div>
        </div>,
        OPTS
      );
    }

    // ── SLIDE 3 — Características con checkmarks ────────────────
    if (slide === 3) {
      const items = caracteristicas.slice(0, 7);
      const itemHeight = items.length > 5 ? 102 : 116;

      return new ImageResponse(
        <div style={{ display: "flex", flexDirection: "column", width: W, height: H, fontFamily: FF, backgroundColor: "#ffffff", padding: "80px" }}>
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 60 }}>
            <span style={{ fontSize: 52, fontWeight: 800, color: colorMarca, lineHeight: 1.1 }}>Detalles de la propiedad</span>
            <div style={{ display: "flex", width: 88, height: 6, backgroundColor: accentColor, borderRadius: 3 }} />
          </div>

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
            {items.map((c) => (
              <div key={c} style={{ display: "flex", alignItems: "center", gap: 28, height: itemHeight, backgroundColor: "#f8fafc", borderRadius: 16, padding: "0 36px", borderLeft: `6px solid ${accentColor}` }}>
                <div style={{ display: "flex", width: 52, height: 52, borderRadius: "50%", backgroundColor: accentColor, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontSize: 30, fontWeight: 900 }}>✓</span>
                </div>
                <span style={{ fontSize: items.length > 5 ? 36 : 40, fontWeight: 500, color: "#1e293b" }}>{c}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 32, marginTop: 24, borderTop: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", width: 6, height: 32, backgroundColor: colorMarca, borderRadius: 3 }} />
            <span style={{ fontSize: 30, color: "#94a3b8" }}>{zona}</span>
          </div>
        </div>,
        OPTS
      );
    }

    // ── SLIDE 4 — Ubicación + precio en fondo oscuro ────────────
    if (slide === 4) {
      return new ImageResponse(
        <div style={{ display: "flex", flexDirection: "column", width: W, height: H, fontFamily: FF, backgroundColor: "#0a1628", alignItems: "center", justifyContent: "center", padding: "80px" }}>
          {/* Top accent */}
          <div style={{ display: "flex", width: 80, height: 6, backgroundColor: accentColor, borderRadius: 3, marginBottom: 60 }} />

          {/* Location label */}
          <span style={{ fontSize: 32, color: "rgba(255,255,255,0.45)", letterSpacing: "0.22em", fontWeight: 600, marginBottom: 28 }}>UBICACIÓN</span>

          {/* Zona */}
          <span style={{ fontSize: zona.length > 20 ? 62 : 76, fontWeight: 800, color: "#ffffff", textAlign: "center", lineHeight: 1.2, marginBottom: 64 }}>{zona}</span>

          {/* Divider */}
          <div style={{ display: "flex", width: 120, height: 2, backgroundColor: "rgba(255,255,255,0.15)", marginBottom: 64 }} />

          {/* Price */}
          <span style={{ fontSize: priceFontSize, fontWeight: 900, color: colorMarca, letterSpacing: "-0.02em", marginBottom: 56 }}>{precio}</span>

          {/* Operation badge */}
          <div style={{ display: "flex", backgroundColor: "rgba(255,255,255,0.1)", padding: "18px 56px", borderRadius: 48, border: "1px solid rgba(255,255,255,0.15)" }}>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 34, fontWeight: 600 }}>{operacion}</span>
          </div>
        </div>,
        OPTS
      );
    }

    // ── SLIDE 5 — Contacto ──────────────────────────────────────
    if (slide === 5) {
      let logoData: string | null = null;
      if (logoUrl) {
        try { logoData = await toDataUrl(logoUrl); } catch { logoData = null; }
      }
      const igHandle = instagram ? `@${instagram.replace(/^@/, "")}` : "";

      return new ImageResponse(
        <div style={{ display: "flex", flexDirection: "column", width: W, height: H, fontFamily: FF, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center", padding: "80px", gap: 0 }}>
          {/* Top brand bar */}
          <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: 14, backgroundColor: colorMarca }} />

          {/* Logo */}
          {logoData ? (
            <img src={logoData} alt="" style={{ height: 110, width: 320, objectFit: "contain", objectPosition: "center", marginBottom: 36 }} />
          ) : (
            <div style={{ display: "flex", width: 110, height: 110, borderRadius: "50%", backgroundColor: colorMarca, alignItems: "center", justifyContent: "center", marginBottom: 36 }}>
              <span style={{ color: "#fff", fontSize: 52, fontWeight: 900 }}>P</span>
            </div>
          )}

          {/* Agency name */}
          {nombreAgencia ? (
            <span style={{ fontSize: 38, fontWeight: 700, color: colorMarca, marginBottom: 12 }}>{nombreAgencia}</span>
          ) : null}

          {/* Agent name */}
          <span style={{ fontSize: 56, fontWeight: 800, color: "#0f172a", marginBottom: 48, textAlign: "center" }}>{nombreAgente}</span>

          {/* Divider */}
          <div style={{ display: "flex", width: 120, height: 3, backgroundColor: accentColor, borderRadius: 2, marginBottom: 48 }} />

          {/* Contact rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28, alignItems: "center", marginBottom: 56 }}>
            {whatsapp ? (
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ display: "flex", width: 56, height: 56, borderRadius: "50%", backgroundColor: "#22c55e", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontSize: 30, fontWeight: 900 }}>W</span>
                </div>
                <span style={{ fontSize: 44, fontWeight: 500, color: "#334155" }}>{whatsapp}</span>
              </div>
            ) : null}
            {igHandle ? (
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ display: "flex", width: 56, height: 56, borderRadius: "50%", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "linear-gradient(135deg, #f9a825, #e1306c, #7c3aed)" }}>
                  <span style={{ color: "#fff", fontSize: 30, fontWeight: 900 }}>IG</span>
                </div>
                <span style={{ fontSize: 44, fontWeight: 500, color: "#334155" }}>{igHandle}</span>
              </div>
            ) : null}
          </div>

          {/* CTA button */}
          <div style={{ display: "flex", backgroundColor: colorMarca, padding: "26px 88px", borderRadius: 18 }}>
            <span style={{ color: "#ffffff", fontSize: 46, fontWeight: 700 }}>Consultá ahora</span>
          </div>

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
