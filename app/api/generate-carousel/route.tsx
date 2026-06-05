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
const N = 5;

const BADGE_BG: Record<string, string> = {
  "En Venta": "#16a34a",
  "Alquiler": "#2563eb",
  "Alquiler temporal": "#0891b2",
};

type Theme = "dark" | "light" | "premium";

interface TC {
  bgStyle: string;
  bg: string;
  bgGrad: string;
  text: string;
  textSub: string;
  overlay: string;
  cellBg: string;
  cellBorder: string;
  fborder: string;
  ftext: string;
  dark: boolean;
  accent: string;
  btnText: string;
}

function hexRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${alpha})`;
}

function buildTheme(theme: Theme, agentAccent: string): TC {
  const a = theme === "premium" ? "#C9A84C" : (agentAccent || "#00c9c9");
  if (theme === "light") return {
    bgStyle: "#FFFFFF",
    bg: "#FFFFFF", bgGrad: "#F0F4F8",
    text: "#1a1a2e", textSub: "#666666",
    overlay: "rgba(255,255,255,0.88)",
    cellBg: hexRgba(a, 0.07), cellBorder: hexRgba(a, 0.22),
    fborder: "#e2e8f0", ftext: "#94a3b8",
    dark: false, accent: a, btnText: "#1a1a2e",
  };
  if (theme === "premium") return {
    bgStyle: "#000000",
    bg: "#000000", bgGrad: "#0d0d0d",
    text: "#ffffff", textSub: "rgba(255,255,255,0.55)",
    overlay: "rgba(0,0,0,0.84)",
    cellBg: "rgba(255,255,255,0.05)", cellBorder: hexRgba(a, 0.30),
    fborder: "rgba(255,255,255,0.10)", ftext: "rgba(255,255,255,0.25)",
    dark: true, accent: a, btnText: "#000000",
  };
  return {
    bgStyle: "linear-gradient(135deg, #0a1628 0%, #0f3460 100%)",
    bg: "#0a1628", bgGrad: "#0f3460",
    text: "#ffffff", textSub: "rgba(255,255,255,0.60)",
    overlay: "rgba(10,22,40,0.80)",
    cellBg: "rgba(255,255,255,0.07)", cellBorder: hexRgba(a, 0.22),
    fborder: "rgba(255,255,255,0.10)", ftext: "rgba(255,255,255,0.28)",
    dark: true, accent: a, btnText: "#0a1628",
  };
}

function formatPrecio(precio: string): string {
  return precio.replace(/\d+/g, (n) =>
    n.length > 3 ? n.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : n
  );
}

function calcPrecioM2(precio: string, metros: string): string | null {
  const priceNum = parseInt(precio.replace(/[^0-9]/g, ""), 10);
  const metrosNum = parseInt(metros.replace(/[^0-9]/g, ""), 10);
  if (!priceNum || !metrosNum || metrosNum === 0) return null;
  const pm2 = Math.round(priceNum / metrosNum);
  return pm2.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

async function toDataUrl(url: string): Promise<string> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const raw = Buffer.from(await res.arrayBuffer());
  const resized = await sharp(raw)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
  return `data:image/jpeg;base64,${resized.toString("base64")}`;
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
    theme?: Theme;
    accentColor?: string;
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
    theme: themeChoice = "dark",
    accentColor = "#00c9c9",
    nombreAgente,
    nombreAgencia = "",
    whatsapp = "",
    instagram = "",
    logoUrl,
  } = body;

  const t = buildTheme(themeChoice, accentColor);
  const badgeBg = BADGE_BG[operacion] ?? "#16a34a";
  const precioFmt = formatPrecio(precio);
  const priceFontSize = precioFmt.length > 16 ? 66 : precioFmt.length > 12 ? 80 : 94;
  const igHandle = instagram ? `@${instagram.replace(/^@/, "")}` : "";

  try {
    // ── SLIDE 1 — Portada (foto a pantalla completa) ──────────────
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
          {/* Foto a pantalla completa */}
          <img src={imgData} alt="" style={{ position: "absolute", top: 0, left: 0, width: W, height: H, objectFit: "cover" }} />
          {/* Gradiente inferior para texto */}
          <div style={{ display: "flex", position: "absolute", bottom: 0, left: 0, right: 0, height: 620, background: "linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.60) 45%, transparent 100%)" }} />
          {/* Gradiente superior para badge/contador */}
          <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: 220, background: "linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, transparent 100%)" }} />

          {/* Badge — arriba izquierda */}
          <div style={{ display: "flex", position: "absolute", top: 52, left: 52, backgroundColor: badgeBg, padding: "14px 32px", borderRadius: 12 }}>
            <span style={{ color: "#fff", fontSize: 30, fontWeight: 800, letterSpacing: "0.08em" }}>{operacion.toUpperCase()}</span>
          </div>

          {/* Contador — arriba derecha */}
          <div style={{ display: "flex", position: "absolute", top: 52, right: 52, backgroundColor: "rgba(0,0,0,0.40)", padding: "12px 26px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.18)" }}>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 28, fontWeight: 600 }}>1 / {N}</span>
          </div>

          {/* Precio + zona — abajo izquierda */}
          <div style={{ display: "flex", position: "absolute", bottom: 72, left: 60, right: logoData ? 310 : 80, flexDirection: "column", gap: 16 }}>
            <span style={{ fontSize: priceFontSize, fontWeight: 900, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.02em" }}>{precioFmt}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", width: 6, height: 36, backgroundColor: t.accent, borderRadius: 3, flexShrink: 0 }} />
              <span style={{ fontSize: 36, color: "rgba(255,255,255,0.90)", fontWeight: 500 }}>{zona}</span>
            </div>
          </div>

          {/* Logo — abajo derecha, siempre en recuadro blanco */}
          {logoData ? (
            <div style={{ display: "flex", position: "absolute", bottom: 72, right: 60, backgroundColor: "rgba(255,255,255,0.96)", borderRadius: 14, padding: "10px 18px", alignItems: "center", justifyContent: "center" }}>
              <img src={logoData} alt="" style={{ height: 60, width: 160, objectFit: "contain" }} />
            </div>
          ) : null}
        </div>,
        OPTS
      );
    }

    // ── SLIDE 2 — Las cifras ──────────────────────────────────────
    if (slide === 2) {
      let imgData: string | null = null;
      if (imageUrl) {
        try { imgData = await toDataUrl(imageUrl); } catch { imgData = null; }
      }

      const pm2 = calcPrecioM2(precio, metros);
      const stats = [
        { value: metros, label: "m²", cat: "SUPERFICIE" },
        dormitorios ? { value: dormitorios, label: "dormitorios", cat: "DORMITORIOS" } : null,
        banios ? { value: banios, label: "baños", cat: "BAÑOS" } : null,
        pm2 ? { value: pm2, label: "USD por m²", cat: "PRECIO / m²" }
            : cocheras ? { value: cocheras, label: "cocheras", cat: "COCHERAS" } : null,
      ].filter((s): s is { value: string; label: string; cat: string } => s !== null);

      const rows = Math.ceil(stats.length / 2);
      const cellH = rows === 1 ? 380 : rows === 2 ? 334 : 210;
      const numSize = rows >= 3 ? 76 : 100;

      return new ImageResponse(
        <div style={{ display: "flex", position: "relative", width: W, height: H, fontFamily: FF, background: t.bgStyle, overflow: "hidden" }}>
          {/* Foto con opacidad baja como fondo */}
          {imgData ? (
            <img src={imgData} alt="" style={{ position: "absolute", top: 0, left: 0, width: W, height: H, objectFit: "cover", opacity: 0.16 }} />
          ) : null}
          {/* Overlay del tema */}
          <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.overlay }} />

          <div style={{ display: "flex", position: "relative", flexDirection: "column", width: W, height: H, padding: "80px" }}>
            {/* Título */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 48 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: t.accent, letterSpacing: "0.26em" }}>LAS CIFRAS</span>
              <div style={{ display: "flex", width: 80, height: 5, backgroundColor: t.accent, borderRadius: 3 }} />
            </div>

            {/* Grid de estadísticas */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24, flex: 1, alignContent: "flex-start" }}>
              {stats.map((s) => (
                <div
                  key={s.cat}
                  style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 448, height: cellH, backgroundColor: t.cellBg, borderRadius: 24, padding: "32px 48px", gap: 8, border: `1px solid ${t.cellBorder}` }}
                >
                  <span style={{ fontSize: 20, fontWeight: 700, color: t.accent, letterSpacing: "0.18em" }}>{s.cat}</span>
                  <span style={{ fontSize: numSize, fontWeight: 900, color: t.text, lineHeight: 1 }}>{s.value}</span>
                  <span style={{ fontSize: 30, fontWeight: 500, color: t.textSub }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Contador */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 20 }}>
              <span style={{ fontSize: 28, color: t.ftext, fontWeight: 500 }}>2 / {N}</span>
            </div>
          </div>
        </div>,
        OPTS
      );
    }

    // ── SLIDE 3 — Qué incluye (pills) ────────────────────────────
    if (slide === 3) {
      const items = caracteristicas.slice(0, 7);

      return new ImageResponse(
        <div style={{ display: "flex", position: "relative", flexDirection: "column", width: W, height: H, fontFamily: FF, background: t.bgStyle, overflow: "hidden" }}>
          {/* Barra de acento superior */}
          <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: 8, backgroundColor: t.accent }} />

          {/* Contenido */}
          <div style={{ display: "flex", position: "relative", flexDirection: "column", width: "100%", height: "100%", padding: "80px" }}>
            {/* Título */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 48, marginTop: 16 }}>
              <span style={{ fontSize: 46, fontWeight: 800, color: t.text, lineHeight: 1 }}>QUÉ INCLUYE</span>
              <div style={{ display: "flex", width: 80, height: 6, backgroundColor: t.accent, borderRadius: 3 }} />
            </div>

            {/* Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 18, flex: 1, alignContent: "center" }}>
              {items.map((c, idx) => (
                <div
                  key={idx}
                  style={{ display: "flex", alignItems: "center", backgroundColor: hexRgba(t.accent, 0.15), border: `1px solid ${t.accent}`, borderRadius: 50, padding: "18px 32px" }}
                >
                  <span style={{ color: t.accent, fontSize: 34, fontWeight: 600 }}>{c}</span>
                </div>
              ))}
            </div>

            {/* Footer con zona */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24, marginTop: 16, borderTop: `1px solid ${t.fborder}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", width: 5, height: 26, backgroundColor: t.accent, borderRadius: 3 }} />
                <span style={{ fontSize: 26, color: t.ftext }}>{zona}</span>
              </div>
              <span style={{ fontSize: 26, color: t.ftext }}>3 / {N}</span>
            </div>
          </div>
        </div>,
        OPTS
      );
    }

    // ── SLIDE 4 — Ubicación y precio ─────────────────────────────
    if (slide === 4) {
      const zonaFontSize = zona.length > 22 ? 58 : zona.length > 16 ? 72 : zona.length > 10 ? 84 : 96;

      return new ImageResponse(
        <div style={{ display: "flex", position: "relative", flexDirection: "column", width: W, height: H, fontFamily: FF, background: t.bgStyle, alignItems: "center", justifyContent: "center", padding: "80px", overflow: "hidden" }}>
          {/* Contenido centrado */}
          <div style={{ display: "flex", position: "relative", flexDirection: "column", alignItems: "center", gap: 22, width: "100%" }}>
            {/* Label UBICACIÓN */}
            <span style={{ fontSize: 24, fontWeight: 700, color: t.accent, letterSpacing: "0.30em" }}>UBICACIÓN</span>
            {/* Nombre de zona grande */}
            <span style={{ fontSize: zonaFontSize, fontWeight: 900, color: t.text, textAlign: "center", lineHeight: 1.15 }}>{zona}</span>
            {/* Línea divisora */}
            <div style={{ display: "flex", width: 120, height: 3, backgroundColor: hexRgba(t.accent, 0.35), borderRadius: 2 }} />
            {/* Precio en acento */}
            <span style={{ fontSize: priceFontSize, fontWeight: 900, color: t.accent, letterSpacing: "-0.02em" }}>{precioFmt}</span>
            {/* Badge operación — usa acento del tema */}
            <div style={{ display: "flex", backgroundColor: t.accent, padding: "16px 52px", borderRadius: 48 }}>
              <span style={{ color: t.btnText, fontSize: 32, fontWeight: 700 }}>{operacion}</span>
            </div>
          </div>

          <span style={{ position: "absolute", bottom: 52, right: 56, fontSize: 28, color: t.ftext, fontWeight: 500 }}>4 / {N}</span>
        </div>,
        OPTS
      );
    }

    // ── SLIDE 5 — Contacto ────────────────────────────────────────
    if (slide === 5) {
      let logoData: string | null = null;
      if (logoUrl) logoData = await processLogo(logoUrl);

      const slide5Bg = t.dark
        ? `linear-gradient(155deg, ${t.bg} 0%, ${t.bgGrad} 60%, ${hexRgba(t.accent, 0.08)} 100%)`
        : `linear-gradient(155deg, #f0f4f8 0%, #ffffff 100%)`;

      return new ImageResponse(
        <div style={{ display: "flex", position: "relative", flexDirection: "column", width: W, height: H, fontFamily: FF, background: slide5Bg, alignItems: "center", justifyContent: "center", padding: "80px", overflow: "hidden" }}>
          {/* Barra superior */}
          <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: 8, backgroundColor: t.accent }} />

          {/* Logo en recuadro blanco redondeado */}
          {logoData ? (
            <div style={{ display: "flex", backgroundColor: "#ffffff", borderRadius: 16, padding: "12px 22px", marginBottom: 28, alignItems: "center", justifyContent: "center" }}>
              <img src={logoData} alt="" style={{ height: 72, width: 220, objectFit: "contain" }} />
            </div>
          ) : (
            <div style={{ display: "flex", width: 96, height: 96, borderRadius: "50%", backgroundColor: t.accent, alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
              <span style={{ color: t.btnText, fontSize: 44, fontWeight: 900 }}>A</span>
            </div>
          )}

          {/* Nombre de agencia */}
          {nombreAgencia ? (
            <span style={{ fontSize: 30, fontWeight: 700, color: t.accent, marginBottom: 6 }}>{nombreAgencia}</span>
          ) : null}

          {/* Nombre del agente */}
          <span style={{ fontSize: 52, fontWeight: 800, color: t.text, marginBottom: 38, textAlign: "center", lineHeight: 1.2 }}>{nombreAgente}</span>

          {/* Divisor */}
          <div style={{ display: "flex", width: 100, height: 3, backgroundColor: t.accent, borderRadius: 2, marginBottom: 38 }} />

          {/* Info de contacto */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "center", marginBottom: 46 }}>
            {whatsapp ? (
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ display: "flex", width: 52, height: 52, borderRadius: 14, backgroundColor: "#25D366", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontSize: 20, fontWeight: 900 }}>WA</span>
                </div>
                <span style={{ fontSize: 40, fontWeight: 500, color: t.dark ? "rgba(255,255,255,0.90)" : t.text }}>{whatsapp}</span>
              </div>
            ) : null}
            {igHandle ? (
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ display: "flex", width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0, background: "linear-gradient(135deg, #f9a825 0%, #e1306c 50%, #7c3aed 100%)" }}>
                  <span style={{ color: "#fff", fontSize: 20, fontWeight: 900 }}>IG</span>
                </div>
                <span style={{ fontSize: 40, fontWeight: 500, color: t.dark ? "rgba(255,255,255,0.90)" : t.text }}>{igHandle}</span>
              </div>
            ) : null}
          </div>

          {/* Botón CTA — 70% del slide = 756px */}
          <div style={{ display: "flex", backgroundColor: t.accent, padding: "22px 0", borderRadius: 18, width: 756, alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: t.btnText, fontSize: 42, fontWeight: 800 }}>Consultá ahora</span>
          </div>

          {/* Contador */}
          <span style={{ position: "absolute", bottom: 48, right: 56, fontSize: 28, color: t.ftext, fontWeight: 500 }}>5 / {N}</span>

          {/* Barra inferior */}
          <div style={{ display: "flex", position: "absolute", bottom: 0, left: 0, right: 0, height: 8, backgroundColor: t.accent }} />
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
