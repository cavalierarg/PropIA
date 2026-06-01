"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";

// Run once in Supabase dashboard:
// CREATE TABLE IF NOT EXISTS public.agent_profiles (
//   user_id TEXT PRIMARY KEY,
//   nombre_completo TEXT,
//   nombre_agencia TEXT,
//   whatsapp TEXT,
//   email TEXT,
//   instagram TEXT,
//   sitio_web TEXT,
//   zona TEXT,
//   tipos_propiedad TEXT[] DEFAULT '{}',
//   tono_voz TEXT DEFAULT 'profesional',
//   logo_url TEXT,
//   color_marca TEXT DEFAULT '#0f3460',
//   perfil_completado BOOLEAN DEFAULT FALSE,
//   updated_at TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "agent_own_profile" ON public.agent_profiles USING (true) WITH CHECK (true);

export type AgentProfile = {
  nombre_completo?: string;
  nombre_agencia?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  sitio_web?: string;
  zona?: string;
  tipos_propiedad?: string[];
  tono_voz?: string;
  logo_url?: string;
  color_marca?: string;
  perfil_completado?: boolean;
};

const schema = z.object({
  nombre_completo: z.string().max(100).optional(),
  nombre_agencia: z.string().max(100).optional(),
  whatsapp: z.string().max(30).optional(),
  email: z.string().email().optional().or(z.literal("")),
  instagram: z.string().max(100).optional(),
  sitio_web: z.string().max(200).optional(),
  zona: z.string().max(200).optional(),
  tipos_propiedad: z.array(z.string()).optional(),
  tono_voz: z.enum(["profesional", "amigable", "dinamico"]).optional(),
  logo_url: z.string().optional(),
  color_marca: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().or(z.literal("")),
});

export async function getAgentProfile(): Promise<AgentProfile> {
  const { userId } = await auth();
  if (!userId) return {};
  try {
    const supabase = createSupabaseClient();
    const { data } = await supabase
      .from("agent_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    return data ?? {};
  } catch {
    return {};
  }
}

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

export async function saveAgentProfile(
  profile: AgentProfile
): Promise<{ ok: true } | { ok: false; errors: Record<string, string[]> }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, errors: { _: ["No autenticado"] } };

  const parsed = schema.safeParse(profile);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const data = parsed.data;
  const perfil_completado = !!(data.nombre_completo?.trim() && data.whatsapp?.trim());

  try {
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("agent_profiles").upsert(
      {
        user_id: userId,
        ...data,
        perfil_completado,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) throw error;
    return { ok: true };
  } catch {
    return { ok: false, errors: { _: ["Error al guardar. Intentá de nuevo."] } };
  }
}
