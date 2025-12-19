// studentQueries.js
import { supabase } from '../supabaseClient';

// Traer los students de un dojo 
export async function getStudentsByDojo(dojo_id) {
  const { data, error } = await supabase
    .from('student')
    .select('id, full_name, birth_date, current_belt, registered_at')
    .eq('dojo_id', dojo_id)
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error al traer students del dojo:', error);
    return [];
  }
  
  return data;
}

export async function getStudentById(id) {
  const { data } = await supabase
    .from("student")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function updateStudent(id, updates) {
  const { data, error } = await supabase
    .from("student")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
