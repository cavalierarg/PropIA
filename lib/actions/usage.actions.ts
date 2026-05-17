"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";

const MONTHLY_LIMIT = 10;

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function getUsage(): Promise<{ count: number; remaining: number; limit: number }> {
  const { userId } = await auth();
  if (!userId) return { count: 0, remaining: MONTHLY_LIMIT, limit: MONTHLY_LIMIT };

  const supabase = createSupabaseClient();

  const { data } = await supabase
    .from("usage")
    .select("count")
    .eq("user_id", userId)
    .eq("month", getCurrentMonth())
    .maybeSingle();

  const count = data?.count ?? 0;
  return { count, remaining: Math.max(0, MONTHLY_LIMIT - count), limit: MONTHLY_LIMIT };
}
