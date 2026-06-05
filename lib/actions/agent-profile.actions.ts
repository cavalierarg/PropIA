"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient, createSupabaseAdminClient } from "@/lib/supabase";

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
//   variante_espanol TEXT DEFAULT 'neutro',
//   logo_url TEXT,
//   color_marca TEXT DEFAULT '#0f3460',
//   perfil_completado BOOLEAN DEFAULT FALSE,
//   updated_at TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE public.agent_profiles ADD COLUMN IF NOT EXISTS variante_espanol TEXT DEFAULT 'neutro';
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
  variante_espanol?: "ar" | "es" | "mx" | "neutro";
  logo_url?: string;
  color_marca?: string;
  perfil_completado?: boolean;
};

const schema = z.object({
  nombre_completo: z.string().max(100).optional(),
  nombre_agencia: z.string().max(100).optional(),
  whatsapp: z.string().max(50).optional(),
  email: z.string().max(200).optional(),
  instagram: z.string().max(100).optional(),
  sitio_web: z.string().max(200).optional(),
  zona: z.string().max(200).optional(),
  tipos_propiedad: z.array(z.string()).optional(),
  tono_voz: z.enum(["profesional", "amigable", "dinamico"]).optional(),
  variante_espanol: z.enum(["ar", "es", "mx", "neutro"]).optional(),
  logo_url: z.string().optional(),
  color_marca: z.string().max(20).optional(),
});

export async function getAgentProfile(): Promise<AgentProfile> {
  const { userId } = await auth();
  if (!userId) return {};
  try {
    const supabase = createSupabaseAdminClient();
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

export async function saveAgentProfile(
  profile: AgentProfile
): Promise<{ ok: true } | { ok: false; errors: Record<string, string[]> }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, errors: { _: ["No autenticado"] } };

  const parsed = schema.safeParse(profile);
  if (!parsed.success) {
    console.error("[saveAgentProfile] Validation errors:", parsed.error.flatten());
    return { ok: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const data = parsed.data;
  const perfil_completado = !!(data.nombre_completo?.trim() && data.whatsapp?.trim());

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("agent_profiles").upsert(
      {
        user_id: userId,
        ...data,
        perfil_completado,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) {
      console.error("[saveAgentProfile] Supabase error:", error);
      throw error;
    }
    return { ok: true };
  } catch (err) {
    console.error("[saveAgentProfile] Unexpected error:", err);
    return { ok: false, errors: { _: ["Error al guardar. Intentá de nuevo."] } };
  }
}
