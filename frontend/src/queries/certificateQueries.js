// certificateQueries.js
import { supabase } from '../supabaseClient'

// Certificados del dojo del alumno (vista local por defecto)
export async function getCertificatesByDojo(dojoId) {
  const { data, error } = await supabase
    .from("certificate")
    .select(`
      id,
      belt,
      pdf_url,
      issued_at,
      is_valid,
      student:student_id (full_name),
      exam:exam_id!inner (
        exam_date,
        observations,
        location_dojo:location_dojo_id (name),
        dojo:dojo_id (name)
      )
    `)
    .eq("exam.dojo_id", dojoId)
    .order("issued_at", { ascending: false })

  if (error) {
    console.error("Error cargando certificados:", error)
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
      student:student_id (full_name),
      exam:exam_id (
        exam_date,
        observations,
        location_dojo:location_dojo_id (name),
        dojo:dojo_id (name)
      )
    `)
    //.eq("is_valid", true)
    .order("issued_at", { ascending: false })

  if (error) {
    console.error("Error cargando certificados validados:", error)
    return []
  }
  return data || []
}

// Certificados validados filtrados por dojo del alumno (vista global con filtro)
export async function getValidatedCertificatesByDojo(dojoId) {
  const { data, error } = await supabase
    .from("certificate")
    .select(`
      id,
      belt,
      pdf_url,
      issued_at,
      is_valid,
      student:student_id (full_name),
      exam:exam_id!inner (
        exam_date,
        observations,
        location_dojo:location_dojo_id (name),
        dojo:dojo_id (name)
      )
    `)
    //.eq("is_valid", true)
    .eq("exam.dojo_id", dojoId)
    .order("issued_at", { ascending: false })

  if (error) {
    console.error("Error cargando certificados validados por dojo:", error)
    return []
  }
  return data || []
}
