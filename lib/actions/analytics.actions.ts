"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";

export type FeatureName =
  | "posts"
  | "reels"
  | "calendario"
  | "descripcion"
  | "tendencias"
  | "ads"
  | "carrusel";

export async function logFeatureUsage(feature: FeatureName): Promise<void> {
  try {
    const { userId } = await auth();
    if (!userId) return;
    const supabase = createSupabaseClient();
    await supabase.from("feature_usage_log").insert({ user_id: userId, feature });
  } catch {
    // fire-and-forget — never throw
  }
}

export type AnalyticsData = {
  postsThisMonth: number;
  postsLastMonth: number;
  postsDelta: number | null;
  totalProperties: number;
  featureUsage: { feature: string; count: number }[];
  generationsRemaining: number | null;
  generationsLimit: number | null;
  planStartDate: string | null;
  plan: string;
  activityLast7Days: { date: string; count: number }[];
};

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const supabase = createSupabaseClient();

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  // 7-day window
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [usageRes, subRes, propsRes, featureRes, activityRes] = await Promise.all([
    supabase
      .from("usage")
      .select("month, count")
      .eq("user_id", userId)
      .in("month", [thisMonth, lastMonth]),
    supabase
      .from("subscriptions")
      .select("plan, status, created_at")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("feature_usage_log")
      .select("feature")
      .eq("user_id", userId),
    supabase
      .from("feature_usage_log")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", sevenDaysAgo.toISOString()),
  ]);

  const usageRows: { month: string; count: number }[] = usageRes.data ?? [];
  const postsThisMonth = usageRows.find((r) => r.month === thisMonth)?.count ?? 0;
  const postsLastMonth = usageRows.find((r) => r.month === lastMonth)?.count ?? 0;
  const postsDelta =
    postsLastMonth > 0
      ? Math.round(((postsThisMonth - postsLastMonth) / postsLastMonth) * 100)
      : null;

  const sub = subRes.data;
  const plan = sub?.plan ?? "free";
  const isPro = (plan === "pro" || plan === "pro_max") && sub?.status === "active";
  const MONTHLY_LIMIT = 5;
  const generationsRemaining = isPro ? null : Math.max(0, MONTHLY_LIMIT - postsThisMonth);
  const generationsLimit = isPro ? null : MONTHLY_LIMIT;
  const planStartDate = sub?.created_at
    ? new Date(sub.created_at).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const totalProperties = propsRes.count ?? 0;

  // Feature usage counts
  const featureRows: { feature: string }[] = featureRes.data ?? [];
  const featureCounts: Record<string, number> = {};
  for (const row of featureRows) {
    featureCounts[row.feature] = (featureCounts[row.feature] ?? 0) + 1;
  }
  const FEATURE_LABELS: Record<string, string> = {
    posts: "Generar Posts",
    reels: "Guiones Reels",
    calendario: "Calendario",
    descripcion: "Portal Inmobiliario",
    tendencias: "Tendencias",
    ads: "Generador de Ads",
    carrusel: "Carruseles IG",
  };
  const featureUsage = Object.entries(FEATURE_LABELS)
    .map(([key, label]) => ({ feature: label, count: featureCounts[key] ?? 0 }))
    .sort((a, b) => b.count - a.count);

  // Last 7 days activity
  const activityRows: { created_at: string }[] = activityRes.data ?? [];
  const dayCounts: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayCounts[key] = 0;
  }
  for (const row of activityRows) {
    const key = row.created_at.slice(0, 10);
    if (key in dayCounts) dayCounts[key]++;
  }
  const activityLast7Days = Object.entries(dayCounts).map(([date, count]) => ({
    date: new Date(date + "T12:00:00").toLocaleDateString("es-AR", {
      weekday: "short",
      day: "numeric",
    }),
    count,
  }));

  return {
    postsThisMonth,
    postsLastMonth,
    postsDelta,
    totalProperties,
    featureUsage,
    generationsRemaining,
    generationsLimit,
    planStartDate,
    plan,
    activityLast7Days,
  };
}
