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

  const { data } = supabase.storage
    .from("property-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
