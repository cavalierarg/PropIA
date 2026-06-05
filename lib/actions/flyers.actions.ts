"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const heicConvert = require("heic-convert");

export async function uploadPropertyImage(formData: FormData): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const file = formData.get("image") as File;
  if (!file || file.size === 0) throw new Error("No file provided");

  let ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  let contentType = file.type || "image/jpeg";
  let uploadData: ArrayBuffer = await file.arrayBuffer();

  // Convert HEIC/HEIF → JPEG so Satori can render it
  const isHeic =
    ext === "heic" || ext === "heif" ||
    contentType === "image/heic" || contentType === "image/heif" ||
    contentType === "image/heic-sequence" || contentType === "image/heif-sequence";

  if (isHeic) {
    const jpegBuffer: ArrayBuffer = await heicConvert({
      buffer: Buffer.from(uploadData),
      format: "JPEG",
      quality: 0.92,
    });
    uploadData = jpegBuffer;
    ext = "jpg";
    contentType = "image/jpeg";
  }

  const fileName = `${userId}/${Date.now()}.${ext}`;
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.storage
    .from("property-images")
    .upload(fileName, uploadData, { contentType, upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from("property-images").getPublicUrl(fileName);
  return data.publicUrl;
}
