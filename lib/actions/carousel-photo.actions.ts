"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

const BUCKET = "carousel-photos";

export async function uploadCarouselPhoto(formData: FormData): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const file = formData.get("photo") as File;
  if (!file || file.size === 0) throw new Error("No file provided");
  if (file.size > 15 * 1024 * 1024) throw new Error("El archivo supera los 15 MB");

  const ext = file.type.includes("png") ? "png" : "jpg";
  const fileName = `${userId}/${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const supabase = createSupabaseAdminClient();

  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, arrayBuffer, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Upload fallido: ${error.message}`);

  return supabase.storage.from(BUCKET).getPublicUrl(fileName).data.publicUrl;
}
