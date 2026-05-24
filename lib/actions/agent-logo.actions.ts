"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

const BUCKET = "agent-logos";

export async function uploadAgentLogo(formData: FormData): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const file = formData.get("logo") as File;
  if (!file || file.size === 0) throw new Error("No file provided");
  if (file.size > 2 * 1024 * 1024) throw new Error("El archivo supera los 2 MB");

  const ext = file.type.includes("png") ? "png" : "jpg";
  const fileName = `${userId}/logo.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const supabase = createSupabaseAdminClient();

  // Auto-create bucket if it doesn't exist yet
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, arrayBuffer, { contentType: file.type, upsert: true });

  if (error) throw new Error(`Upload fallido: ${error.message}`);

  return supabase.storage.from(BUCKET).getPublicUrl(fileName).data.publicUrl;
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
