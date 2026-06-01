"use server";

import sharp from "sharp";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

const BUCKET = "agent-logos";

async function removeBackground(input: Buffer): Promise<{ buffer: Buffer; success: boolean }> {
  const apiKey = process.env.REMOVEBG_API_KEY;
  if (!apiKey) {
    console.warn("[removeBackground] REMOVEBG_API_KEY no configurada — guardando original");
    return { buffer: input, success: false };
  }

  try {
    const fd = new FormData();
    fd.append("image_file", new Blob([input], { type: "image/png" }), "logo.png");
    fd.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: fd,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[removeBackground] remove.bg error:", response.status, errText);
      return { buffer: input, success: false };
    }

    const resultBuffer = Buffer.from(await response.arrayBuffer());
    return { buffer: resultBuffer, success: true };
  } catch (err) {
    console.error("[removeBackground] Error al llamar remove.bg:", err);
    return { buffer: input, success: false };
  }
}

export async function uploadAgentLogo(formData: FormData): Promise<{ url: string; bgRemoved: boolean }> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const file = formData.get("logo") as File;
  if (!file || file.size === 0) throw new Error("No file provided");
  if (file.size > 2 * 1024 * 1024) throw new Error("El archivo supera los 2 MB");

  const rawBuffer = Buffer.from(await file.arrayBuffer());

  const { buffer: processedBuffer, success: bgRemoved } = await removeBackground(rawBuffer);

  // Convertir a PNG (preserve transparency si remove.bg lo procesó; convierte el original si no)
  const outputBuffer = await sharp(processedBuffer).png().toBuffer();

  const fileName = `${userId}/logo.png`;
  const supabase = createSupabaseAdminClient();

  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, outputBuffer, { contentType: "image/png", upsert: true });

  if (error) throw new Error(`Upload fallido: ${error.message}`);

  const url = supabase.storage.from(BUCKET).getPublicUrl(fileName).data.publicUrl;
  return { url, bgRemoved };
}

export async function getAgentLogoUrl(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.storage.from(BUCKET).list(userId);
  const logo = data?.find((f) => f.name.startsWith("logo."));
  if (!logo) return null;

  return supabase.storage.from(BUCKET).getPublicUrl(`${userId}/${logo.name}`).data.publicUrl;
}
