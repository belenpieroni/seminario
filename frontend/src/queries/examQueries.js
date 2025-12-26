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

// examQueries.js
export async function getExamDetail(examId) {
  if (!examId) return null

  const { data, error } = await supabase
    .from("exam")
    .select(`
      id,
      exam_date,
      observations,
      location_dojo:location_dojo_id(name),
      enrollments:exam_enrollment(
        id,
        belt,
        enrolled_at,
        student:student_id (
          id,
          full_name,
          dojo:dojo_id (name),
          current_belt
        )
      )
    `)
    .eq("id", examId)
    .single()

  if (error) {
    console.error("Error cargando detalle de examen:", error)
    return null
  }

  return {
    id: data.id,
    date: new Date(data.exam_date).toLocaleDateString("es-AR"),
    locationDojo: data.location_dojo?.name || "Sede desconocida",
    observations: data.observations,
    enrollments: data.enrollments.map((enr) => ({
      id: enr.id,
      studentName: enr.student?.full_name,
      studentDojo: enr.student?.dojo?.name,
      currentBelt: enr.student?.current_belt,
      beltToRender: enr.belt,
      enrolledAt: new Date(enr.enrolled_at).toLocaleDateString("es-AR"),
    })),
  }
}
