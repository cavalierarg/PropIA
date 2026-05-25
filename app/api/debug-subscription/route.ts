"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return NextResponse.json({ userId, subscription: data, error });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { plan } = await req.json() as { plan: string };
  if (!["free", "pro", "pro_max"].includes(plan)) {
    return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .upsert(
      { user_id: userId, plan, status: "active", updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  return NextResponse.json({ userId, subscription: data, error });
}
