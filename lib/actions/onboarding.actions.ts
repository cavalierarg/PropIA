"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase";

export type OnboardingStatus = {
  completed: boolean;
  steps: Record<string, boolean>;
};

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  const { userId } = await auth();
  if (!userId) return { completed: true, steps: {} };

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("agent_profiles")
      .select("onboarding_completed, onboarding_steps")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[onboarding] getOnboardingStatus error:", error.message);
    }

    console.log(`[onboarding] getOnboardingStatus user=${userId} completed=${data?.onboarding_completed ?? null}`);

    return {
      completed: data?.onboarding_completed ?? false,
      steps: (data?.onboarding_steps as Record<string, boolean>) ?? {},
    };
  } catch (e) {
    console.error("[onboarding] getOnboardingStatus exception:", e);
    return { completed: false, steps: {} };
  }
}

export async function completeOnboarding(): Promise<void> {
  const { userId } = await auth();
  if (!userId) {
    console.error("[onboarding] completeOnboarding: no userId");
    return;
  }

  console.log(`[onboarding] completeOnboarding START user=${userId}`);

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("agent_profiles").upsert(
    { user_id: userId, onboarding_completed: true, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("[onboarding] completeOnboarding upsert error:", error.message, error.code);
    return;
  }

  console.log(`[onboarding] completeOnboarding OK user=${userId}`);
  revalidatePath("/", "layout");
}

export async function updateOnboardingStep(step: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  const supabase = createSupabaseAdminClient();

  const { data } = await supabase
    .from("agent_profiles")
    .select("onboarding_steps")
    .eq("user_id", userId)
    .maybeSingle();

  const current = (data?.onboarding_steps as Record<string, boolean>) ?? {};
  if (current[step]) return;

  await supabase.from("agent_profiles").upsert(
    {
      user_id: userId,
      onboarding_steps: { ...current, [step]: true },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}
