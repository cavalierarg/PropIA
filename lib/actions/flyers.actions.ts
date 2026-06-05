"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

export async function uploadPropertyImage(formData: FormData): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const file = formData.get("image") as File;
  if (!file || file.size === 0) throw new Error("No file provided");

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const fileName = `${userId}/${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.storage
    .from("property-images")
    .upload(fileName, arrayBuffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // Use Supabase image render endpoint — converts HEIC/PNG/WebP to JPEG
  // and resizes to 1200px max (required for Satori/ImageResponse compatibility)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/render/image/public/property-images/${fileName}?width=1200&quality=85`;
}
