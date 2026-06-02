"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

type Post = { red: "Instagram" | "Facebook" | "LinkedIn"; contenido: string };
type Recomendacion = { indice: number; razon: string };
type Recomendaciones = {
  mayor_engagement: Recomendacion;
  mayor_consultas: Recomendacion;
  inversores: Recomendacion;
};

export type PropertyEstado = "disponible" | "reservada" | "vendida" | "alquilada";

export type SavedProperty = {
  id: string;
  user_id: string;
  tipo_propiedad: string;
  titulo: string;
  ubicacion: string;
  barrio: string;
  ciudad: string;
  metros_cuadrados: string;
  precio: string;
  moneda: string;
  ambientes: string;
  caracteristica1: string;
  caracteristica2: string;
  caracteristica3: string;
  amenities: string[];
  descripcion_libre: string;
  foto_urls: string[];
  posts: Post[];
  recomendaciones: Recomendaciones | null;
  created_at: string;
  estado: PropertyEstado | null;
};

export type PropertyManualData = {
  tipo_propiedad: string;
  titulo?: string;
  ubicacion: string;
  barrio?: string;
  ciudad?: string;
  precio: string;
  moneda?: string;
  metros_cuadrados: string;
  ambientes?: string;
  caracteristica1?: string;
  caracteristica2?: string;
  caracteristica3?: string;
  amenities?: string[];
  descripcion_libre?: string;
  estado?: PropertyEstado;
  foto_urls?: string[];
};

/* ── Guardar desde herramientas (con posts generados) ── */
export async function saveProperty(data: {
  tipo_propiedad: string;
  ubicacion: string;
  metros_cuadrados: string;
  precio: string;
  caracteristica1: string;
  caracteristica2: string;
  caracteristica3: string;
  posts: Post[];
  recomendaciones: Recomendaciones;
}): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("properties").insert([{ user_id: userId, ...data }]);
  if (error) console.error("[properties.actions] Error al guardar:", error);
}

/* ── Guardar manualmente desde la biblioteca ── */
export async function savePropertyManual(
  data: PropertyManualData
): Promise<{ ok: boolean; id?: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false };

  const supabase = createSupabaseAdminClient();
  const { data: inserted, error } = await supabase
    .from("properties")
    .insert([{ user_id: userId, posts: [], recomendaciones: null, ...data }])
    .select("id")
    .single();

  if (error) {
    console.error("[properties.actions] Error al guardar manual:", error);
    return { ok: false };
  }
  return { ok: true, id: inserted.id };
}

/* ── Editar una propiedad existente ── */
export async function updateProperty(
  id: string,
  data: Partial<PropertyManualData>
): Promise<{ ok: boolean }> {
  const { userId } = await auth();
  if (!userId) return { ok: false };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("properties")
    .update(data)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("[properties.actions] Error al actualizar:", error);
    return { ok: false };
  }
  return { ok: true };
}

/* ── Obtener todas las propiedades del usuario ── */
export async function getUserProperties(): Promise<SavedProperty[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[properties.actions] Error al obtener propiedades:", error);
    return [];
  }
  return (data ?? []) as SavedProperty[];
}

/* ── Eliminar una propiedad ── */
export async function deleteProperty(id: string): Promise<{ ok: boolean }> {
  const { userId } = await auth();
  if (!userId) return { ok: false };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) console.error("[properties.actions] Error al eliminar:", error);
  return { ok: !error };
}

/* ── Cambiar estado ── */
export async function updatePropertyStatus(
  id: string,
  estado: PropertyEstado
): Promise<{ ok: boolean }> {
  const { userId } = await auth();
  if (!userId) return { ok: false };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("properties")
    .update({ estado })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) console.error("[properties.actions] Error al actualizar estado:", error);
  return { ok: !error };
}

/* ── Obtener una propiedad por ID ── */
export async function getProperty(id: string): Promise<SavedProperty | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data as SavedProperty;
}
