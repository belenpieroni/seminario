// dojoQueries.js
import { supabase } from '../supabaseClient';

export async function getDojos() {
  // Traer los dojos activos
  const { data: dojos, error } = await supabase
    .from("dojo")
    .select("id, name, head_sensei_id")
    .eq("is_active", true);

  if (error) {
    console.error("Error al obtener los dojos:", error);
    return [];
  }

  const enriched = await Promise.all(
    dojos.map(async (dojo) => {
      // Sensei a cargo
      let senseiInCharge = "Sin asignar";
      if (dojo.head_sensei_id) {
        const { data: head } = await supabase
          .from("sensei")
          .select("full_name")
          .eq("id", dojo.head_sensei_id)
          .single();
        if (head) senseiInCharge = head.full_name;
      }

      // Total alumnos activos
      const { count: studentsCount } = await supabase
        .from("student")
        .select("*", { count: "exact", head: true })
        .eq("dojo_id", dojo.id)
        .eq("is_active", true);

      // Total senseis
      const { count: senseisCount } = await supabase
        .from("sensei")
        .select("*", { count: "exact", head: true })
        .eq("dojo_id", dojo.id)
        .eq("is_active", true);

      return {
        ...dojo,
        senseiInCharge,
        totalStudents: studentsCount || 0,
        totalSenseis: senseisCount || 0,
      };
    })
  );

  return enriched;
}

export async function getDojoById(dojoId) {
  const { data, error } = await supabase
    .from("dojo")
    .select("id, name, address, city, province, phone, head_sensei_id")
    .eq("id", dojoId)
    .single();

  if (error) {
    console.error("Error al obtener dojo:", error);
    return null;
  }

  // Sensei a cargo
  let senseiInCharge = "Sin asignar";
  if (data.head_sensei_id) {
    const { data: head } = await supabase
      .from("sensei")
      .select("full_name")
      .eq("id", data.head_sensei_id)
      .single();
    if (head) senseiInCharge = head.full_name;
  }

  // Total alumnos activos
  const { count: studentsCount } = await supabase
    .from("student")
    .select("*", { count: "exact", head: true })
    .eq("dojo_id", dojoId)
    .eq("is_active", true);

  // Total senseis
  const { count: senseisCount } = await supabase
    .from("sensei")
    .select("*", { count: "exact", head: true })
    .eq("dojo_id", dojoId);

  return {
    ...data,
    senseiInCharge,
    totalStudents: studentsCount || 0,
    totalSenseis: senseisCount || 0,
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

// Traer notificaciones del dojo
export async function getDojoNotifications(dojoId) {
  const { data, error } = await supabase
    .from("notification")
    .select(`
      id,
      title,
      body,
      created_at,
      attachments,
      sender:sensei!notification_sender_id_fkey(full_name)
    `)
    .eq("dojo_id", dojoId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching notifications:", error.message)
    return []
  }
  return data || []
}
