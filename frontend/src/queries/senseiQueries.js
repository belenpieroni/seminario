// senseiQueries.js
import { supabase } from '../supabaseClient';

// Traer solo los senseis a cargo con dojo relacionado
export async function getHeadSenseis() {
  const { data, error } = await supabase
    .from('sensei')
    .select(`
      id,
      full_name,
      dan_grade,
      is_head,
      registered_at,
      dojo:dojo_id (
        id,
        name
      )
    `)
    .eq('is_head', true)  // solo los a cargo
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error al traer senseis a cargo:', error);
    return [];
  }
  console.log('Senseis fetch:', data);
  return data;
}

// Traer los senseis de un dojo (excepto a cargo)
export async function getSenseisByDojo(dojo_id) {
  const { data, error } = await supabase
    .from('sensei')
    .select('id, full_name, dan_grade, registered_at')
    .eq('dojo_id', dojo_id)
    .eq('is_head', false)
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error al traer senseis del dojo:', error);
    return [];
  }
  
  return data;
}
