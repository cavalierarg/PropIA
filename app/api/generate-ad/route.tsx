import { ImageResponse } from "next/og";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { logFeatureUsage } from "@/lib/actions/analytics.actions";
import { checkAndIncrementUsage } from "@/lib/actions/usage.actions";
import sharp from "sharp";
import { buildTheme, hexRgba, type Theme } from "@/lib/themes";

export const runtime = "nodejs";

type AdType  = "feed" | "story" | "banner";
type AdStyle = "luxury" | "moderno" | "bold" | "profesional";

// System font stacks per style — no remote fetching to avoid hanging routes
const FONT_STACK: Record<AdStyle, string> = {
  luxury:      "Georgia, 'Times New Roman', serif",
  moderno:     "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  bold:        "'Arial Black', 'Impact', sans-serif",
  profesional: "'Trebuchet MS', 'Helvetica Neue', Arial, sans-serif",
};


function formatPrice(precio: string, moneda: string): string {
  const t = precio.trim();
  if (moneda === "USD") return t.startsWith("USD") || t.startsWith("$") ? t : `USD ${t}`;
  if (moneda === "EUR") return t.startsWith("€") || t.startsWith("EUR") ? t : `€${t}`;
  return t.startsWith("$") || t.startsWith("ARS") ? t : `$${t}`;
}

function buildSpecs(metros: string, dormitorios: string, banios: string): string {
  const parts: string[] = [];
  if (dormitorios) parts.push(`Dorm: ${dormitorios}`);
  if (banios) parts.push(`Baños: ${banios}`);
  parts.push(`${metros} m²`);
  return parts.join(" · ");
}

function badgeColor(badge: string): { bg: string; text: string } {
  const m: Record<string, { bg: string; text: string }> = {
    "En Venta":        { bg: "#16a34a", text: "#fff" },
    "Alquiler":        { bg: "#2563eb", text: "#fff" },
    "Alquiler temporal": { bg: "#0891b2", text: "#fff" },
    "Oportunidad":     { bg: "#ea580c", text: "#fff" },
    "Recién Llegada":  { bg: "#7c3aed", text: "#fff" },
    "Última Unidad":   { bg: "#dc2626", text: "#fff" },
    "Precio Rebajado": { bg: "#d97706", text: "#fff" },
  };
  return m[badge] ?? { bg: "#16a34a", text: "#fff" };
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const usage = await checkAndIncrementUsage(userId);
  if (!usage.allowed) return NextResponse.json({ error: "LIMIT_REACHED" }, { status: 403 });

  let body: {
    type: AdType; estilo: AdStyle; imageUrl: string;
    precio: string; zona: string; metros: string;
    car1?: string; car2?: string; agente?: string;
    dormitorios?: string; banios?: string; cocheras?: string;
    amenities?: string[]; agenteWhatsapp?: string; agenteInstagram?: string;
    colorMarca: string; colorAcento?: string; moneda: string; badge: string;
    agentLogoUrl?: string;
    theme?: Theme;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const {
    type, estilo = "moderno", imageUrl,
    precio, zona, metros,
    car1 = "", car2 = "", agente = "",
    dormitorios = "", banios = "",
    amenities = [] as string[], agenteWhatsapp = "", agenteInstagram = "",
    colorMarca = "#0f3460", colorAcento = "#00c9c9",
    moneda = "USD", badge = "En Venta",
    agentLogoUrl,
    theme: adTheme,
  } = body;

  const dims = { feed: [1080,1080], story: [1080,1920], banner: [1200,628] };
  const [width, height] = dims[type] ?? dims.feed;

  // Fetch logo as base64 JPEG for themed ads (lightweight — no pixel processing)
  async function fetchLogoSmall(url: string): Promise<string | null> {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) return null;
      const raw = Buffer.from(await r.arrayBuffer());
      const buf = await sharp(raw).resize(300, 100, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 88 }).toBuffer();
      return `data:image/jpeg;base64,${buf.toString("base64")}`;
    } catch { return null; }
  }

  // Fetch + resize image server-side → base64 JPEG (avoids Satori remote fetch issues)
  let imageData: string;
  try {
    const res = await fetch(imageUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`Image fetch ${res.status}: ${imageUrl.slice(0, 80)}`);
    const raw = Buffer.from(await res.arrayBuffer());
    const resized = await sharp(raw)
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    imageData = `data:image/jpeg;base64,${resized.toString("base64")}`;
  } catch (e) {
    console.error("[generate-ad] image fetch/resize failed:", String(e));
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }

  const agentLogoData: string | null = agentLogoUrl ?? null;

  // Logo dimensions per format (max 20% of ad width, proportional height)
  const logoFeed   = { w: 200, h: 70, top: 24, left: 24 } as const;
  const logoBanner = { w: 220, h: 60, top: 20, left: 20 } as const;
  const logoProps = type === "banner" ? logoBanner : logoFeed;

  const price = formatPrice(precio, moneda);
  const specs = buildSpecs(metros, dormitorios, banios);
  const bc    = badgeColor(badge);
  const ff    = FONT_STACK[estilo];
  const amenitiesStr = amenities.length > 0 ? amenities.slice(0, 3).join(" · ") : "";
  const imgOpts = { width, height };

  const igHandleAd = agenteInstagram ? `@${agenteInstagram.replace(/^@/, "")}` : "";

  try {
    // ── THEMED LAYOUTS (7 temas visuales) ────────────────────────────────
    if (adTheme) {
      const t = buildTheme(adTheme, colorAcento);
      const logoB64 = agentLogoUrl ? await fetchLogoSmall(agentLogoUrl) : null;
      const FF_AD = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

      // Feed 1080×1080 — 60% foto / 40% datos
      if (type === "feed") {
        const photoH = 648, dataH = 432;
        return new ImageResponse(
          <div style={{ display:"flex", flexDirection:"column", width:1080, height:1080, fontFamily:FF_AD, overflow:"hidden" }}>
            {/* Foto zona superior */}
            <div style={{ display:"flex", position:"relative", width:1080, height:photoH, flexShrink:0 }}>
              <img src={imageData} alt="" style={{ width:1080, height:photoH, objectFit:"cover" }} />
              <div style={{ display:"flex", position:"absolute", bottom:0, left:0, right:0, height:180, background:"linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)" }} />
              {/* Badge con acento del tema */}
              <div style={{ display:"flex", position:"absolute", top:30, left:30, backgroundColor:t.accent, padding:"10px 24px", borderRadius:10 }}>
                <span style={{ color:t.btnText, fontSize:24, fontWeight:700 }}>{badge}</span>
              </div>
              {/* Logo arriba derecha en recuadro blanco */}
              {logoB64 ? (
                <div style={{ display:"flex", position:"absolute", top:26, right:26, backgroundColor:"#ffffff", borderRadius:10, padding:"6px 12px", alignItems:"center" }}>
                  <img src={logoB64} alt="" style={{ height:44, width:130, objectFit:"contain" }} />
                </div>
              ) : null}
            </div>
            {/* Zona de datos */}
            <div style={{ display:"flex", flexDirection:"column", background:t.bgStyle, padding:"26px 44px 22px", height:dataH, flexShrink:0 }}>
              <span style={{ fontSize:70, fontWeight:900, color:t.accent, lineHeight:1, letterSpacing:"-1px" }}>{price}</span>
              <span style={{ fontSize:24, color:t.textSub, marginTop:6 }}>{zona}</span>
              {/* Pills compactos */}
              <div style={{ display:"flex", gap:10, marginTop:14, flexWrap:"wrap" }}>
                {metros ? <div style={{ display:"flex", border:`1px solid ${t.accent}`, borderRadius:50, padding:"7px 16px", backgroundColor:hexRgba(t.accent, 0.14) }}><span style={{ color:t.accent, fontSize:21, fontWeight:600 }}>{metros} m²</span></div> : null}
                {dormitorios ? <div style={{ display:"flex", border:`1px solid ${t.accent}`, borderRadius:50, padding:"7px 16px", backgroundColor:hexRgba(t.accent, 0.14) }}><span style={{ color:t.accent, fontSize:21, fontWeight:600 }}>{dormitorios} dorm</span></div> : null}
                {banios ? <div style={{ display:"flex", border:`1px solid ${t.accent}`, borderRadius:50, padding:"7px 16px", backgroundColor:hexRgba(t.accent, 0.14) }}><span style={{ color:t.accent, fontSize:21, fontWeight:600 }}>{banios} baños</span></div> : null}
              </div>
              {/* Contacto y CTA */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"auto" }}>
                <div style={{ display:"flex", gap:16 }}>
                  {agenteWhatsapp ? <span style={{ fontSize:19, color:t.ftext }}>WA {agenteWhatsapp}</span> : null}
                  {igHandleAd ? <span style={{ fontSize:19, color:t.ftext }}>{igHandleAd}</span> : null}
                </div>
                <div style={{ display:"flex", backgroundColor:t.accent, padding:"14px 32px", borderRadius:12 }}>
                  <span style={{ color:t.btnText, fontSize:24, fontWeight:800 }}>Consultá ahora</span>
                </div>
              </div>
            </div>
          </div>, { width:1080, height:1080 }
        );
      }

      // Story 1080×1920 — 55% foto / 45% datos
      if (type === "story") {
        const photoH = 1056, dataH = 864;
        return new ImageResponse(
          <div style={{ display:"flex", flexDirection:"column", width:1080, height:1920, fontFamily:FF_AD, overflow:"hidden" }}>
            <div style={{ display:"flex", position:"relative", width:1080, height:photoH, flexShrink:0 }}>
              <img src={imageData} alt="" style={{ width:1080, height:photoH, objectFit:"cover" }} />
              <div style={{ display:"flex", position:"absolute", bottom:0, left:0, right:0, height:240, background:"linear-gradient(to top, rgba(0,0,0,0.60) 0%, transparent 100%)" }} />
              <div style={{ display:"flex", position:"absolute", top:50, left:50, backgroundColor:t.accent, padding:"14px 32px", borderRadius:12 }}>
                <span style={{ color:t.btnText, fontSize:30, fontWeight:700 }}>{badge}</span>
              </div>
              {logoB64 ? (
                <div style={{ display:"flex", position:"absolute", top:44, right:44, backgroundColor:"#ffffff", borderRadius:12, padding:"8px 16px", alignItems:"center" }}>
                  <img src={logoB64} alt="" style={{ height:54, width:160, objectFit:"contain" }} />
                </div>
              ) : null}
            </div>
            <div style={{ display:"flex", flexDirection:"column", background:t.bgStyle, padding:"48px 70px 44px", height:dataH, flexShrink:0 }}>
              <span style={{ fontSize:96, fontWeight:900, color:t.accent, lineHeight:1, letterSpacing:"-2px" }}>{price}</span>
              <span style={{ fontSize:34, color:t.textSub, marginTop:10 }}>{zona}</span>
              <div style={{ display:"flex", gap:14, marginTop:24, flexWrap:"wrap" }}>
                {metros ? <div style={{ display:"flex", border:`1px solid ${t.accent}`, borderRadius:50, padding:"10px 24px", backgroundColor:hexRgba(t.accent, 0.14) }}><span style={{ color:t.accent, fontSize:30, fontWeight:600 }}>{metros} m²</span></div> : null}
                {dormitorios ? <div style={{ display:"flex", border:`1px solid ${t.accent}`, borderRadius:50, padding:"10px 24px", backgroundColor:hexRgba(t.accent, 0.14) }}><span style={{ color:t.accent, fontSize:30, fontWeight:600 }}>{dormitorios} dorm</span></div> : null}
                {banios ? <div style={{ display:"flex", border:`1px solid ${t.accent}`, borderRadius:50, padding:"10px 24px", backgroundColor:hexRgba(t.accent, 0.14) }}><span style={{ color:t.accent, fontSize:30, fontWeight:600 }}>{banios} baños</span></div> : null}
              </div>
              {(agenteWhatsapp || igHandleAd) ? (
                <div style={{ display:"flex", gap:24, marginTop:28 }}>
                  {agenteWhatsapp ? <span style={{ fontSize:26, color:t.ftext }}>WA {agenteWhatsapp}</span> : null}
                  {igHandleAd ? <span style={{ fontSize:26, color:t.ftext }}>{igHandleAd}</span> : null}
                </div>
              ) : null}
              <div style={{ display:"flex", marginTop:"auto", justifyContent:"center" }}>
                <div style={{ display:"flex", backgroundColor:t.accent, padding:"26px 80px", borderRadius:18 }}>
                  <span style={{ color:t.btnText, fontSize:40, fontWeight:800 }}>Consultá ahora</span>
                </div>
              </div>
            </div>
          </div>, { width:1080, height:1920 }
        );
      }

      // Banner 1200×628 — 50% foto izquierda / 50% datos derecha
      return new ImageResponse(
        <div style={{ display:"flex", position:"relative", width:1200, height:628, fontFamily:FF_AD, overflow:"hidden" }}>
          {/* Foto lado izquierdo */}
          <div style={{ display:"flex", position:"relative", width:600, height:628, flexShrink:0 }}>
            <img src={imageData} alt="" style={{ width:600, height:628, objectFit:"cover" }} />
            <div style={{ display:"flex", position:"absolute", top:0, right:0, bottom:0, width:80, background:"linear-gradient(to right, transparent, rgba(0,0,0,0.28))" }} />
            <div style={{ display:"flex", position:"absolute", bottom:22, left:22, backgroundColor:t.accent, padding:"8px 20px", borderRadius:8 }}>
              <span style={{ color:t.btnText, fontSize:20, fontWeight:700 }}>{badge}</span>
            </div>
          </div>
          {/* Datos lado derecho */}
          <div style={{ display:"flex", flexDirection:"column", flex:1, background:t.bgStyle, padding:"32px 38px" }}>
            {logoB64 ? (
              <div style={{ display:"flex", backgroundColor:"#ffffff", borderRadius:8, padding:"5px 10px", alignSelf:"flex-end", marginBottom:14 }}>
                <img src={logoB64} alt="" style={{ height:34, width:100, objectFit:"contain" }} />
              </div>
            ) : null}
            <span style={{ fontSize:52, fontWeight:900, color:t.accent, lineHeight:1, letterSpacing:"-1px" }}>{price}</span>
            <span style={{ fontSize:20, color:t.textSub, marginTop:6 }}>{zona}</span>
            <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
              {metros ? <div style={{ display:"flex", border:`1px solid ${t.accent}`, borderRadius:50, padding:"6px 14px", backgroundColor:hexRgba(t.accent, 0.14) }}><span style={{ color:t.accent, fontSize:18, fontWeight:600 }}>{metros} m²</span></div> : null}
              {dormitorios ? <div style={{ display:"flex", border:`1px solid ${t.accent}`, borderRadius:50, padding:"6px 14px", backgroundColor:hexRgba(t.accent, 0.14) }}><span style={{ color:t.accent, fontSize:18, fontWeight:600 }}>{dormitorios} dorm</span></div> : null}
              {banios ? <div style={{ display:"flex", border:`1px solid ${t.accent}`, borderRadius:50, padding:"6px 14px", backgroundColor:hexRgba(t.accent, 0.14) }}><span style={{ color:t.accent, fontSize:18, fontWeight:600 }}>{banios} baños</span></div> : null}
            </div>
            {(agenteWhatsapp || igHandleAd) ? (
              <div style={{ display:"flex", gap:16, marginTop:12 }}>
                {agenteWhatsapp ? <span style={{ fontSize:17, color:t.ftext }}>WA {agenteWhatsapp}</span> : null}
                {igHandleAd ? <span style={{ fontSize:17, color:t.ftext }}>{igHandleAd}</span> : null}
              </div>
            ) : null}
            <div style={{ display:"flex", marginTop:"auto" }}>
              <div style={{ display:"flex", backgroundColor:t.accent, padding:"13px 28px", borderRadius:10 }}>
                <span style={{ color:t.btnText, fontSize:20, fontWeight:700 }}>Consultá ahora</span>
              </div>
            </div>
          </div>
        </div>, { width:1200, height:628 }
      );
    }

    // ── LUXURY ────────────────────────────────────────────────────────────
    if (estilo === "luxury") {
      const GOLD = colorMarca; const BG = "#0a0a0a"; const W = "#ffffff";

      if (type === "feed") return new ImageResponse(
        <div style={{ display:"flex", flexDirection:"column", position:"relative", width:1080, height:1080, backgroundColor:BG, fontFamily:ff, overflow:"hidden" }}>
          {/* Photo 55% */}
          <div style={{ display:"flex", position:"relative", width:1080, height:594, flexShrink:0 }}>
            <img src={imageData} alt="" style={{ width:1080, height:594, objectFit:"cover" }} />
            <div style={{ display:"flex", position:"absolute", top:0, left:0, right:0, bottom:0, backgroundColor:"rgba(0,0,0,0.38)" }} />
            <div style={{ display:"flex", position:"absolute", top:32, right:32, backgroundColor:bc.bg, color:bc.text, fontSize:22, fontWeight:700, padding:"10px 26px", borderRadius:4, letterSpacing:"0.08em" }}>{badge.toUpperCase()}</div>
            {agente ? <div style={{ display:"flex", position:"absolute", top:86, right:32, color:W, fontSize:20, fontWeight:300, letterSpacing:"0.18em" }}>{agente.toUpperCase()}</div> : null}
          </div>
          {/* Info 45% */}
          <div style={{ display:"flex", flexDirection:"column", width:1080, height:486, backgroundColor:BG, padding:"36px 60px 32px", flexShrink:0 }}>
            <div style={{ display:"flex", width:"100%", height:1, backgroundColor:GOLD, opacity:0.55, marginBottom:28 }} />
            <div style={{ display:"flex", fontSize:80, fontWeight:700, color:GOLD, lineHeight:1, letterSpacing:"-1px" }}>{price}</div>
            <div style={{ display:"flex", fontSize:28, color:W, marginTop:14, opacity:0.65, letterSpacing:"0.1em", fontWeight:300 }}>{zona.toUpperCase()}&nbsp;·&nbsp;{specs}</div>
            {car1 ? <div style={{ display:"flex", fontSize:22, color:W, opacity:0.55, marginTop:18 }}>— {car1}</div> : null}
            {car2 ? <div style={{ display:"flex", fontSize:22, color:W, opacity:0.55, marginTop:8 }}>— {car2}</div> : null}
            {amenitiesStr ? <div style={{ display:"flex", fontSize:18, color:W, opacity:0.45, marginTop:10 }}>{amenitiesStr}</div> : null}
            {agenteWhatsapp ? <div style={{ display:"flex", fontSize:18, color:"#4ade80", marginTop:10, fontWeight:600 }}>WA: {agenteWhatsapp}</div> : null}
            <div style={{ display:"flex", flexDirection:"column", marginTop:"auto", gap:14 }}>
              <div style={{ display:"flex", width:"100%", height:1, backgroundColor:GOLD, opacity:0.55 }} />
              <div style={{ display:"flex", justifyContent:"flex-end", fontSize:15, color:W, opacity:0.3 }}>Creado con PropIA</div>
            </div>
          </div>
          {agentLogoData ? <img src={agentLogoData} alt="" style={{ position:"absolute", top:logoProps.top, left:logoProps.left, width:logoProps.w, height:logoProps.h, objectFit:"contain", objectPosition:"left center" }} /> : null}
        </div>, imgOpts
      );

      if (type === "story") return new ImageResponse(
        <div style={{ display:"flex", flexDirection:"column", position:"relative", width:1080, height:1920, backgroundColor:BG, fontFamily:ff, overflow:"hidden" }}>
          <div style={{ display:"flex", position:"relative", width:1080, height:960, flexShrink:0 }}>
            <img src={imageData} alt="" style={{ width:1080, height:960, objectFit:"cover" }} />
            <div style={{ display:"flex", position:"absolute", top:0, left:0, right:0, bottom:0, backgroundColor:"rgba(0,0,0,0.38)" }} />
            <div style={{ display:"flex", position:"absolute", top:50, right:50, backgroundColor:bc.bg, color:bc.text, fontSize:26, fontWeight:700, padding:"12px 32px", borderRadius:4, letterSpacing:"0.08em" }}>{badge.toUpperCase()}</div>
            {agente ? <div style={{ display:"flex", position:"absolute", top:110, right:50, color:W, fontSize:22, fontWeight:300, letterSpacing:"0.18em" }}>{agente.toUpperCase()}</div> : null}
          </div>
          <div style={{ display:"flex", flexDirection:"column", width:1080, height:960, backgroundColor:BG, padding:"60px 80px 56px", flexShrink:0 }}>
            <div style={{ display:"flex", width:"100%", height:1, backgroundColor:GOLD, opacity:0.55, marginBottom:48 }} />
            <div style={{ display:"flex", fontSize:96, fontWeight:700, color:GOLD, lineHeight:1, letterSpacing:"-2px" }}>{price}</div>
            <div style={{ display:"flex", fontSize:36, color:W, marginTop:22, opacity:0.65, letterSpacing:"0.1em", fontWeight:300 }}>{zona.toUpperCase()}</div>
            <div style={{ display:"flex", fontSize:30, color:W, marginTop:8, opacity:0.45 }}>{specs}</div>
            {car1 ? <div style={{ display:"flex", fontSize:28, color:W, opacity:0.6, marginTop:36 }}>— {car1}</div> : null}
            {car2 ? <div style={{ display:"flex", fontSize:28, color:W, opacity:0.6, marginTop:14 }}>— {car2}</div> : null}
            {amenitiesStr ? <div style={{ display:"flex", fontSize:24, color:W, opacity:0.45, marginTop:12 }}>{amenitiesStr}</div> : null}
            {agenteWhatsapp ? <div style={{ display:"flex", fontSize:24, color:"#4ade80", marginTop:12, fontWeight:600 }}>WA: {agenteWhatsapp}</div> : null}
            <div style={{ display:"flex", flexDirection:"column", marginTop:"auto", gap:18 }}>
              <div style={{ display:"flex", width:"100%", height:1, backgroundColor:GOLD, opacity:0.55 }} />
              <div style={{ display:"flex", justifyContent:"flex-end", fontSize:18, color:W, opacity:0.3 }}>Creado con PropIA</div>
            </div>
          </div>
          {agentLogoData ? <img src={agentLogoData} alt="" style={{ position:"absolute", top:logoProps.top, left:logoProps.left, width:logoProps.w, height:logoProps.h, objectFit:"contain", objectPosition:"left center" }} /> : null}
        </div>, imgOpts
      );

      return new ImageResponse(
        <div style={{ display:"flex", position:"relative", width:1200, height:628, backgroundColor:BG, fontFamily:ff, overflow:"hidden" }}>
          <div style={{ display:"flex", position:"relative", width:540, height:628, flexShrink:0 }}>
            <img src={imageData} alt="" style={{ width:540, height:628, objectFit:"cover" }} />
            <div style={{ display:"flex", position:"absolute", top:0, left:0, right:0, bottom:0, backgroundColor:"rgba(0,0,0,0.38)" }} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", flex:1, backgroundColor:BG, padding:"40px 50px 36px" }}>
            <div style={{ display:"flex", backgroundColor:bc.bg, color:bc.text, fontSize:17, fontWeight:700, padding:"8px 20px", borderRadius:4, letterSpacing:"0.08em", alignSelf:"flex-start", marginBottom:22 }}>{badge.toUpperCase()}</div>
            <div style={{ display:"flex", width:"100%", height:1, backgroundColor:GOLD, opacity:0.55, marginBottom:22 }} />
            <div style={{ display:"flex", fontSize:62, fontWeight:700, color:GOLD, lineHeight:1 }}>{price}</div>
            <div style={{ display:"flex", fontSize:22, color:W, marginTop:12, opacity:0.65, letterSpacing:"0.1em", fontWeight:300 }}>{zona.toUpperCase()}&nbsp;·&nbsp;{specs}</div>
            {car1 ? <div style={{ display:"flex", fontSize:18, color:W, opacity:0.5, marginTop:16 }}>— {car1}</div> : null}
            {car2 ? <div style={{ display:"flex", fontSize:18, color:W, opacity:0.5, marginTop:8 }}>— {car2}</div> : null}
            {amenitiesStr ? <div style={{ display:"flex", fontSize:15, color:W, opacity:0.4, marginTop:8 }}>{amenitiesStr}</div> : null}
            {agenteWhatsapp ? <div style={{ display:"flex", fontSize:15, color:"#4ade80", marginTop:8, fontWeight:600 }}>WA: {agenteWhatsapp}</div> : null}
            <div style={{ display:"flex", flexDirection:"column", marginTop:"auto", gap:12 }}>
              <div style={{ display:"flex", width:"100%", height:1, backgroundColor:GOLD, opacity:0.55 }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                {agente ? <div style={{ display:"flex", fontSize:17, color:W, opacity:0.5, fontWeight:300, letterSpacing:"0.12em" }}>{agente.toUpperCase()}</div> : <div style={{ display:"flex" }} />}
                <div style={{ display:"flex", fontSize:13, color:W, opacity:0.3 }}>Creado con PropIA</div>
              </div>
            </div>
          </div>
          {agentLogoData ? <img src={agentLogoData} alt="" style={{ position:"absolute", top:logoProps.top, left:logoProps.left, width:logoProps.w, height:logoProps.h, objectFit:"contain", objectPosition:"left center" }} /> : null}
        </div>, imgOpts
      );
    }

    // ── MODERNO ───────────────────────────────────────────────────────────
    if (estilo === "moderno") {
      const A = colorMarca; const BG = "#ffffff"; const TEXT = "#111111"; const LIGHT = "#f4f4f4";

      if (type === "feed") return new ImageResponse(
        <div style={{ display:"flex", flexDirection:"column", position:"relative", width:1080, height:1080, backgroundColor:BG, fontFamily:ff, overflow:"hidden", paddingTop:56, paddingRight:56, paddingBottom:56, paddingLeft:56 }}>
          {/* Photo with badge overlay */}
          <div style={{ display:"flex", position:"relative", width:968, height:528, borderRadius:20, overflow:"hidden", flexShrink:0 }}>
            <img src={imageData} alt="" style={{ width:968, height:528, objectFit:"cover" }} />
            <div style={{ display:"flex", position:"absolute", top:20, right:20, backgroundColor:A, color:"#fff", fontSize:22, fontWeight:700, paddingTop:10, paddingRight:24, paddingBottom:10, paddingLeft:24, borderRadius:100 }}>{badge}</div>
          </div>
          {/* Info */}
          <div style={{ display:"flex", flexDirection:"column", flex:1, paddingTop:32 }}>
            <div style={{ display:"flex", fontSize:80, fontWeight:900, color:TEXT, lineHeight:1, letterSpacing:"-2px" }}>{price}</div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:14 }}>
              <div style={{ display:"flex", width:8, height:8, borderRadius:"50%", backgroundColor:A }} />
              <div style={{ display:"flex", fontSize:28, color:"#555555" }}>{zona}&nbsp;·&nbsp;{specs}</div>
            </div>
            {(car1 || car2) ? (
              <div style={{ display:"flex", gap:16, marginTop:20 }}>
                {car1 ? (
                  <div style={{ display:"flex", alignItems:"center", gap:8, backgroundColor:LIGHT, borderRadius:100, paddingTop:8, paddingRight:20, paddingBottom:8, paddingLeft:20 }}>
                    <div style={{ display:"flex", width:8, height:8, borderRadius:"50%", backgroundColor:A }} />
                    <div style={{ display:"flex", fontSize:20, color:"#444444" }}>{car1}</div>
                  </div>
                ) : null}
                {car2 ? (
                  <div style={{ display:"flex", alignItems:"center", gap:8, backgroundColor:LIGHT, borderRadius:100, paddingTop:8, paddingRight:20, paddingBottom:8, paddingLeft:20 }}>
                    <div style={{ display:"flex", width:8, height:8, borderRadius:"50%", backgroundColor:A }} />
                    <div style={{ display:"flex", fontSize:20, color:"#444444" }}>{car2}</div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {amenitiesStr ? <div style={{ display:"flex", fontSize:18, color:"#666666", marginTop:12 }}>{amenitiesStr}</div> : null}
            {agenteWhatsapp ? <div style={{ display:"flex", fontSize:18, color:"#22c55e", marginTop:10, fontWeight:700 }}>WA: {agenteWhatsapp}</div> : null}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"auto" }}>
              {agente ? <div style={{ display:"flex", fontSize:22, fontWeight:600, color:A }}>{agente}</div> : <div style={{ display:"flex" }} />}
              <div style={{ display:"flex", fontSize:15, color:"#cccccc" }}>Creado con PropIA</div>
            </div>
          </div>
          {agentLogoData ? <img src={agentLogoData} alt="" style={{ position:"absolute", top:logoProps.top, left:logoProps.left, width:logoProps.w, height:logoProps.h, objectFit:"contain", objectPosition:"left center" }} /> : null}
        </div>, imgOpts
      );

      if (type === "story") return new ImageResponse(
        <div style={{ display:"flex", flexDirection:"column", position:"relative", width:1080, height:1920, backgroundColor:BG, fontFamily:ff, overflow:"hidden" }}>
          <div style={{ display:"flex", position:"relative", width:1080, height:1000, flexShrink:0 }}>
            <img src={imageData} alt="" style={{ width:1080, height:1000, objectFit:"cover" }} />
            <div style={{ display:"flex", position:"absolute", top:50, right:50, backgroundColor:A, color:"#fff", fontSize:28, fontWeight:700, paddingTop:12, paddingRight:32, paddingBottom:12, paddingLeft:32, borderRadius:100 }}>{badge}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", flex:1, backgroundColor:BG, paddingTop:60, paddingRight:80, paddingBottom:56, paddingLeft:80 }}>
            <div style={{ display:"flex", fontSize:100, fontWeight:900, color:TEXT, lineHeight:1, letterSpacing:"-3px" }}>{price}</div>
            <div style={{ display:"flex", alignItems:"center", gap:16, marginTop:22 }}>
              <div style={{ display:"flex", width:10, height:10, borderRadius:"50%", backgroundColor:A }} />
              <div style={{ display:"flex", fontSize:38, color:"#555555" }}>{zona}</div>
            </div>
            <div style={{ display:"flex", fontSize:32, color:"#888888", marginTop:10 }}>{specs}</div>
            {car1 ? (
              <div style={{ display:"flex", alignItems:"center", gap:16, backgroundColor:LIGHT, borderRadius:16, paddingTop:16, paddingRight:24, paddingBottom:16, paddingLeft:24, marginTop:40 }}>
                <div style={{ display:"flex", width:10, height:10, borderRadius:"50%", backgroundColor:A, flexShrink:0 }} />
                <div style={{ display:"flex", fontSize:28, color:"#444444" }}>{car1}</div>
              </div>
            ) : null}
            {car2 ? (
              <div style={{ display:"flex", alignItems:"center", gap:16, backgroundColor:LIGHT, borderRadius:16, paddingTop:16, paddingRight:24, paddingBottom:16, paddingLeft:24, marginTop:16 }}>
                <div style={{ display:"flex", width:10, height:10, borderRadius:"50%", backgroundColor:A, flexShrink:0 }} />
                <div style={{ display:"flex", fontSize:28, color:"#444444" }}>{car2}</div>
              </div>
            ) : null}
            {amenitiesStr ? <div style={{ display:"flex", fontSize:24, color:"#888888", marginTop:12 }}>{amenitiesStr}</div> : null}
            {agenteWhatsapp ? <div style={{ display:"flex", fontSize:24, color:"#22c55e", marginTop:12, fontWeight:700 }}>WA: {agenteWhatsapp}</div> : null}
            <div style={{ display:"flex", flexDirection:"column", marginTop:"auto", gap:14 }}>
              {agente ? <div style={{ display:"flex", fontSize:28, fontWeight:600, color:A }}>{agente}</div> : null}
              <div style={{ display:"flex", fontSize:18, color:"#cccccc" }}>Creado con PropIA</div>
            </div>
          </div>
          {agentLogoData ? <img src={agentLogoData} alt="" style={{ position:"absolute", top:logoProps.top, left:logoProps.left, width:logoProps.w, height:logoProps.h, objectFit:"contain", objectPosition:"left center" }} /> : null}
        </div>, imgOpts
      );

      return new ImageResponse(
        <div style={{ display:"flex", position:"relative", width:1200, height:628, backgroundColor:BG, fontFamily:ff, overflow:"hidden" }}>
          {/* Photo left — fixed dims, no flex: the image doesn't flex */}
          <div style={{ display:"flex", width:500, height:628, flexShrink:0 }}>
            <img src={imageData} alt="" style={{ width:500, height:628, objectFit:"cover" }} />
          </div>
          {/* Info right */}
          <div style={{ display:"flex", flexDirection:"column", flex:1, paddingTop:50, paddingRight:50, paddingBottom:40, paddingLeft:40 }}>
            <div style={{ display:"flex", backgroundColor:A, color:"#fff", fontSize:17, fontWeight:700, paddingTop:8, paddingRight:20, paddingBottom:8, paddingLeft:20, borderRadius:100, alignSelf:"flex-start", marginBottom:22 }}>{badge}</div>
            <div style={{ display:"flex", fontSize:58, fontWeight:900, color:TEXT, lineHeight:1, letterSpacing:"-1px" }}>{price}</div>
            <div style={{ display:"flex", fontSize:22, color:"#666666", marginTop:10 }}>{zona}&nbsp;·&nbsp;{specs}</div>
            {car1 ? (
              <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:18 }}>
                <div style={{ display:"flex", width:8, height:8, borderRadius:"50%", backgroundColor:A, flexShrink:0 }} />
                <div style={{ display:"flex", fontSize:18, color:"#555555" }}>{car1}</div>
              </div>
            ) : null}
            {car2 ? (
              <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:10 }}>
                <div style={{ display:"flex", width:8, height:8, borderRadius:"50%", backgroundColor:A, flexShrink:0 }} />
                <div style={{ display:"flex", fontSize:18, color:"#555555" }}>{car2}</div>
              </div>
            ) : null}
            {amenitiesStr ? <div style={{ display:"flex", fontSize:16, color:"#666666", marginTop:10 }}>{amenitiesStr}</div> : null}
            {agenteWhatsapp ? <div style={{ display:"flex", fontSize:16, color:"#22c55e", marginTop:8, fontWeight:700 }}>WA: {agenteWhatsapp}</div> : null}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"auto" }}>
              {agente ? <div style={{ display:"flex", fontSize:20, fontWeight:600, color:A }}>{agente}</div> : <div style={{ display:"flex" }} />}
              <div style={{ display:"flex", fontSize:13, color:"#cccccc" }}>Creado con PropIA</div>
            </div>
          </div>
          {agentLogoData ? <img src={agentLogoData} alt="" style={{ position:"absolute", top:logoProps.top, left:logoProps.left, width:logoProps.w, height:logoProps.h, objectFit:"contain", objectPosition:"left center" }} /> : null}
        </div>, imgOpts
      );
    }

    // ── BOLD ──────────────────────────────────────────────────────────────
    if (estilo === "bold") {
      const W = "#ffffff";

      if (type === "feed") return new ImageResponse(
        <div style={{ display:"flex", position:"relative", width:1080, height:1080, fontFamily:ff, overflow:"hidden" }}>
          <img src={imageData} alt="" style={{ position:"absolute", top:0, left:0, width:1080, height:1080, objectFit:"cover" }} />
          <div style={{ display:"flex", position:"absolute", top:0, left:0, right:0, bottom:0, background:"linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.05) 70%, transparent 100%)" }} />
          <div style={{ display:"flex", position:"absolute", top:40, right:40, backgroundColor:bc.bg, color:bc.text, fontSize:24, fontWeight:700, paddingTop:12, paddingRight:28, paddingBottom:12, paddingLeft:28, borderRadius:6, letterSpacing:"0.06em" }}>{badge.toUpperCase()}</div>
          {agente ? <div style={{ display:"flex", position:"absolute", top:100, right:40, color:W, fontSize:22, fontWeight:700 }}>{agente}</div> : null}
          <div style={{ display:"flex", position:"absolute", bottom:110, left:50, right:50, flexDirection:"column" }}>
            <div style={{ display:"flex", fontSize:96, fontWeight:900, color:W, lineHeight:1, letterSpacing:"-2px" }}>{price}</div>
            <div style={{ display:"flex", fontSize:34, color:W, opacity:0.85, marginTop:14 }}>{zona}&nbsp;·&nbsp;{specs}</div>
            {car1 ? <div style={{ display:"flex", fontSize:24, color:W, opacity:0.75, marginTop:16 }}>✓ {car1}</div> : null}
            {car2 ? <div style={{ display:"flex", fontSize:24, color:W, opacity:0.75, marginTop:10 }}>✓ {car2}</div> : null}
            {amenitiesStr ? <div style={{ display:"flex", fontSize:20, color:W, opacity:0.65, marginTop:10 }}>{amenitiesStr}</div> : null}
            {agenteWhatsapp ? <div style={{ display:"flex", fontSize:20, color:"#4ade80", marginTop:10 }}>WA: {agenteWhatsapp}</div> : null}
          </div>
          <div style={{ display:"flex", position:"absolute", bottom:0, left:0, right:0, height:6, backgroundColor:colorMarca }} />
          <div style={{ display:"flex", position:"absolute", bottom:28, right:40, fontSize:16, color:W, opacity:0.3 }}>Creado con PropIA</div>
          {agentLogoData ? <img src={agentLogoData} alt="" style={{ position:"absolute", top:logoProps.top, left:logoProps.left, width:logoProps.w, height:logoProps.h, objectFit:"contain", objectPosition:"left center" }} /> : null}
        </div>, imgOpts
      );

      if (type === "story") return new ImageResponse(
        <div style={{ display:"flex", position:"relative", width:1080, height:1920, fontFamily:ff, overflow:"hidden" }}>
          <img src={imageData} alt="" style={{ position:"absolute", top:0, left:0, width:1080, height:1920, objectFit:"cover" }} />
          <div style={{ display:"flex", position:"absolute", top:0, left:0, right:0, bottom:0, background:"linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.72) 38%, rgba(0,0,0,0.1) 65%, transparent 100%)" }} />
          <div style={{ display:"flex", position:"absolute", top:60, right:60, backgroundColor:bc.bg, color:bc.text, fontSize:28, fontWeight:700, paddingTop:14, paddingRight:34, paddingBottom:14, paddingLeft:34, borderRadius:6, letterSpacing:"0.06em" }}>{badge.toUpperCase()}</div>
          {agente ? <div style={{ display:"flex", position:"absolute", top:124, right:60, color:W, fontSize:26, fontWeight:700 }}>{agente}</div> : null}
          <div style={{ display:"flex", position:"absolute", bottom:120, left:70, right:70, flexDirection:"column" }}>
            <div style={{ display:"flex", fontSize:118, fontWeight:900, color:W, lineHeight:1, letterSpacing:"-3px" }}>{price}</div>
            <div style={{ display:"flex", fontSize:44, color:W, opacity:0.85, marginTop:22 }}>{zona}</div>
            <div style={{ display:"flex", fontSize:36, color:W, opacity:0.65, marginTop:8 }}>{specs}</div>
            {car1 ? <div style={{ display:"flex", fontSize:30, color:W, opacity:0.8, marginTop:28 }}>✓ {car1}</div> : null}
            {car2 ? <div style={{ display:"flex", fontSize:30, color:W, opacity:0.8, marginTop:14 }}>✓ {car2}</div> : null}
            {amenitiesStr ? <div style={{ display:"flex", fontSize:24, color:W, opacity:0.65, marginTop:12 }}>{amenitiesStr}</div> : null}
            {agenteWhatsapp ? <div style={{ display:"flex", fontSize:24, color:"#4ade80", marginTop:12 }}>WA: {agenteWhatsapp}</div> : null}
          </div>
          <div style={{ display:"flex", position:"absolute", bottom:0, left:0, right:0, height:6, backgroundColor:colorMarca }} />
          <div style={{ display:"flex", position:"absolute", bottom:38, right:60, fontSize:20, color:W, opacity:0.3 }}>Creado con PropIA</div>
          {agentLogoData ? <img src={agentLogoData} alt="" style={{ position:"absolute", top:logoProps.top, left:logoProps.left, width:logoProps.w, height:logoProps.h, objectFit:"contain", objectPosition:"left center" }} /> : null}
        </div>, imgOpts
      );

      return new ImageResponse(
        <div style={{ display:"flex", position:"relative", width:1200, height:628, fontFamily:ff, overflow:"hidden" }}>
          <img src={imageData} alt="" style={{ position:"absolute", top:0, left:0, width:1200, height:628, objectFit:"cover" }} />
          <div style={{ display:"flex", position:"absolute", top:0, left:0, right:0, bottom:0, background:"linear-gradient(to right, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.82) 55%, rgba(0,0,0,0.96) 100%)" }} />
          <div style={{ display:"flex", position:"absolute", top:38, right:38, backgroundColor:bc.bg, color:bc.text, fontSize:19, fontWeight:700, paddingTop:9, paddingRight:22, paddingBottom:9, paddingLeft:22, borderRadius:5, letterSpacing:"0.06em" }}>{badge.toUpperCase()}</div>
          <div style={{ display:"flex", position:"absolute", right:56, top:0, bottom:0, width:590, flexDirection:"column", justifyContent:"center" }}>
            <div style={{ display:"flex", fontSize:72, fontWeight:900, color:W, lineHeight:1, letterSpacing:"-2px" }}>{price}</div>
            <div style={{ display:"flex", fontSize:26, color:W, opacity:0.85, marginTop:12 }}>{zona}&nbsp;·&nbsp;{specs}</div>
            {car1 ? <div style={{ display:"flex", fontSize:20, color:W, opacity:0.7, marginTop:14 }}>✓ {car1}</div> : null}
            {car2 ? <div style={{ display:"flex", fontSize:20, color:W, opacity:0.7, marginTop:8 }}>✓ {car2}</div> : null}
            {agente ? <div style={{ display:"flex", fontSize:20, color:W, opacity:0.55, marginTop:20, fontWeight:700 }}>{agente}</div> : null}
            {amenitiesStr ? <div style={{ display:"flex", fontSize:16, color:W, opacity:0.6, marginTop:10 }}>{amenitiesStr}</div> : null}
            {agenteWhatsapp ? <div style={{ display:"flex", fontSize:16, color:"#4ade80", marginTop:8 }}>WA: {agenteWhatsapp}</div> : null}
          </div>
          <div style={{ display:"flex", position:"absolute", bottom:0, left:0, right:0, height:5, backgroundColor:colorMarca }} />
          <div style={{ display:"flex", position:"absolute", bottom:18, right:38, fontSize:13, color:W, opacity:0.3 }}>Creado con PropIA</div>
          {agentLogoData ? <img src={agentLogoData} alt="" style={{ position:"absolute", top:logoProps.top, left:logoProps.left, width:logoProps.w, height:logoProps.h, objectFit:"contain", objectPosition:"left center" }} /> : null}
        </div>, imgOpts
      );
    }

    // ── PROFESIONAL ───────────────────────────────────────────────────────
    {
      const P = colorMarca; const W = "#ffffff";

      if (type === "feed") return new ImageResponse(
        <div style={{ display:"flex", position:"relative", width:1080, height:1080, backgroundColor:P, fontFamily:ff, overflow:"hidden" }}>
          <div style={{ display:"flex", width:486, height:1080, flexShrink:0 }}>
            <img src={imageData} alt="" style={{ width:486, height:1080, objectFit:"cover" }} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", flex:1, paddingTop:56, paddingRight:50, paddingBottom:46, paddingLeft:50, color:W }}>
            <div style={{ display:"flex", backgroundColor:"rgba(255,255,255,0.18)", color:W, fontSize:19, fontWeight:700, paddingTop:10, paddingRight:22, paddingBottom:10, paddingLeft:22, borderRadius:100, alignSelf:"flex-start", marginBottom:32, letterSpacing:"0.07em" }}>{badge.toUpperCase()}</div>
            <div style={{ display:"flex", fontSize:14, opacity:0.6, letterSpacing:"0.12em", fontWeight:600, marginBottom:6 }}>PRECIO</div>
            <div style={{ display:"flex", fontSize:72, fontWeight:900, lineHeight:1, letterSpacing:"-1px" }}>{price}</div>
            <div style={{ display:"flex", width:56, height:3, backgroundColor:"rgba(255,255,255,0.45)", marginTop:26, marginBottom:26, borderRadius:2 }} />
            <div style={{ display:"flex", fontSize:26, opacity:0.88, marginBottom:8 }}>{zona}</div>
            <div style={{ display:"flex", fontSize:22, opacity:0.6 }}>{specs}</div>
            {car1 ? <div style={{ display:"flex", fontSize:20, opacity:0.78, marginTop:22 }}>· {car1}</div> : null}
            {car2 ? <div style={{ display:"flex", fontSize:20, opacity:0.78, marginTop:10 }}>· {car2}</div> : null}
            {amenitiesStr ? <div style={{ display:"flex", fontSize:17, opacity:0.65, marginTop:12 }}>{amenitiesStr}</div> : null}
            {agenteWhatsapp ? <div style={{ display:"flex", fontSize:17, color:"#86efac", marginTop:10 }}>WA: {agenteWhatsapp}</div> : null}
            <div style={{ display:"flex", flexDirection:"column", marginTop:"auto", gap:14 }}>
              <div style={{ display:"flex", backgroundColor:W, color:P, fontSize:21, fontWeight:800, paddingTop:16, paddingRight:30, paddingBottom:16, paddingLeft:30, borderRadius:100, alignSelf:"flex-start" }}>Consultá ahora</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                {agente ? <div style={{ display:"flex", fontSize:17, opacity:0.7, fontWeight:600 }}>{agente}</div> : <div style={{ display:"flex" }} />}
                <div style={{ display:"flex", fontSize:13, opacity:0.3 }}>Creado con PropIA</div>
              </div>
            </div>
          </div>
          {agentLogoData ? <img src={agentLogoData} alt="" style={{ position:"absolute", top:logoProps.top, left:logoProps.left, width:logoProps.w, height:logoProps.h, objectFit:"contain", objectPosition:"left center" }} /> : null}
        </div>, imgOpts
      );

      if (type === "story") return new ImageResponse(
        <div style={{ display:"flex", flexDirection:"column", position:"relative", width:1080, height:1920, backgroundColor:P, fontFamily:ff, overflow:"hidden" }}>
          <div style={{ display:"flex", width:1080, height:810, flexShrink:0 }}>
            <img src={imageData} alt="" style={{ width:1080, height:810, objectFit:"cover" }} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", flex:1, paddingTop:56, paddingRight:80, paddingBottom:56, paddingLeft:80, color:W }}>
            <div style={{ display:"flex", backgroundColor:"rgba(255,255,255,0.18)", color:W, fontSize:24, fontWeight:700, paddingTop:12, paddingRight:28, paddingBottom:12, paddingLeft:28, borderRadius:100, alignSelf:"flex-start", marginBottom:32, letterSpacing:"0.07em" }}>{badge.toUpperCase()}</div>
            <div style={{ display:"flex", fontSize:96, fontWeight:900, lineHeight:1, letterSpacing:"-2px" }}>{price}</div>
            <div style={{ display:"flex", width:56, height:3, backgroundColor:"rgba(255,255,255,0.45)", marginTop:28, marginBottom:28, borderRadius:2 }} />
            <div style={{ display:"flex", fontSize:34, opacity:0.88 }}>{zona}&nbsp;·&nbsp;{specs}</div>
            {car1 ? <div style={{ display:"flex", fontSize:26, opacity:0.72, marginTop:18 }}>· {car1}</div> : null}
            {car2 ? <div style={{ display:"flex", fontSize:26, opacity:0.72, marginTop:12 }}>· {car2}</div> : null}
            {amenitiesStr ? <div style={{ display:"flex", fontSize:22, opacity:0.65, marginTop:14 }}>{amenitiesStr}</div> : null}
            {agenteWhatsapp ? <div style={{ display:"flex", fontSize:22, color:"#86efac", marginTop:12 }}>WA: {agenteWhatsapp}</div> : null}
            <div style={{ display:"flex", flexDirection:"column", marginTop:"auto", gap:18 }}>
              <div style={{ display:"flex", backgroundColor:W, color:P, fontSize:32, fontWeight:800, paddingTop:22, paddingRight:60, paddingBottom:22, paddingLeft:60, borderRadius:100, alignSelf:"center" }}>Consultá ahora</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                {agente ? <div style={{ display:"flex", fontSize:22, opacity:0.65 }}>{agente}</div> : <div style={{ display:"flex" }} />}
                <div style={{ display:"flex", fontSize:17, opacity:0.3 }}>Creado con PropIA</div>
              </div>
            </div>
          </div>
          {agentLogoData ? <img src={agentLogoData} alt="" style={{ position:"absolute", top:logoProps.top, left:logoProps.left, width:logoProps.w, height:logoProps.h, objectFit:"contain", objectPosition:"left center" }} /> : null}
        </div>, imgOpts
      );

      return new ImageResponse(
        <div style={{ display:"flex", position:"relative", width:1200, height:628, backgroundColor:P, fontFamily:ff, overflow:"hidden" }}>
          <div style={{ display:"flex", width:500, height:628, flexShrink:0 }}>
            <img src={imageData} alt="" style={{ width:500, height:628, objectFit:"cover" }} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", flex:1, paddingTop:38, paddingRight:50, paddingBottom:34, paddingLeft:50, color:W }}>
            <div style={{ display:"flex", backgroundColor:"rgba(255,255,255,0.18)", color:W, fontSize:15, fontWeight:700, paddingTop:8, paddingRight:18, paddingBottom:8, paddingLeft:18, borderRadius:100, alignSelf:"flex-start", marginBottom:18, letterSpacing:"0.07em" }}>{badge.toUpperCase()}</div>
            <div style={{ display:"flex", fontSize:56, fontWeight:900, lineHeight:1, letterSpacing:"-1px" }}>{price}</div>
            <div style={{ display:"flex", width:50, height:3, backgroundColor:"rgba(255,255,255,0.45)", marginTop:18, marginBottom:18, borderRadius:2 }} />
            <div style={{ display:"flex", fontSize:22, opacity:0.88 }}>{zona}&nbsp;·&nbsp;{specs}</div>
            {car1 ? <div style={{ display:"flex", fontSize:17, opacity:0.72, marginTop:10 }}>· {car1}</div> : null}
            {car2 ? <div style={{ display:"flex", fontSize:17, opacity:0.72, marginTop:6 }}>· {car2}</div> : null}
            {amenitiesStr ? <div style={{ display:"flex", fontSize:14, opacity:0.6, marginTop:8 }}>{amenitiesStr}</div> : null}
            {agenteWhatsapp ? <div style={{ display:"flex", fontSize:14, color:"#86efac", marginTop:6 }}>WA: {agenteWhatsapp}</div> : null}
            <div style={{ display:"flex", flexDirection:"column", marginTop:"auto", gap:11 }}>
              <div style={{ display:"flex", backgroundColor:W, color:P, fontSize:19, fontWeight:800, paddingTop:13, paddingRight:30, paddingBottom:13, paddingLeft:30, borderRadius:100, alignSelf:"flex-start" }}>Consultá ahora</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                {agente ? <div style={{ display:"flex", fontSize:15, opacity:0.65 }}>{agente}</div> : <div style={{ display:"flex" }} />}
                <div style={{ display:"flex", fontSize:12, opacity:0.3 }}>Creado con PropIA</div>
              </div>
            </div>
          </div>
          {agentLogoData ? <img src={agentLogoData} alt="" style={{ position:"absolute", top:logoProps.top, left:logoProps.left, width:logoProps.w, height:logoProps.h, objectFit:"contain", objectPosition:"left center" }} /> : null}
        </div>, imgOpts
      );
    }
  } catch (err) {
    const e = err as Error;
    console.error("[generate-ad] ImageResponse error — message:", e?.message);
    console.error("[generate-ad] ImageResponse error — stack:", e?.stack?.slice(0, 500));
    console.error("[generate-ad] imageUrl was:", imageUrl);
    return NextResponse.json({ error: "Image generation failed", detail: String(err) }, { status: 500 });
  }
  void logFeatureUsage("ads");
}
