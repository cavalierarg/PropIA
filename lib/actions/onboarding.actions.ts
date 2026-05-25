"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";

export type OnboardingStatus = {
  completed: boolean;
  steps: Record<string, boolean>;
};

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  const { userId } = await auth();
  if (!userId) return { completed: true, steps: {} };

  try {
    const supabase = createSupabaseClient();
    const { data } = await supabase
      .from("agent_profiles")
      .select("onboarding_completed, onboarding_steps")
      .eq("user_id", userId)
      .maybeSingle();

    return {
      completed: data?.onboarding_completed ?? false,
      steps: (data?.onboarding_steps as Record<string, boolean>) ?? {},
    };
  } catch {
    return { completed: false, steps: {} };
  }
}

export async function completeOnboarding(): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  const supabase = createSupabaseClient();
  await supabase.from("agent_profiles").upsert(
    { user_id: userId, onboarding_completed: true, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
}

export async function updateOnboardingStep(step: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  const supabase = createSupabaseClient();

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
