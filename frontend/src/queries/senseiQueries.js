import { supabase } from "../supabaseClient";

// Traer solo los senseis a cargo con dojo relacionado
export async function getHeadSenseis() {
  const { data, error } = await supabase
    .from("sensei")
    .select(`
      id,
      full_name,
      dan_grade,
      is_head,
      registered_at,
      is_active,
      dojo:dojo_id (
        id,
        name,
        is_active
      )
    `)
    .eq("is_head", true)
    .eq("is_active", true) 
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Error al traer senseis a cargo:", error);
    return [];
  }
  return (data || []).filter(s => s.dojo?.is_active);
}

// Traer los senseis de un dojo (excepto a cargo)
export async function getSenseisByDojo(dojo_id) {
  const { data, error } = await supabase
    .from("sensei")
    .select("id, full_name, dan_grade, registered_at, is_active, is_head")
    .eq("dojo_id", dojo_id)
    .eq("is_head", false)
    .eq("is_active", true) 
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Error al traer senseis del dojo:", error);
    return [];
  }

  return data;
}

export async function getSenseiById(id) {
  const { data, error } = await supabase
    .from("sensei")
    .select("*")
    .eq("id", id)
    .eq("is_active", true) 
    .single();

  if (error) {
    console.error("Error al traer sensei por ID:", error);
    return null;
  }

  return data;
}

export async function updateSensei(id, updates) {
  const { data, error } = await supabase
    .from("sensei")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar sensei:", error);
    throw error;
  }

  return data;
}
