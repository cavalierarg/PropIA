import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { getUserPlan } from "@/lib/actions/subscription.actions";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "not authenticated" }, { status: 401 });

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const planFromFunction = await getUserPlan();

  return NextResponse.json({
    userId,
    data,
    error,
    planFromFunction,
    serviceRoleKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}
