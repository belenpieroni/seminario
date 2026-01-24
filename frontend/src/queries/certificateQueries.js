import { supabase } from "../supabaseClient"

// Todos los certificados (ordenados por fecha de emisión, más recientes primero)
export async function getAllCertificates() {
  const { data, error } = await supabase
    .from("certificate")
    .select(`
      id,
      belt,
      pdf_url,
      is_valid,
      hash,
      issued_at,
      student:student_id(full_name),
      exam:exam_id(exam_date, observations, dojo:dojo_id(name), location_dojo:location_dojo_id(name))
    `)
    .order("issued_at", { ascending: false })

  if (error) {
    console.error("❌ Error cargando todos los certificados:", error)
    return []
  }
  return data || []
}

// Certificados (todos, validados o no) de un dojo específico (para sensei)
export async function getCertificatesByDojo(dojoId) {
  if (!dojoId) return []
  const { data, error } = await supabase
    .from("certificate")
    .select(`
      id,
      belt,
      pdf_url,
      issued_at,
      is_valid,
      student:student_id(full_name),
      exam:exam_id!inner (
        exam_date,
        observations,
        location_dojo:location_dojo_id(name),
        dojo:dojo_id(name)
      )
    `)
    .eq("exam.dojo_id", dojoId)
    .order("issued_at", { ascending: false })

  if (error) {
    console.error("❌ Error cargando certificados del dojo:", error)
    return []
  }
  return data || []
}

// Todos los certificados validados (vista global)
export async function getAllValidatedCertificates() {
  const { data, error } = await supabase
    .from("certificate")
    .select(`
      id,
      belt,
      pdf_url,
      issued_at,
      is_valid,
      student:student_id(full_name),
      exam:exam_id(
        exam_date,
        observations,
        location_dojo:location_dojo_id(name),
        dojo:dojo_id(name)
      )
    `)
    .eq("is_valid", true)
    .order("issued_at", { ascending: false })

  if (error) {
    console.error("❌ Error cargando certificados validados:", error)
    return []
  }
  return data || []
}

// Certificados validados filtrados por dojo (vista global con filtro)
export async function getValidatedCertificatesByDojo(dojoId) {
  if (!dojoId) return []
  const { data, error } = await supabase
    .from("certificate")
    .select(`
      id,
      belt,
      pdf_url,
      issued_at,
      is_valid,
      student:student_id(full_name),
      exam:exam_id!inner(
        exam_date,
        observations,
        location_dojo:location_dojo_id(name),
        dojo:dojo_id(name)
      )
    `)
    .eq("is_valid", true)
    .eq("exam.dojo_id", dojoId)
    .order("issued_at", { ascending: false })

  if (error) {
    console.error("❌ Error cargando certificados validados por dojo:", error)
    return []
  }
  return data || []
}

// Certificados validados de un alumno específico
export async function getValidatedCertificatesByStudent(studentId) {
  if (!studentId) return []
  const { data, error } = await supabase
    .from("certificate")
    .select(`
      id,
      belt,
      pdf_url,
      is_valid,
      validated_at,
      student:student_id(full_name),
      exam:exam_id(exam_date, dojo:dojo_id(name), location_dojo:location_dojo_id(name))
    `)
    .eq("student_id", studentId)
    .eq("is_valid", true)
    .order("validated_at", { ascending: false })

  if (error) {
    console.error("❌ Error cargando certificados del alumno:", error)
    return []
  }
  return data || []
}
