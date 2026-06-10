"use server";

import { unstable_noStore as noStore } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

const MONTHLY_LIMIT = 5;

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function getUsage(): Promise<{
  count: number;
  remaining: number;
  limit: number;
  isPro: boolean;
}> {
  const { userId } = await auth();
  if (!userId) return { count: 0, remaining: MONTHLY_LIMIT, limit: MONTHLY_LIMIT, isPro: false };

  const supabase = createSupabaseAdminClient();
  const month = getCurrentMonth();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  const [{ data: subData }, { data: usageData }, { count: featureCount }] = await Promise.all([
    supabase.from("subscriptions").select("plan, status").eq("user_id", userId).maybeSingle(),
    supabase.from("usage").select("count").eq("user_id", userId).eq("month", month).maybeSingle(),
    supabase
      .from("feature_usage_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart)
      .lt("created_at", nextMonthStart),
  ]);

  const isPro =
    (subData?.plan === "pro" || subData?.plan === "pro_max") && subData?.status === "active";

  if (isPro) {
    const count = featureCount ?? 0;
    return { count, remaining: -1, limit: -1, isPro: true };
  }

  const count = usageData?.count ?? 0;
  return { count, remaining: Math.max(0, MONTHLY_LIMIT - count), limit: MONTHLY_LIMIT, isPro: false };
}

/* ── Verificar límite e incrementar contador (admin client — funciona en API routes) ── */
export async function getHasEverGenerated(): Promise<boolean> {
  noStore();
  const { userId } = await auth();
  if (!userId) return false;
  const supabase = createSupabaseAdminClient();

  // Primary: feature_usage_log is inserted for ALL plans (free + pro)
  const { count: featureCount } = await supabase
    .from("feature_usage_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  console.log("[getHasEverGenerated] userId:", userId, "featureCount:", featureCount);
  if ((featureCount ?? 0) > 0) return true;

  // Fallback: usage table (free plan only — pro users skip it)
  const { count: usageCount } = await supabase
    .from("usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gt("count", 0);
  console.log("[getHasEverGenerated] usageCount:", usageCount);
  return (usageCount ?? 0) > 0;
}

export async function checkAndIncrementUsage(userId: string): Promise<{
  allowed: boolean;
  isPro: boolean;
  remaining: number;
}> {
  const supabase = createSupabaseAdminClient();
  const month = getCurrentMonth();

  const [{ data: subData }, { data: usageData }] = await Promise.all([
    supabase.from("subscriptions").select("plan, status").eq("user_id", userId).maybeSingle(),
    supabase.from("usage").select("count").eq("user_id", userId).eq("month", month).maybeSingle(),
  ]);

  const isPro =
    (subData?.plan === "pro" || subData?.plan === "pro_max") &&
    subData?.status === "active";

  if (isPro) return { allowed: true, isPro: true, remaining: -1 };

  const currentCount = usageData?.count ?? 0;

  if (currentCount >= MONTHLY_LIMIT) {
    return { allowed: false, isPro: false, remaining: 0 };
  }

  const newCount = currentCount + 1;
  await supabase
    .from("usage")
    .upsert({ user_id: userId, month, count: newCount }, { onConflict: "user_id,month" });

  return { allowed: true, isPro: false, remaining: Math.max(0, MONTHLY_LIMIT - newCount) };
}
