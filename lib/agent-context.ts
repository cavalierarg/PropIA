import type { AgentProfile } from "@/lib/actions/agent-profile.actions";

export type AgentContext = {
  contextBlock: string;
  toneInstruction: string;
  profileEmpty: boolean;
};

const TONE_MAP: Record<string, string> = {
  profesional: "Lenguaje técnico y formal. Sin emojis en ningún post. Vocabulario inmobiliario preciso.",
  amigable: "Tuteo. Tono cálido y cercano. Podés usar algunos emojis con moderación.",
  dinamico: "Tono energético y directo. Usá emojis para dar ritmo al texto. Llamadas a la acción urgentes.",
};

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
