import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase";

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? "";
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (webhookSecret && signature) {
    if (!verifySignature(rawBody, signature, webhookSecret)) {
      console.error("[webhook] Firma inválida");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const meta = event?.meta as Record<string, unknown> | undefined;
  const eventName = meta?.event_name as string | undefined;
  const customData = meta?.custom_data as Record<string, unknown> | undefined;
  const userId = customData?.user_id as string | undefined;
  const planCustom = customData?.plan as string | undefined;

  console.log("[webhook] Evento recibido:", eventName, "| user_id:", userId, "| plan:", planCustom);

  if (!userId) {
    console.warn("[webhook] Sin user_id en custom_data, ignorando");
    return NextResponse.json({ received: true });
  }

  const plan = planCustom === "pro_max" ? "pro_max" : "pro";

  const supabase = createSupabaseAdminClient();

  if (eventName === "order_created" || eventName === "subscription_created") {
    const { error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          plan,
          status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("[webhook] Error al guardar suscripción:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    console.log("[webhook] Usuario", userId, "actualizado a", plan.toUpperCase());
  } else if (
    eventName === "subscription_cancelled" ||
    eventName === "subscription_expired" ||
    eventName === "subscription_paused"
  ) {
    await supabase
      .from("subscriptions")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    console.log("[webhook] Suscripción de", userId, "cancelada/expirada");
  }

  return NextResponse.json({ received: true });
}
