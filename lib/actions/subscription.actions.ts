"use server";

import { unstable_noStore as noStore } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

export async function getUserPlan(): Promise<"free" | "pro" | "pro_max"> {
  noStore();
  const { userId } = await auth();
  if (!userId) return "free";

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (data?.status === "active") {
    if (data.plan === "pro_max") return "pro_max";
    if (data.plan === "pro") return "pro";
  }
  return "free";
}
