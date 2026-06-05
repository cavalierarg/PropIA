export type Theme =
  | "dark"
  | "light"
  | "premium"
  | "sunset"
  | "ocean"
  | "forest"
  | "urban";

export interface TC {
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
  isLight: boolean;  // true = fondo claro, usar texto oscuro y botones oscuros
  accent: string;
  btnText: string;
}

export function hexRgba(hex: string, alpha: number): string {
  const c = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(c.slice(0, 2), 16) || 0;
  const g = parseInt(c.slice(2, 4), 16) || 0;
  const b = parseInt(c.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function buildTheme(theme: Theme, agentAccent = "#00c9c9"): TC {
  switch (theme) {
    case "light": return {
      bgStyle: "#FFFFFF",
      bg: "#FFFFFF", bgGrad: "#F0F4F8",
      text: "#1a1a2e", textSub: "#666666",
      overlay: "rgba(255,255,255,0.88)",
      cellBg: hexRgba(agentAccent, 0.14),
      cellBorder: hexRgba(agentAccent, 0.42),
      fborder: "#e2e8f0", ftext: "#94a3b8",
      dark: false, isLight: true, accent: agentAccent, btnText: "#1a1a2e",
    };
    case "premium": return {
      bgStyle: "#000000",
      bg: "#000000", bgGrad: "#0d0d0d",
      text: "#ffffff", textSub: "rgba(255,255,255,0.55)",
      overlay: "rgba(0,0,0,0.84)",
      cellBg: "rgba(255,255,255,0.05)",
      cellBorder: hexRgba("#C9A84C", 0.30),
      fborder: "rgba(255,255,255,0.10)", ftext: "rgba(255,255,255,0.25)",
      dark: true, isLight: false, accent: "#C9A84C", btnText: "#000000",
    };
    case "sunset": return {
      bgStyle: "linear-gradient(135deg, #FF6B35 0%, #F7C59F 100%)",
      bg: "#FF6B35", bgGrad: "#F7C59F",
      text: "#2D2D2D", textSub: "rgba(45,45,45,0.65)",
      overlay: "rgba(255,107,53,0.88)",
      cellBg: "rgba(255,255,255,0.85)",
      cellBorder: "rgba(45,45,45,0.15)",
      fborder: "rgba(45,45,45,0.18)", ftext: "rgba(45,45,45,0.55)",
      dark: false, isLight: true, accent: "#FF6B35", btnText: "#2D2D2D",
    };
    case "ocean": return {
      bgStyle: "linear-gradient(135deg, #0077B6 0%, #00B4D8 60%, #90E0EF 100%)",
      bg: "#0077B6", bgGrad: "#00B4D8",
      text: "#1a1a2e", textSub: "rgba(26,26,46,0.65)",
      overlay: "rgba(0,119,182,0.82)",
      cellBg: "rgba(255,255,255,0.85)",
      cellBorder: "rgba(26,26,46,0.18)",
      fborder: "rgba(26,26,46,0.18)", ftext: "rgba(26,26,46,0.55)",
      dark: false, isLight: true, accent: "#00B4D8", btnText: "#0077B6",
    };
    case "forest": return {
      bgStyle: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #52B788 100%)",
      bg: "#1B4332", bgGrad: "#2D6A4F",
      text: "#ffffff", textSub: "rgba(255,255,255,0.65)",
      overlay: "rgba(27,67,50,0.84)",
      cellBg: "rgba(255,255,255,0.07)",
      cellBorder: hexRgba("#52B788", 0.35),
      fborder: "rgba(255,255,255,0.12)", ftext: "rgba(255,255,255,0.32)",
      dark: true, isLight: false, accent: "#52B788", btnText: "#1B4332",
    };
    case "urban": return {
      bgStyle: "linear-gradient(135deg, #2D3436 0%, #636E72 100%)",
      bg: "#2D3436", bgGrad: "#636E72",
      text: "#ffffff", textSub: "#B2BEC3",
      overlay: "rgba(45,52,54,0.84)",
      cellBg: "rgba(255,255,255,0.06)",
      cellBorder: "rgba(255,255,255,0.22)",
      fborder: "rgba(255,255,255,0.12)", ftext: "#B2BEC3",
      dark: true, isLight: false, accent: "#FFFFFF", btnText: "#2D3436",
    };
    default: // "dark"
      return {
        bgStyle: "linear-gradient(135deg, #0a1628 0%, #0f3460 100%)",
        bg: "#0a1628", bgGrad: "#0f3460",
        text: "#ffffff", textSub: "rgba(255,255,255,0.60)",
        overlay: "rgba(10,22,40,0.80)",
        cellBg: "rgba(255,255,255,0.07)",
        cellBorder: hexRgba(agentAccent, 0.22),
        fborder: "rgba(255,255,255,0.10)", ftext: "rgba(255,255,255,0.28)",
        dark: true, isLight: false, accent: agentAccent, btnText: "#0a1628",
      };
  }
}

// Presets for UI selectors (components)
export const THEME_PRESETS: {
  id: Theme;
  label: string;
  bg: string;
  accent: string;
  text: string;
  previewBorder?: string;
}[] = [
  { id: "dark",    label: "Moderno oscuro",   bg: "linear-gradient(135deg, #0a1628 0%, #0f3460 100%)", accent: "#00c9c9", text: "#ffffff" },
  { id: "light",   label: "Minimalista claro", bg: "#FFFFFF", accent: "#00c9c9", text: "#1a1a2e", previewBorder: "1px solid #e2e8f0" },
  { id: "premium", label: "Premium negro",     bg: "#000000", accent: "#C9A84C", text: "#ffffff" },
  { id: "sunset",  label: "Atardecer",         bg: "linear-gradient(135deg, #FF6B35 0%, #F7C59F 100%)", accent: "#FF6B35", text: "#2D2D2D" },
  { id: "ocean",   label: "Mar y arena",       bg: "linear-gradient(135deg, #0077B6 0%, #90E0EF 100%)", accent: "#00B4D8", text: "#ffffff" },
  { id: "forest",  label: "Bosque",            bg: "linear-gradient(135deg, #1B4332 0%, #52B788 100%)", accent: "#52B788", text: "#ffffff" },
  { id: "urban",   label: "Urbano gris",       bg: "linear-gradient(135deg, #2D3436 0%, #636E72 100%)", accent: "#FFFFFF", text: "#ffffff" },
];
