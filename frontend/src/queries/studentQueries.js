// studentQueries.js
import { supabase } from "../supabaseClient";

// Traer todos los alumnos activos de un dojo
export async function getStudentsByDojo(dojo_id) {
  console.log("Buscando alumnos del dojo:", dojo_id);

  const { data, error } = await supabase
    .from("student")
    .select("id, full_name, birth_date, current_belt, registered_at, is_active")
    .eq("dojo_id", dojo_id)
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Error al traer students del dojo:", error.message, error.details);
    return [];
  }

  return data;
}

// Traer un alumno por ID
export async function getStudentById(id) {
  const { data, error } = await supabase
    .from("student")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error al traer student por ID:", error);
    return null;
  }

  return data;
}

// Actualizar datos de un alumno
export async function updateStudent(id, updates) {
  const { data, error } = await supabase
    .from("student")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar student:", error);
    throw error;
  }

  return data;
}

// Registrar un nuevo examen para un alumno 
export async function addExamToStudent(student_id, exam) {
  const { data, error } = await supabase
    .from("exam_student")
    .insert({
      student_id,
      date: exam.date,
      belt: exam.belt,
    })
    .select()
    .single();

  if (error) {
    console.error("Error al registrar examen:", error);
    throw error;
  }

  return data;
}

//Actualizar cinturón del alumno con logs
export async function updateStudentBelt(studentId, newBelt) {
  console.log("🔧 updateStudentBelt() llamado")
  console.log("➡️ Parámetros recibidos:", { studentId, newBelt })

  const { data, error } = await supabase
    .from("student")
    .update({ current_belt: newBelt })
    .eq("id", studentId)
    .select("id, full_name, current_belt") // devuelve la fila actualizada

  if (error) {
    console.error("❌ Error actualizando cinturón:", error.message)
    throw error
  }

  if (!data || data.length === 0) {
    console.warn("⚠️ No se encontró ningún alumno con ese ID. Verifica studentId.")
    return null
  }

  console.log("✅ Update ejecutado correctamente")
  console.log("📄 Fila actualizada:", data)

  return data
}
