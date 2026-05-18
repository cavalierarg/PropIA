"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";

type Post = {
  red: "Instagram" | "Facebook" | "LinkedIn";
  contenido: string;
};

type Recomendacion = { indice: number; razon: string };

type Recomendaciones = {
  mayor_engagement: Recomendacion;
  mayor_consultas: Recomendacion;
  inversores: Recomendacion;
};

export type SavedProperty = {
  id: string;
  user_id: string;
  tipo_propiedad: string;
  ubicacion: string;
  metros_cuadrados: string;
  precio: string;
  caracteristica1: string;
  caracteristica2: string;
  caracteristica3: string;
  posts: Post[];
  recomendaciones: Recomendaciones | null;
  created_at: string;
};

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

  const supabase = createSupabaseClient();
  const { error } = await supabase.from("properties").insert([{ user_id: userId, ...data }]);

  if (error) {
    console.error("[properties.actions] Error al guardar propiedad:", error);
  }
}

export async function getUserProperties(): Promise<SavedProperty[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = createSupabaseClient();
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

export async function getProperty(id: string): Promise<SavedProperty | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data as SavedProperty;
}
