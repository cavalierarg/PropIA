"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";

export async function getUserPlan(): Promise<"free" | "pro"> {
  const { userId } = await auth();
  if (!userId) return "free";

  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (data?.plan === "pro" && data?.status === "active") return "pro";
  return "free";
}
