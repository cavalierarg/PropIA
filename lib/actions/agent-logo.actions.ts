"use server";

import sharp from "sharp";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

const BUCKET = "agent-logos";

async function removeLogoBackground(input: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8ClampedArray(data.buffer);
  const { width, height } = info;

  // Sample 4 corners to detect background color
  const corners = [
    [0, 0], [width - 1, 0],
    [0, height - 1], [width - 1, height - 1],
  ] as const;

  let sumR = 0, sumG = 0, sumB = 0;
  for (const [x, y] of corners) {
    const i = (y * width + x) * 4;
    sumR += pixels[i]; sumG += pixels[i + 1]; sumB += pixels[i + 2];
  }
  const bgR = Math.round(sumR / 4);
  const bgG = Math.round(sumG / 4);
  const bgB = Math.round(sumB / 4);

  // Make pixels within threshold of background color fully transparent
  const threshold = 30;
  for (let i = 0; i < pixels.length; i += 4) {
    if (
      Math.abs(pixels[i]     - bgR) < threshold &&
      Math.abs(pixels[i + 1] - bgG) < threshold &&
      Math.abs(pixels[i + 2] - bgB) < threshold
    ) {
      pixels[i + 3] = 0;
    }
  }

  return sharp(Buffer.from(pixels.buffer), {
    raw: { width, height, channels: 4 },
  }).png().toBuffer();
}

export async function uploadAgentLogo(formData: FormData): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const file = formData.get("logo") as File;
  if (!file || file.size === 0) throw new Error("No file provided");
  if (file.size > 2 * 1024 * 1024) throw new Error("El archivo supera los 2 MB");

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const processedBuffer = await removeLogoBackground(rawBuffer);

  // Always save as PNG to preserve transparency
  const fileName = `${userId}/logo.png`;
  const supabase = createSupabaseAdminClient();

  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, processedBuffer, { contentType: "image/png", upsert: true });

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
