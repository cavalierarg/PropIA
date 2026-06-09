"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient, createSupabaseAdminClient } from "@/lib/supabase";

export type UserProfile = {
  whatsapp?: string;
  instagram?: string;
  sitio_web?: string;
};

// Required SQL (run once in Supabase dashboard):
// CREATE TABLE IF NOT EXISTS public.user_profiles (
//   user_id TEXT PRIMARY KEY,
//   whatsapp TEXT,
//   instagram TEXT,
//   sitio_web TEXT,
//   updated_at TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "own_profile" ON public.user_profiles USING (true) WITH CHECK (true);

export async function getUserProfile(): Promise<UserProfile> {
  const { userId } = await auth();
  if (!userId) return {};
  try {
    const supabase = createSupabaseClient();
    // agent_profiles is the source of truth — fall back to user_profiles
    const { data: agentData } = await supabase
      .from("agent_profiles")
      .select("whatsapp, instagram, sitio_web")
      .eq("user_id", userId)
      .maybeSingle();
    if (agentData?.whatsapp || agentData?.instagram || agentData?.sitio_web) {
      return agentData;
    }
    const { data } = await supabase
      .from("user_profiles")
      .select("whatsapp, instagram, sitio_web")
      .eq("user_id", userId)
      .maybeSingle();
    return data ?? {};
  } catch {
    return {};
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "No autenticado" };
  try {
    const supabase = createSupabaseAdminClient();
    await supabase
      .from("user_profiles")
      .upsert(
        { user_id: userId, ...profile, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    return { success: true };
  } catch (error) {
    console.error("Error guardando user_profile:", error);
    return { success: false, error: "No se pudo guardar" };
  }
}
