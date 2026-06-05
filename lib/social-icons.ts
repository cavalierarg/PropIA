import sharp from "sharp";

// WhatsApp — ícono oficial MDI (Material Design Icons)
const WA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="52" height="52">
  <circle cx="12" cy="12" r="12" fill="#25D366"/>
  <path fill="white" d="M12.04 5C8.19 5 5.04 8.14 5.04 12C5.04 13.3 5.38 14.55 6.03 15.64L5.05 19L8.5 18.03C9.55 18.62 10.77 18.96 12.04 18.96C15.89 18.96 19.04 15.82 19.04 11.97C19.04 10.09 18.33 8.32 17.04 7.02C15.74 5.72 13.96 5 12.04 5ZM12.05 6.44C13.56 6.44 14.97 7.02 16.05 8.1C17.12 9.18 17.71 10.61 17.71 12.09C17.71 15.08 15.26 17.52 12.04 17.52C11 17.52 9.98 17.25 9.08 16.73L8.78 16.56L6.67 17.13L7.25 15.07L7.06 14.77C6.5 13.82 6.19 12.72 6.19 11.58C6.2 8.59 8.65 6.14 12.05 6.44ZM9.57 9.19C9.45 9.19 9.25 9.23 9.08 9.43C8.91 9.62 8.42 10.08 8.42 11.01C8.42 11.93 9.1 12.84 9.2 12.97C9.3 13.1 10.62 15.17 12.53 15.96C13.03 16.17 13.41 16.28 13.7 16.36C14.2 16.5 14.66 16.48 15.03 16.43C15.44 16.37 16.18 15.97 16.34 15.52C16.5 15.07 16.5 14.69 16.44 14.61C16.38 14.53 16.25 14.47 16.06 14.38C15.87 14.3 14.93 13.83 14.76 13.77C14.59 13.71 14.47 13.68 14.35 13.87C14.23 14.06 13.85 14.47 13.74 14.59C13.63 14.71 13.53 14.73 13.35 14.64C13.17 14.56 12.56 14.36 11.85 13.73C11.28 13.23 10.88 12.61 10.77 12.42C10.66 12.24 10.76 12.14 10.85 12.05C10.93 11.97 11.04 11.84 11.14 11.72C11.24 11.61 11.27 11.53 11.33 11.41C11.4 11.29 11.37 11.18 11.32 11.09C11.27 11.01 10.89 10.07 10.73 9.71C10.58 9.35 10.42 9.4 10.3 9.39C10.2 9.38 10.08 9.38 9.96 9.38C9.84 9.38 9.71 9.38 9.57 9.38V9.19Z"/>
</svg>`;

// Instagram — ícono con gradiente oficial
const IG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width="52" height="52">
  <defs>
    <linearGradient id="ig" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#FFDC80"/>
      <stop offset="25%" stop-color="#FCAF45"/>
      <stop offset="50%" stop-color="#FD1D1D"/>
      <stop offset="75%" stop-color="#E1306C"/>
      <stop offset="100%" stop-color="#833AB4"/>
    </linearGradient>
  </defs>
  <rect width="52" height="52" rx="13" fill="url(#ig)"/>
  <rect x="10" y="10" width="32" height="32" rx="9" fill="none" stroke="white" stroke-width="3.5"/>
  <circle cx="26" cy="26" r="9" fill="none" stroke="white" stroke-width="3.5"/>
  <circle cx="37" cy="15" r="2.8" fill="white"/>
</svg>`;

// Caché a nivel de módulo — se procesa una vez por instancia de función
let _wa: string | null = null;
let _ig: string | null = null;

export async function getSocialIconSrcs(): Promise<{ wa: string | null; ig: string | null }> {
  if (_wa && _ig) return { wa: _wa, ig: _ig };
  try {
    const [waBuf, igBuf] = await Promise.all([
      sharp(Buffer.from(WA_SVG)).resize(52, 52).png().toBuffer(),
      sharp(Buffer.from(IG_SVG)).resize(52, 52).png().toBuffer(),
    ]);
    _wa = `data:image/png;base64,${waBuf.toString("base64")}`;
    _ig = `data:image/png;base64,${igBuf.toString("base64")}`;
  } catch (e) {
    // sharp sin soporte SVG (local Windows) → fallback a null, los slides muestran circles de texto
    console.warn("[social-icons] SVG→PNG falló, usando fallback:", String(e).slice(0, 120));
  }
  return { wa: _wa, ig: _ig };
}
