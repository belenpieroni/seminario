// dojoQueries.js
import { supabase } from '../supabaseClient';

export async function getDojos() {
  const { data, error } = await supabase
    .from('dojo')
    .select(`
      id,
      name,
      head_sensei_id,
      sensei:head_sensei_id(full_name)
    `);

  if (error) {
    console.error('Error al obtener los dojos:', error);
    return [];
  }

  return data.map(dojo => ({
    ...dojo,
    senseiInCharge: dojo.sensei ? dojo.sensei.full_name : 'Sin asignar',
    totalStudents: dojo.total_students ? dojo.total_students.length : 0,
    totalSenseis: dojo.total_senseis ? dojo.total_senseis.length : 0
  }));
}

export async function createDojo(payload) {
  const { dojo, sensei } = payload;

  // Crear dojo
  const { data: dojoCreated, error: dojoError } = await supabase
    .from("dojo")
    .insert({
      name: dojo.name,
      address: dojo.address,
      city: dojo.locality,
      province: dojo.province,
      phone: dojo.phone,
    })
    .select()
    .single();

  if (dojoError) throw dojoError;

  // Crear sensei
  const { data: senseiCreated, error: senseiError } = await supabase
    .from("sensei")
    .insert({
      full_name: sensei.full_name,
      dan_grade: sensei.rank,
      dojo_id: dojoCreated.id,
      is_head: true,
    })
    .select()
    .single();

  if (senseiError) {
    await supabase.from("dojo").delete().eq("id", dojoCreated.id);
    throw senseiError;
  }

  // Asociar sensei a cargo del dojo
  const { error: updateError } = await supabase
    .from("dojo")
    .update({ head_sensei_id: senseiCreated.id })
    .eq("id", dojoCreated.id);

  if (updateError) throw updateError;

  return {
    dojo: dojoCreated,
    sensei: senseiCreated,
  };
}
