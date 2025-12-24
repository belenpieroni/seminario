// examQueries.js
import { supabase } from "../supabaseClient"

// Traer todos los exámenes de un sensei (con dojo y cantidad de inscriptos)
export async function getExamsBySensei(senseiId) {
  if (!senseiId) return []

  const { data, error } = await supabase
    .from("exam")
    .select(`
      id,
      exam_date,
      observations,
      dojo:dojo_id (name),
      location_dojo:location_dojo_id(name),
      enrollments:exam_enrollment(count)
    `)
    .eq("sensei_id", senseiId)

  if (error) {
    console.error("Error cargando exámenes:", error)
    return []
  }

  return data.map((e) => ({
    id: e.id,
    date: new Date(e.exam_date).toLocaleDateString("es-AR"),
    dojo: e.dojo?.name || "Dojo desconocido",
    enrolledCount: e.enrollments[0]?.count || 0,
    status: getExamStatus(e.exam_date),
  }))
}

// Función auxiliar para calcular estado
function getExamStatus(examDate) {
  const today = new Date()
  const date = new Date(examDate)
  if (date > today) return "próximo"
  if (date.toDateString() === today.toDateString()) return "en curso"
  return "finalizado"
}

// Traer todos los exámenes disponibles para un alumno
export async function getExamsByStudent(studentId) {
  if (!studentId) return []

  // Primero obtenemos el dojo del alumno
  const { data: studentData, error: studentError } = await supabase
    .from("student")
    .select("dojo_id")
    .eq("id", studentId)
    .single()

  if (studentError || !studentData) {
    console.error("Error obteniendo dojo del alumno:", studentError)
    return []
  }

  const dojoId = studentData.dojo_id

  // Ahora traemos los exámenes de ese dojo organizador
  const { data, error } = await supabase
    .from("exam")
    .select(`
      id,
      exam_date,
      observations,
      dojo:dojo_id (name),
      location_dojo:location_dojo_id(name),
      enrollments:exam_enrollment(count)
    `)
    .eq("dojo_id", dojoId)

  if (error) {
    console.error("Error cargando exámenes:", error)
    return []
  }

  return data.map((e) => ({
    id: e.id,
    date: new Date(e.exam_date).toLocaleDateString("es-AR"),
    organizingDojo: e.dojo?.name || "Dojo desconocido",
    locationDojo: e.location_dojo?.name || "Sede desconocida",
    enrolledCount: e.enrollments[0]?.count || 0,
    status: getExamStatus(e.exam_date),
  }))
}
