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
    `)
    .eq("is_active", true);

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

export async function getDojoById(dojoId) {
  const { data, error } = await supabase
    .from("dojo")
    .select(`
      id,
      name,
      address,
      city,
      province,
      phone,
      sensei:head_sensei_id(full_name)
    `)
    .eq("id", dojoId)
    .single();

  if (error) {
    console.error("Error al obtener dojo:", error);
    return null;
  }

  return {
    ...data,
    senseiInCharge: data.sensei ? data.sensei.full_name : "Sin asignar",
  };
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

export async function updateDojo(dojoId, updates) {
  const { error } = await supabase
    .from("dojo")
    .update({
      name: updates.name,
      address: updates.address,
      city: updates.city,
      province: updates.province,
      phone: updates.phone,
    })
    .eq("id", dojoId);

  if (error) {
    console.error("Error al actualizar dojo:", error);
    throw error;
  }
}

export async function updateDojoField(dojoId, field, value) {
  const { error } = await supabase
    .from("dojo")
    .update({ [field]: value })
    .eq("id", dojoId);

  if (error) {
    console.error("Error actualizando dojo:", error);
    throw error;
  }
}

export async function deleteDojo(dojoId) {
  // 1️⃣ Obtener el sensei a cargo
  const { data: dojo, error: dojoError } = await supabase
    .from("dojo")
    .select("head_sensei_id")
    .eq("id", dojoId)
    .single();

  if (dojoError) throw dojoError;

  // 2️⃣ Quitar rol de head sensei
  if (dojo.head_sensei_id) {
    await supabase
      .from("sensei")
      .update({
        is_head: false,
        dojo_id: null
      })
      .eq("id", dojo.head_sensei_id);
  }

  // 3️⃣ Soft delete del dojo
  const { error } = await supabase
    .from("dojo")
    .update({ is_active: false })
    .eq("id", dojoId);

  if (error) throw error;
}

