// examQueries.js
import { supabase } from "../supabaseClient"
const APPROVED_GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-"]

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

export async function getExamDetail(examId) {
  if (!examId) return null

  const { data, error } = await supabase
    .from("exam")
    .select(`
      id,
      exam_date,
      observations,
      location_dojo:location_dojo_id (
        name,
        head_sensei:head_sensei_id (full_name)
      ),
      enrollments:exam_enrollment(
        id,
        exam_id,
        student_id,
        belt,
        enrolled_at,
        student:student (
          id,
          full_name,
          current_belt,
          dojo:dojo_id (name)
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
    senseiName: data.location_dojo?.head_sensei?.full_name || "Sensei desconocido", // ⚠️ ahora correcto
    observations: data.observations,
    enrollments: data.enrollments.map((enr) => ({
      id: enr.id,
      examId: enr.exam_id,
      studentId: enr.student_id,
      studentName: enr.student?.full_name,
      studentDojo: enr.student?.dojo?.name,
      currentBelt: enr.student?.current_belt,
      belt: enr.belt,
      enrolledAt: new Date(enr.enrolled_at).toLocaleDateString("es-AR"),
    })),
  }
}

export async function getExamHistory(studentId) {
  if (!studentId) return []

  const { data, error } = await supabase
    .from("exam_enrollment")
    .select(`
      id,
      student_id,
      belt,
      enrolled_at,
      exam:exam_id (
        id,
        exam_date,
        observations,
        dojo:dojo_id ( name ),
        sensei:sensei_id ( id, full_name )
      ),
      exam_result (
        id,
        kata_grade,
        kumite_grade,
        kihon_grade,
        final_grade,
        observations,
        present,
        recorded_at
      )
    `)
    .eq("student_id", studentId)
    .order("enrolled_at", { ascending: false })

  if (error) {
    console.error("Error cargando historial de exámenes:", error)
    return []
  }

  const now = new Date()

  return (data || []).map((enr) => {
    const result = Array.isArray(enr.exam_result) ? enr.exam_result[0] : enr.exam_result

    // fecha del examen (Date o null)
    const examDate = enr.exam?.exam_date ? new Date(enr.exam.exam_date) : null

    // estado calculado
    let status = null
    if (result && result.final_grade) {
      status = APPROVED_GRADES.includes(result.final_grade) ? "approved" : "failed"
    } else if (!result) {
      if (examDate && examDate.getTime() > now.getTime()) {
        status = "scheduled" // examen futuro, sin resultado aún
      } else {
        status = "pending" // examen pasado sin resultado cargado
      }
    } else {
      // result existe pero no tiene final_grade (por si acaso)
      status = "pending"
    }

    return {
      enrollmentId: enr.id,
      studentId: enr.student_id,
      belt: enr.belt ?? null,
      date: examDate ? examDate.toISOString() : null,
      dateLabel: examDate ? examDate.toLocaleDateString("es-AR") : "Fecha desconocida",
      dojo_name: enr.exam?.dojo?.name ?? "Dojo desconocido",
      sensei_name: enr.exam?.sensei?.full_name ?? "Sensei desconocido",
      exam_observations: enr.exam?.observations ?? null,

      resultId: result?.id ?? null,
      kata: result?.kata_grade ?? null,
      kumite: result?.kumite_grade ?? null,
      kihon: result?.kihon_grade ?? null,
      final_grade: result?.final_grade ?? null,
      present: typeof result?.present === "boolean" ? result.present : null,
      recorded_at: result?.recorded_at ?? null,
      result_observations: result?.observations ?? null,

      // flags antiguos (si los necesitás)
      approved: result?.final_grade ? APPROVED_GRADES.includes(result.final_grade) : null,

      // nuevo campo de estado: "approved" | "failed" | "scheduled" | "pending"
      status,
    }
  })
}

export async function getExamDetailByEnrollment(enrollmentId) {
  if (!enrollmentId) return null

  const { data, error } = await supabase
    .from("exam_enrollment")
    .select(`
      id,
      belt,
      exam:exam_id (
        id,
        exam_date,
        observations,
        dojo:dojo_id (name),
        sensei:sensei_id (id, full_name)
      ),
      exam_result (
        kata_grade,
        kumite_grade,
        kihon_grade,
        final_grade,
        observations,
        present
      )
    `)
    .eq("id", enrollmentId)
    .single()

  if (error) {
    console.error("❌ Error cargando detalle de examen:", error.message)
    return null
  }

  if (!data) return null

  const result = data.exam_result?.[0] ?? null

  return {
    id: data.id,
    belt: data.belt,
    date: data.exam?.exam_date
      ? new Date(data.exam.exam_date).toLocaleDateString("es-AR")
      : "Fecha desconocida",
    dojo_name: data.exam?.dojo?.name ?? "Dojo desconocido",
    sensei_name: data.exam?.sensei?.full_name ?? "Sensei desconocido",
    exam_observations: data.exam?.observations ?? null,

    // Resultados
    present: result?.present ?? false,
    kata: result?.kata_grade ?? null,
    kumite: result?.kumite_grade ?? null,
    kihon: result?.kihon_grade ?? null,
    final_grade: result?.final_grade ?? null,
    observations: result?.observations ?? null,

    approved: result?.final_grade ? APPROVED_GRADES.includes(result.final_grade) : null
  }
}
