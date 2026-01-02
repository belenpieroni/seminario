import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { supabase } from "../../supabaseClient"
import { getStudentsByDojo, updateStudent } from "../../queries/studentQueries"
import { getExamHistory } from "../../queries/examQueries"
import { EditableRow } from "../common/EditableRow"

const BELTS = [
  "Blanco",
  "Amarillo",
  "Naranja",
  "Verde",
  "Azul",
  "Marrón",
  "Negro",
  "1er Dan",
  "2do Dan",
  "3er Dan",
  "4to Dan",
  "5to Dan",
  "6to Dan",
  "7mo Dan",
  "8vo Dan",
  "9no Dan",
]

export function StudentManageModal({ studentId, dojoId, onClose, onSave }) {
  const [student, setStudent] = useState(null)
  const [exams, setExams] = useState([]) // { enrollmentId, examId, exam_date, belt, passed }
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingExamId, setEditingExamId] = useState(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      try {
        // 1) traer datos básicos del alumno
        const { data: studentData, error: studentErr } = await supabase
          .from("student")
          .select("id, full_name, birth_date, registered_at, current_belt")
          .eq("id", studentId)
          .single()

        if (studentErr) {
          console.error("Error fetching student:", studentErr)
          if (mounted) {
            setStudent(null)
            setExams([])
            setLoading(false)
          }
          return
        }
        if (!mounted) return
        setStudent(studentData)

        // 2) intentar traer inscripciones + examen (incluye sede: location_dojo) + resultados
        const { data: enrollmentsWithNested, error: nestedErr } = await supabase
          .from("exam_enrollment")
          .select(`
            id,
            exam_id,
            belt,
            enrolled_at,
            exam:exam_id (
              id,
              exam_date,
              observations,
              location_dojo_id,
              dojo:dojo_id ( id, name ),
              sensei:sensei_id ( id, full_name )
            ),
            exam_result (
              id,
              enrollment_id,
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

        if (!nestedErr && Array.isArray(enrollmentsWithNested)) {
          // obtener todos los location_dojo_id
          const locationIds = (enrollmentsWithNested || [])
            .map((en) => en.exam?.location_dojo_id)
            .filter(Boolean)

          let dojosById = {}
          if (locationIds.length > 0) {
            const { data: dojosData, error: dojoErr } = await supabase
              .from("dojo")
              .select("id, name, head_sensei_id")
              .in("id", locationIds)

            if (dojoErr) {
              console.error("Error fetching dojos:", dojoErr)
            }

            const senseiIds = (dojosData || []).map((d) => d.head_sensei_id).filter(Boolean)
            let senseisById = {}
            if (senseiIds.length > 0) {
              const { data: senseisData } = await supabase
                .from("sensei")
                .select("id, full_name")
                .in("id", senseiIds)

              ;(senseisData || []).forEach((s) => {
                senseisById[s.id] = s.full_name
              })
            }

            ;(dojosData || []).forEach((d) => {
              dojosById[d.id] = {
                name: d.name,
                sensei_name: senseisById[d.head_sensei_id] || "Sensei desconocido",
              }
            })
          }

          const merged = enrollmentsWithNested.map((en) => {
            const resultsArray = Array.isArray(en.exam_result)
              ? en.exam_result
              : en.exam_result
              ? [en.exam_result]
              : []
            let latestResult = null
            if (resultsArray.length > 0) {
              latestResult = resultsArray
                .filter(Boolean)
                .sort((a, b) => {
                  const ta = a.recorded_at ? new Date(a.recorded_at).getTime() : 0
                  const tb = b.recorded_at ? new Date(b.recorded_at).getTime() : 0
                  return tb - ta
                })[0]
            }

            const sedeInfo = dojosById[en.exam?.location_dojo_id] || {}

            return {
              enrollmentId: en.id,
              examId: en.exam_id,
              beltRend: en.belt ?? null,
              enrolled_at: en.enrolled_at ?? null,
              exam_date: en.exam?.exam_date ?? null,
              exam_dateLabel: en.exam?.exam_date
                ? new Date(en.exam.exam_date).toLocaleDateString("es-AR")
                : "Fecha desconocida",
              exam_observations: en.exam?.observations ?? null,
              sede_name: dojosById[en.exam?.location_dojo_id]?.name ?? "Sede desconocida",
              sede_sensei: dojosById[en.exam?.location_dojo_id]?.sensei_name ?? "Sensei desconocido",
              dojo_name: en.exam?.dojo?.name ?? "Dojo desconocido",
              sensei_name: en.exam?.sensei?.full_name ?? "Sensei desconocido",
              result: latestResult
                ? {
                    id: latestResult.id,
                    kata: latestResult.kata_grade ?? null,
                    kumite: latestResult.kumite_grade ?? null,
                    kihon: latestResult.kihon_grade ?? null,
                    final_grade: latestResult.final_grade ?? null,
                    observations: latestResult.observations ?? null,
                    present:
                      typeof latestResult.present === "boolean"
                        ? latestResult.present
                        : null,
                    recorded_at: latestResult.recorded_at ?? null,
                  }
                : null,
            }
          })

          if (mounted) setExams(merged)
          return
        }

        // 3) fallback: si la consulta anidada falla, hacemos dos consultas (enrollments -> exams -> results)
        const { data: enrollments, error: enrollErr } = await supabase
          .from("exam_enrollment")
          .select("id, exam_id, belt, enrolled_at")
          .eq("student_id", studentId)
          .order("enrolled_at", { ascending: false })

        if (enrollErr) {
          console.error("Error fetching enrollments:", enrollErr)
          if (mounted) {
            setExams([])
            setLoading(false)
          }
          return
        }

        if (!enrollments || enrollments.length === 0) {
          if (mounted) {
            setExams([])
            setLoading(false)
          }
          return
        }

        // traer exámenes (incluimos location_dojo como location_dojo_id)
        const examIds = Array.from(new Set(enrollments.map((e) => e.exam_id)))
        const { data: examsData, error: examsErr } = await supabase
          .from("exam")
          .select("id, exam_date, observations, location_dojo:location_dojo_id ( id, name, sensei:head_sensei_id ( id, full_name ) ), dojo:dojo_id ( id, name ), sensei:sensei_id ( id, full_name )")
          .in("id", examIds)

        if (examsErr) {
          console.error("Error fetching exams:", examsErr)
        }

        const examsById = {}
        ;(examsData || []).forEach((ex) => {
          examsById[ex.id] = ex
        })

        // traer resultados para las enrollments
        const enrollmentIds = enrollments.map((en) => en.id)
        const { data: resultsData, error: resultsErr } = await supabase
          .from("exam_result")
          .select("id, enrollment_id, kata_grade, kumite_grade, kihon_grade, final_grade, observations, present, recorded_at")
          .in("enrollment_id", enrollmentIds)

        if (resultsErr) {
          console.error("Error fetching exam results:", resultsErr)
        }

        const resultsByEnrollment = {}
        ;(resultsData || []).forEach((r) => {
          const existing = resultsByEnrollment[r.enrollment_id]
          if (!existing) {
            resultsByEnrollment[r.enrollment_id] = r
          } else {
            const existingTime = existing.recorded_at ? new Date(existing.recorded_at).getTime() : 0
            const newTime = r.recorded_at ? new Date(r.recorded_at).getTime() : 0
            if (newTime > existingTime) resultsByEnrollment[r.enrollment_id] = r
          }
        })

        // merge final (usamos location_dojo para la sede)
        const merged = enrollments.map((en) => {
          const ex = examsById[en.exam_id] || {}
          const res = resultsByEnrollment[en.id] || null
          return {
            enrollmentId: en.id,
            examId: en.exam_id,
            beltRend: en.belt ?? null,
            enrolled_at: en.enrolled_at ?? null,
            exam_date: ex.exam_date ?? null,
            exam_dateLabel: ex.exam_date ? new Date(ex.exam_date).toLocaleDateString("es-AR") : "Fecha desconocida",
            exam_observations: ex.observations ?? null,
            sede_name: ex.location_dojo?.name ?? "Sede desconocida",
            sede_sensei: ex.location_dojo?.sensei ?? "Sensei desconocido",
            dojo_name: ex.dojo?.name ?? "Dojo desconocido",
            sensei_name: ex.sensei?.full_name ?? "Sensei desconocido",
            result: res
              ? {
                  id: res.id,
                  kata: res.kata_grade ?? null,
                  kumite: res.kumite_grade ?? null,
                  kihon: res.kihon_grade ?? null,
                  final_grade: res.final_grade ?? null,
                  observations: res.observations ?? null,
                  present: typeof res.present === "boolean" ? res.present : null,
                  recorded_at: res.recorded_at ?? null
                }
              : null
          }
        })

        if (mounted) setExams(merged)
      } catch (err) {
        console.error("StudentManageModal load error:", err)
        if (mounted) {
          setStudent(null)
          setExams([])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (studentId) load()
    return () => {
      mounted = false
    }
  }, [studentId])

  if (loading) return null
  if (!student) return null

  // edad calculada
  const age = student.birth_date
    ? Math.floor((Date.now() - new Date(student.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : "-"

  async function handleDelete() {
    setSaving(true)
    try {
      await updateStudent(student.id, { is_active: false })
      const refreshed = await getStudentsByDojo(dojoId)
      onSave(refreshed)
      onClose(true)
    } catch (err) {
      console.error("Error al eliminar alumno:", err)
    } finally {
      setSaving(false)
    }
  }

  async function updateField(field, value) {
    setSaving(true)
    try {
      const updated = await updateStudent(student.id, { [field]: value })
      const merged = { ...student, [field]: updated[field] ?? value }
      setStudent(merged)

      // notificar al padre que hubo cambios (solo campos relevantes)
      onSave({
        id: student.id,
        full_name: merged.full_name,
        birth_date: merged.birth_date,
        current_belt: merged.current_belt,
      })
    } catch (err) {
      console.error("Error actualizando alumno:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-light uppercase tracking-wide text-[#1a1a1a]">
            Gestionar <span className="text-[#c41e3a]">Alumno</span>
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-[#c41e3a] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Nombre y apellido */}
          <EditableRow label="Nombre y Apellido" value={student.full_name} onSave={(v) => updateField("full_name", v)} />

          {/* Fecha de nacimiento */}
          <EditableRow label="Fecha de nacimiento" value={student.birth_date} type="date" onSave={(v) => updateField("birth_date", v)} />

          {/* Edad calculada */}
          <div className="flex justify-between items-center bg-gray-50 p-3 border border-gray-200">
            <div>
              <p className="text-gray-600 uppercase text-xs tracking-wide">Edad</p>
              <p className="text-[#1a1a1a] font-medium">{age}</p>
            </div>
          </div>

          {/* Cinturón actual (select para evitar errores) */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600 uppercase tracking-wide">Cinturón actual</label>
            <div className="flex gap-2 items-center">
              <select
                value={student.current_belt || ""}
                onChange={(e) => updateField("current_belt", e.target.value)}
                className="px-3 py-2 border rounded"
                disabled={saving}
              >
                <option value="">Seleccionar cinturón</option>
                {BELTS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500">Actual: <span className="font-medium">{student.current_belt || "-"}</span></span>
            </div>
          </div>

          {/* Exámenes rendidos (editable: grado y aprobado) */}
          <div>
            <h4 className="font-light uppercase tracking-wide text-sm mb-2 text-[#1a1a1a]">
              Exámenes rendidos
            </h4>

            {exams.length === 0 ? (
              <p className="text-gray-500 italic">No tiene exámenes registrados</p>
            ) : (
              <div className="space-y-3">
                {exams.map((ex) => {
                  const examDate = ex.exam_date
                    ? new Date(ex.exam_date).toLocaleDateString("es-AR")
                    : "-"

                  // valores seguros desde el objeto merged
                  const enrollmentId = ex.enrollmentId
                  const currentBelt = ex.beltRend ?? ex.belt ?? ""
                  const resultFinal = ex.result?.final_grade ?? ""
                  const resultPresent = typeof ex.result?.present === "boolean" ? ex.result.present : false

                  return (
                    <div
                      key={enrollmentId}
                      className="bg-gray-50 border border-gray-200 p-3 rounded flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div className="text-sm text-[#1a1a1a]">
                        <div className="font-medium">{examDate}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {ex.sede_name} · {ex.sede_sensei}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Grado rendido (select) -> actualiza exam_enrollment.belt */}
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500">Grado</label>
                          <select
                            value={currentBelt}
                            onChange={async (e) => {
                              const newBelt = e.target.value
                              // actualizar localmente para respuesta instantánea
                              setExams((prev) =>
                                prev.map((p) =>
                                  p.enrollmentId === enrollmentId ? { ...p, beltRend: newBelt, belt: newBelt } : p
                                )
                              )
                              // persistir en exam_enrollment
                              try {
                                setSaving(true)
                                await supabase
                                  .from("exam_enrollment")
                                  .update({ belt: newBelt })
                                  .eq("id", enrollmentId)
                              } catch (err) {
                                console.error("Error actualizando belt en enrollment:", err)
                                // revertir si falla (opcional)
                              } finally {
                                setSaving(false)
                              }
                            }}
                            className="px-2 py-1 border rounded text-sm"
                            disabled={saving}
                          >
                            <option value="">Seleccionar</option>
                            {BELTS.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Aprobado (se basa en exam_result.present y final_grade) */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500">Presente</label>
                          <input
                            type="checkbox"
                            checked={!!resultPresent}
                            onChange={async (e) => {
                              const present = e.target.checked
                              // actualizar localmente
                              setExams((prev) =>
                                prev.map((p) =>
                                  p.enrollmentId === enrollmentId
                                    ? { ...p, result: { ...(p.result || {}), present } }
                                    : p
                                )
                              )

                              // upsert en exam_result: si existe result.id -> update, sino -> insert
                              try {
                                setSaving(true)
                                const payload = {
                                  enrollment_id: enrollmentId,
                                  present,
                                  final_grade: resultFinal || null,
                                  recorded_at: new Date().toISOString()
                                }

                                // buscar si ya existe resultado para esa enrollment
                                const { data: existing, error: existingErr } = await supabase
                                  .from("exam_result")
                                  .select("id")
                                  .eq("enrollment_id", enrollmentId)
                                  .limit(1)
                                  .single()

                                if (!existingErr && existing?.id) {
                                  // update
                                  await supabase
                                    .from("exam_result")
                                    .update({
                                      present: payload.present,
                                      final_grade: payload.final_grade,
                                      recorded_at: payload.recorded_at
                                    })
                                    .eq("id", existing.id)
                                } else {
                                  // insert
                                  await supabase.from("exam_result").insert({
                                    enrollment_id: enrollmentId,
                                    present: payload.present,
                                    final_grade: payload.final_grade,
                                    recorded_at: payload.recorded_at
                                  })
                                }
                              } catch (err) {
                                console.error("Error upserting exam_result:", err)
                              } finally {
                                setSaving(false)
                              }
                            }}
                            disabled={saving}
                          />
                        </div>

                        {/* Final grade editable (select) */}
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500">Resultado final</label>
                          <select
                            value={resultFinal}
                            onChange={async (e) => {
                              const newFinal = e.target.value
                              // actualizar localmente
                              setExams((prev) =>
                                prev.map((p) =>
                                  p.enrollmentId === enrollmentId
                                    ? { ...p, result: { ...(p.result || {}), final_grade: newFinal } }
                                    : p
                                )
                              )

                              // persistir en exam_result (upsert)
                              try {
                                setSaving(true)
                                const payload = {
                                  enrollment_id: enrollmentId,
                                  final_grade: newFinal || null,
                                  recorded_at: new Date().toISOString()
                                }

                                const { data: existing, error: existingErr } = await supabase
                                  .from("exam_result")
                                  .select("id")
                                  .eq("enrollment_id", enrollmentId)
                                  .limit(1)
                                  .single()

                                if (!existingErr && existing?.id) {
                                  await supabase
                                    .from("exam_result")
                                    .update({
                                      final_grade: payload.final_grade,
                                      recorded_at: payload.recorded_at
                                    })
                                    .eq("id", existing.id)
                                } else {
                                  await supabase.from("exam_result").insert({
                                    enrollment_id: enrollmentId,
                                    final_grade: payload.final_grade,
                                    recorded_at: payload.recorded_at
                                  })
                                }
                              } catch (err) {
                                console.error("Error upserting final_grade:", err)
                              } finally {
                                setSaving(false)
                              }
                            }}
                            className="px-2 py-1 border rounded text-sm"
                            disabled={saving}
                          >
                            <option value="">Sin calificación</option>
                            {/* Opciones de nota; ajustá según tu escala real */}
                            <option value="A+">A+</option>
                            <option value="A">A</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B">B</option>
                            <option value="B-">B-</option>
                            <option value="C+">C+</option>
                            <option value="C">C</option>
                            <option value="C-">C-</option>
                            <option value="D">D</option>
                          </select>
                        </div>

                        {/* Badge aprobado/desaprobado */}
                        <div>
                          {ex.result?.final_grade ? (
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-"].includes(
                                  ex.result.final_grade
                                )
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-"].includes(
                                ex.result.final_grade
                              )
                                ? "Aprobado"
                                : "Desaprobado"}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">Sin resultado</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Registrado en el sistema */}
          <div className="text-sm">
            <span className="font-light uppercase tracking-wide text-gray-600">Registrado el:</span>{" "}
            <span className="text-[#1a1a1a] font-medium">{new Date(student.registered_at).toLocaleDateString("es-AR")}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-600 text-white uppercase text-xs tracking-wide hover:bg-red-700 transition-colors"
            disabled={saving}
          >
            Eliminar alumno
          </button>

          <button
            onClick={() => onClose(false)}
            className="px-6 py-2 bg-gray-300 text-[#1a1a1a] uppercase text-xs tracking-wide hover:bg-gray-400 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
