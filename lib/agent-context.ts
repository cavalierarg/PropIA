import type { AgentProfile } from "@/lib/actions/agent-profile.actions";

export type AgentContext = {
  contextBlock: string;
  toneInstruction: string;
  profileEmpty: boolean;
};

export type VarianteEspanol = "ar" | "es" | "mx" | "neutro";

const TONE_MAP: Record<string, string> = {
  profesional: "Lenguaje técnico y formal. Sin emojis en ningún post. Vocabulario inmobiliario preciso.",
  amigable: "Tuteo. Tono cálido y cercano. Podés usar algunos emojis con moderación.",
  dinamico: "Tono energético y directo. Usá emojis para dar ritmo al texto. Llamadas a la acción urgentes.",
};

const VARIANT_MAP: Record<VarianteEspanol, string> = {
  ar: "Usá voseo rioplatense (vos tenés, vos podés). Terminología argentina: departamento, cochera, pileta, quincho, expensas, inmobiliaria, seña, escritura, CABA, GBA. Tono: directo y cercano, rioplatense.",
  es: "Usa tuteo peninsular (tú tienes, tú puedes). Terminología española: piso, garaje, piscina, comunidad de vecinos, hipoteca, notaría, IVA, plusvalía. Tono: formal pero cercano, peninsular.",
  mx: "Usa tuteo o usted según el contexto. Terminología mexicana: departamento, estacionamiento, alberca, cuota de mantenimiento, escrituración, CDMX. Tono: cálido y profesional, mexicano.",
  neutro: "Usa español neutro sin regionalismos. Terminología universal: apartamento/departamento, estacionamiento, piscina. Tono: profesional y claro, válido para cualquier hispanohablante.",
};

const AR_ZONES = [
  "argentina", "buenos aires", "caba", "gba", "córdoba", "rosario", "mendoza",
  "palermo", "recoleta", "belgrano", "san telmo", "villa crespo", "caballito",
  "microcentro", "barrio norte", "nuñez", "balvanera", "almagro", "flores",
  "tigre", "quilmes", "san isidro", "bariloche", "tucumán", "salta", "neuquén",
  "mar del plata", "lomas de zamora", "vicente lópez",
];

const ES_ZONES = [
  "españa", "madrid", "barcelona", "valencia", "sevilla", "bilbao", "málaga",
  "zaragoza", "murcia", "alicante", "vigo", "granada", "vitoria", "coruña",
  "valladolid", "palma", "cádiz", "burgos", "salamanca", "toledo",
];

const MX_ZONES = [
  "mexico", "méxico", "cdmx", "ciudad de méxico", "guadalajara", "monterrey",
  "puebla", "cancún", "tijuana", "mérida", "querétaro", "aguascalientes",
  "hermosillo", "chihuahua", "saltillo", "morelia", "veracruz", "oaxaca",
  "san luis potosí",
];

export function detectVariante(zona?: string): VarianteEspanol {
  if (!zona) return "neutro";
  const z = zona.toLowerCase();
  if (AR_ZONES.some((c) => z.includes(c))) return "ar";
  if (ES_ZONES.some((c) => z.includes(c))) return "es";
  if (MX_ZONES.some((c) => z.includes(c))) return "mx";
  return "neutro";
}

export function getVariantInstruction(variante: VarianteEspanol): string {
  return VARIANT_MAP[variante] ?? VARIANT_MAP.neutro;
}

export function buildAgentContext(profile: AgentProfile): AgentContext {
  const lines: string[] = [];
  if (profile.nombre_completo) lines.push(`- Nombre: ${profile.nombre_completo}`);
  if (profile.nombre_agencia) lines.push(`- Agencia: ${profile.nombre_agencia}`);
  if (profile.zona) lines.push(`- Zona de trabajo: ${profile.zona}`);
  if (profile.tipos_propiedad?.length)
    lines.push(`- Tipos de propiedad: ${profile.tipos_propiedad.join(", ")}`);
  if (profile.whatsapp) lines.push(`- WhatsApp: ${profile.whatsapp}`);
  if (profile.instagram)
    lines.push(`- Instagram: @${profile.instagram.replace(/^@/, "")}`);
  if (profile.sitio_web) lines.push(`- Sitio web: ${profile.sitio_web}`);

  const profileEmpty = lines.length === 0;
  const contextBlock = profileEmpty ? "" : `DATOS DEL AGENTE:\n${lines.join("\n")}`;
  const toneInstruction =
    TONE_MAP[profile.tono_voz ?? "profesional"] ?? TONE_MAP.profesional;

  return { contextBlock, toneInstruction, profileEmpty };
}
