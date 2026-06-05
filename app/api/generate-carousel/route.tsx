import { ImageResponse } from "next/og";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { logFeatureUsage } from "@/lib/actions/analytics.actions";
import { checkAndIncrementUsage } from "@/lib/actions/usage.actions";
import sharp from "sharp";
import { type Theme, buildTheme, hexRgba } from "@/lib/themes";

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
    const { data, info } = await sharp(inputBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const pixels = new Uint8ClampedArray(data.buffer);
    const { width, height } = info;
    const corners = [[0,0],[width-1,0],[0,height-1],[width-1,height-1]] as const;
    let sumR = 0, sumG = 0, sumB = 0;
    for (const [x, y] of corners) {
      const i = (y * width + x) * 4;
      sumR += pixels[i]; sumG += pixels[i+1]; sumB += pixels[i+2];
    }
    const bgR = Math.round(sumR/4), bgG = Math.round(sumG/4), bgB = Math.round(sumB/4);
    for (let i = 0; i < pixels.length; i += 4) {
      if (Math.abs(pixels[i]-bgR)<30 && Math.abs(pixels[i+1]-bgG)<30 && Math.abs(pixels[i+2]-bgB)<30)
        pixels[i+3] = 0;
    }
    const pngBuf = await sharp(Buffer.from(pixels.buffer), { raw: { width, height, channels: 4 } }).png().toBuffer();
    return `data:image/png;base64,${pngBuf.toString("base64")}`;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabaseAdminClient();
  const { data: sub } = await supabase
    .from("subscriptions").select("plan, status").eq("user_id", userId).maybeSingle();
  if (sub?.plan !== "pro_max" || sub?.status !== "active")
    return NextResponse.json({ error: "PRO_MAX_REQUIRED" }, { status: 403 });

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

  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const {
    slide, imageUrl, precio, operacion, zona, metros,
    dormitorios = "", banios = "", cocheras = "",
    caracteristicas = [],
    theme: themeChoice = "dark",
    accentColor = "#00c9c9",
    nombreAgente, nombreAgencia = "",
    whatsapp = "", instagram = "", logoUrl,
  } = body;

  const t = buildTheme(themeChoice, accentColor);
  const badgeBg = BADGE_BG[operacion] ?? "#16a34a";
  const precioFmt = formatPrecio(precio);
  const priceFontSize = precioFmt.length > 16 ? 66 : precioFmt.length > 12 ? 80 : 94;
  const igHandle = instagram ? `@${instagram.replace(/^@/, "")}` : "";

  // Vars de contraste: en temas con fondo claro se usa oscuro, no el acento
  const C = {
    strong:     t.isLight ? "#1a1a2e" : t.text,
    emBg:       t.isLight ? "#1a1a2e" : t.accent,
    emFg:       t.isLight ? "#ffffff" : t.btnText,
    pillBg:     t.isLight ? "rgba(26,26,46,0.10)" : hexRgba(t.accent, 0.15),
    pillBorder: t.isLight ? "#1a1a2e"              : t.accent,
    pillTxt:    t.isLight ? "#1a1a2e"              : t.accent,
    footTxt:    t.isLight ? "rgba(26,26,46,0.50)"  : t.ftext,
    divider:    t.isLight ? "rgba(26,26,46,0.20)"  : hexRgba(t.accent, 0.35),
  };

  try {
    // ── SLIDE 1 — Portada ─────────────────────────────────────────
    if (slide === 1) {
      if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
      let imgData: string;
      try { imgData = await toDataUrl(imageUrl); }
      catch { return NextResponse.json({ error: "Could not fetch image" }, { status: 400 }); }
      let logoData: string | null = null;
      if (logoUrl) logoData = await processLogo(logoUrl);
      void logFeatureUsage("carrusel");
      return new ImageResponse(
        <div style={{ display:"flex", position:"relative", width:W, height:H, fontFamily:FF, overflow:"hidden" }}>
          <img src={imgData} alt="" style={{ position:"absolute", top:0, left:0, width:W, height:H, objectFit:"cover" }} />
          <div style={{ display:"flex", position:"absolute", bottom:0, left:0, right:0, height:620, background:"linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.60) 45%, transparent 100%)" }} />
          <div style={{ display:"flex", position:"absolute", top:0, left:0, right:0, height:220, background:"linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, transparent 100%)" }} />
          <div style={{ display:"flex", position:"absolute", top:52, left:52, backgroundColor:badgeBg, padding:"14px 32px", borderRadius:12 }}>
            <span style={{ color:"#fff", fontSize:30, fontWeight:800, letterSpacing:"0.08em" }}>{operacion.toUpperCase()}</span>
          </div>
          <div style={{ display:"flex", position:"absolute", top:52, right:52, backgroundColor:"rgba(0,0,0,0.40)", padding:"12px 26px", borderRadius:10, border:"1px solid rgba(255,255,255,0.18)" }}>
            <span style={{ color:"rgba(255,255,255,0.85)", fontSize:28, fontWeight:600 }}>1 / {N}</span>
          </div>
          <div style={{ display:"flex", position:"absolute", bottom:72, left:60, right:logoData ? 310 : 80, flexDirection:"column", gap:16 }}>
            <span style={{ fontSize:priceFontSize, fontWeight:900, color:"#ffffff", lineHeight:1, letterSpacing:"-0.02em" }}>{precioFmt}</span>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ display:"flex", width:6, height:36, backgroundColor:t.accent, borderRadius:3, flexShrink:0 }} />
              <span style={{ fontSize:36, color:"rgba(255,255,255,0.90)", fontWeight:500 }}>{zona}</span>
            </div>
          </div>
          {logoData ? (
            <div style={{ display:"flex", position:"absolute", bottom:72, right:60, backgroundColor:"rgba(255,255,255,0.96)", borderRadius:14, padding:"10px 18px", alignItems:"center", justifyContent:"center" }}>
              <img src={logoData} alt="" style={{ height:60, width:160, objectFit:"contain" }} />
            </div>
          ) : null}
        </div>, OPTS
      );
    }

    // ── SLIDE 2 — Las cifras (grid 2×2) ──────────────────────────
    if (slide === 2) {
      let imgData: string | null = null;
      if (imageUrl) { try { imgData = await toDataUrl(imageUrl); } catch { imgData = null; } }

      const pm2 = calcPrecioM2(precio, metros);
      // Orden: [Superficie | Precio/m²] / [Dormitorios | Baños]
      const stats = [
        { value: metros, label: "m²", cat: "SUPERFICIE" },
        pm2 ? { value: pm2, label: "USD por m²", cat: "PRECIO / m²" } : null,
        dormitorios ? { value: dormitorios, label: "dormitorios", cat: "DORMITORIOS" } : null,
        banios ? { value: banios, label: "baños", cat: "BAÑOS" } : null,
      ].filter((s): s is { value: string; label: string; cat: string } => s !== null);

      const rows = Math.ceil(stats.length / 2);
      const cellH = rows === 1 ? 380 : rows === 2 ? 334 : 210;
      const numSize = rows >= 3 ? 76 : 100;

      return new ImageResponse(
        <div style={{ display:"flex", position:"relative", width:W, height:H, fontFamily:FF, background:t.bgStyle, overflow:"hidden" }}>
          {imgData ? <img src={imgData} alt="" style={{ position:"absolute", top:0, left:0, width:W, height:H, objectFit:"cover", opacity:0.16 }} /> : null}
          <div style={{ display:"flex", position:"absolute", top:0, left:0, right:0, bottom:0, backgroundColor:t.overlay }} />
          <div style={{ display:"flex", position:"relative", flexDirection:"column", width:W, height:H, padding:"80px" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:48 }}>
              <span style={{ fontSize:28, fontWeight:700, color:t.accent, letterSpacing:"0.26em" }}>LAS CIFRAS</span>
              <div style={{ display:"flex", width:80, height:5, backgroundColor:t.accent, borderRadius:3 }} />
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:24, flex:1, alignContent:"flex-start" }}>
              {stats.map((s) => (
                <div key={s.cat} style={{ display:"flex", flexDirection:"column", justifyContent:"center", width:448, height:cellH, backgroundColor:t.cellBg, borderRadius:24, padding:"32px 48px", gap:8, border:`1px solid ${t.cellBorder}` }}>
                  <span style={{ fontSize:20, fontWeight:700, color:t.accent, letterSpacing:"0.18em" }}>{s.cat}</span>
                  <span style={{ fontSize:numSize, fontWeight:900, color:t.text, lineHeight:1 }}>{s.value}</span>
                  <span style={{ fontSize:30, fontWeight:500, color:t.textSub }}>{s.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:20 }}>
              <span style={{ fontSize:28, color:t.ftext, fontWeight:500 }}>2 / {N}</span>
            </div>
          </div>
        </div>, OPTS
      );
    }

    // ── SLIDE 3 — Qué incluye (pills centrados) ───────────────────
    if (slide === 3) {
      // Lectura defensiva para evitar bugs de iteración de caracteres
      const safeItems = Array.isArray(caracteristicas)
        ? (caracteristicas as string[])
            .filter((c) => typeof c === "string" && c.trim().length > 0)
            .slice(0, 7)
        : [];

      return new ImageResponse(
        <div style={{ display:"flex", position:"relative", flexDirection:"column", width:W, height:H, fontFamily:FF, background:t.bgStyle, overflow:"hidden" }}>
          <div style={{ display:"flex", position:"absolute", top:0, left:0, right:0, height:8, backgroundColor:t.accent }} />
          <div style={{ display:"flex", position:"relative", flexDirection:"column", width:"100%", height:"100%", padding:"80px" }}>
            {/* Título */}
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:48, marginTop:16 }}>
              <span style={{ fontSize:46, fontWeight:800, color:C.strong, lineHeight:1 }}>QUÉ INCLUYE</span>
              <div style={{ display:"flex", width:80, height:6, backgroundColor:C.emBg, borderRadius:3 }} />
            </div>
            {/* Pills — centrados verticalmente con wrapper */}
            <div style={{ display:"flex", flex:1, alignItems:"center" }}>
              <div style={{ display:"flex", flexWrap:"wrap", gap:18, width:"100%" }}>
                {safeItems.map((c, idx) => (
                  <div key={idx} style={{ display:"flex", alignItems:"center", backgroundColor:C.pillBg, border:`1.5px solid ${C.pillBorder}`, borderRadius:50, padding:"18px 32px" }}>
                    <span style={{ color:C.pillTxt, fontSize:34, fontWeight:600 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Footer */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:24, marginTop:16, borderTop:`1px solid ${t.fborder}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ display:"flex", width:5, height:26, backgroundColor:C.emBg, borderRadius:3 }} />
                <span style={{ fontSize:26, color:C.footTxt }}>{zona}</span>
              </div>
              <span style={{ fontSize:26, color:C.footTxt }}>3 / {N}</span>
            </div>
          </div>
        </div>, OPTS
      );
    }

    // ── SLIDE 4 — Ubicación y precio ─────────────────────────────
    if (slide === 4) {
      const zonaFontSize = zona.length > 22 ? 58 : zona.length > 16 ? 72 : zona.length > 10 ? 84 : 96;
      return new ImageResponse(
        <div style={{ display:"flex", position:"relative", flexDirection:"column", width:W, height:H, fontFamily:FF, background:t.bgStyle, alignItems:"center", justifyContent:"center", padding:"80px", overflow:"hidden" }}>
          <div style={{ display:"flex", position:"relative", flexDirection:"column", alignItems:"center", gap:22, width:"100%" }}>
            <span style={{ fontSize:24, fontWeight:700, color:C.strong, letterSpacing:"0.30em" }}>UBICACIÓN</span>
            <span style={{ fontSize:zonaFontSize, fontWeight:900, color:C.strong, textAlign:"center", lineHeight:1.15 }}>{zona}</span>
            <div style={{ display:"flex", width:120, height:3, backgroundColor:C.divider, borderRadius:2 }} />
            <span style={{ fontSize:priceFontSize, fontWeight:900, color:C.strong, letterSpacing:"-0.02em" }}>{precioFmt}</span>
            {/* Badge con contraste: fondo oscuro/acento, texto legible */}
            <div style={{ display:"flex", backgroundColor:C.emBg, padding:"16px 52px", borderRadius:48 }}>
              <span style={{ color:C.emFg, fontSize:32, fontWeight:700 }}>{operacion}</span>
            </div>
          </div>
          <span style={{ position:"absolute", bottom:52, right:56, fontSize:28, color:t.ftext, fontWeight:500 }}>4 / {N}</span>
        </div>, OPTS
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
        <div style={{ display:"flex", position:"relative", flexDirection:"column", width:W, height:H, fontFamily:FF, background:slide5Bg, alignItems:"center", justifyContent:"center", padding:"80px", overflow:"hidden" }}>
          <div style={{ display:"flex", position:"absolute", top:0, left:0, right:0, height:8, backgroundColor:t.accent }} />
          {logoData ? (
            <div style={{ display:"flex", backgroundColor:"#ffffff", borderRadius:16, padding:"12px 22px", marginBottom:28, alignItems:"center", justifyContent:"center" }}>
              <img src={logoData} alt="" style={{ height:72, width:220, objectFit:"contain" }} />
            </div>
          ) : (
            <div style={{ display:"flex", width:96, height:96, borderRadius:"50%", backgroundColor:t.accent, alignItems:"center", justifyContent:"center", marginBottom:28 }}>
              <span style={{ color:t.btnText, fontSize:44, fontWeight:900 }}>A</span>
            </div>
          )}
          {nombreAgencia ? <span style={{ fontSize:30, fontWeight:700, color:C.strong, marginBottom:6 }}>{nombreAgencia}</span> : null}
          <span style={{ fontSize:52, fontWeight:800, color:C.strong, marginBottom:38, textAlign:"center", lineHeight:1.2 }}>{nombreAgente}</span>
          <div style={{ display:"flex", width:100, height:3, backgroundColor:C.emBg, borderRadius:2, marginBottom:38 }} />
          <div style={{ display:"flex", flexDirection:"column", gap:22, alignItems:"center", marginBottom:46 }}>
            {whatsapp ? (
              <div style={{ display:"flex", alignItems:"center", gap:18 }}>
                <div style={{ display:"flex", width:52, height:52, borderRadius:14, backgroundColor:"#25D366", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ color:"#fff", fontSize:20, fontWeight:900 }}>WA</span>
                </div>
                <span style={{ fontSize:40, fontWeight:500, color:C.strong }}>{whatsapp}</span>
              </div>
            ) : null}
            {igHandle ? (
              <div style={{ display:"flex", alignItems:"center", gap:18 }}>
                <div style={{ display:"flex", width:52, height:52, borderRadius:14, alignItems:"center", justifyContent:"center", flexShrink:0, background:"linear-gradient(135deg, #f9a825 0%, #e1306c 50%, #7c3aed 100%)" }}>
                  <span style={{ color:"#fff", fontSize:20, fontWeight:900 }}>IG</span>
                </div>
                <span style={{ fontSize:40, fontWeight:500, color:C.strong }}>{igHandle}</span>
              </div>
            ) : null}
          </div>
          {/* CTA — 70% del ancho = 756px, contraste garantizado */}
          <div style={{ display:"flex", backgroundColor:C.emBg, padding:"22px 0", borderRadius:18, width:756, alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:C.emFg, fontSize:42, fontWeight:800 }}>Consultá ahora</span>
          </div>
          <span style={{ position:"absolute", bottom:48, right:56, fontSize:28, color:t.ftext, fontWeight:500 }}>5 / {N}</span>
          <div style={{ display:"flex", position:"absolute", bottom:0, left:0, right:0, height:8, backgroundColor:t.accent }} />
        </div>, OPTS
      );
    }

    return NextResponse.json({ error: "Invalid slide number" }, { status: 400 });
  } catch (err) {
    console.error("[generate-carousel] Error:", err);
    return NextResponse.json({ error: "Image generation failed", detail: String(err) }, { status: 500 });
  }
}
