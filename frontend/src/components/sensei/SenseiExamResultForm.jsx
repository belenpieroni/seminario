import { useState, useEffect } from "react"
import { supabase } from "../../supabaseClient"
import { updateStudentBelt } from "../../queries/studentQueries"
import { X } from "lucide-react"

const gradeOptions = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "E", "F"]

export default function SenseiExamResultForm({ enrollment, onClose }) {
  const [studentName, setStudentName] = useState("")
  const [kata, setKata] = useState("")
  const [kumite, setKumite] = useState("")
  const [kihon, setKihon] = useState("")
  const [finalGrade, setFinalGrade] = useState("")
  const [observations, setObservations] = useState("")
  const [present, setPresent] = useState(true)
  const [loading, setLoading] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  // ✅ Recuperar nombre del alumno
  useEffect(() => {
    const fetchStudent = async () => {
      console.log("🔎 Buscando alumno con id:", enrollment.student_id)
      const { data, error } = await supabase
        .from("student")
        .select("full_name")
        .eq("id", enrollment.student_id)
        .single()

      if (error) {
        console.error("❌ Error al recuperar alumno:", error.message)
      }
      if (data) {
        console.log("✅ Alumno encontrado:", data)
        setStudentName(data.full_name)
      }
    }
    if (enrollment?.student_id) {
      fetchStudent()
    }
  }, [enrollment.student_id])

  // ✅ Validación: verificar si ya existe resultado para este enrollment
  useEffect(() => {
    const checkExistingResult = async () => {
      console.log("🔎 Verificando resultados previos para enrollment:", enrollment.id)
      const { data, error } = await supabase
        .from("exam_result")
        .select("*")
        .eq("enrollment_id", enrollment.id)

      if (error) {
        console.error("❌ Error al verificar resultados:", error.message)
      }
      if (data && data.length > 0) {
        console.log("⚠️ Ya existe resultado:", data[0])
        setAlreadySubmitted(true)
        const result = data[0]
        setKata(result.kata_grade)
        setKumite(result.kumite_grade)
        setKihon(result.kihon_grade)
        setFinalGrade(result.final_grade)
        setObservations(result.observations)
        setPresent(result.present)
      }
    }
    if (enrollment?.id) {
      checkExistingResult()
    }
  }, [enrollment.id])

  const handleSubmit = async () => {
    if (alreadySubmitted) {
      alert("Ya existe un resultado cargado para este examen. No se puede volver a cargar.")
      return
    }

    const confirmMsg = `¿Está seguro que quiere cargar las notas de ${studentName} para el examen de cinturón ${enrollment.belt}?`
    if (!window.confirm(confirmMsg)) {
      return
    }

    setLoading(true)

    // 1. Insertar resultado del examen
    const { error: insertError } = await supabase
      .from("exam_result")
      .insert({
        enrollment_id: enrollment.id,
        kata_grade: kata,
        kumite_grade: kumite,
        kihon_grade: kihon,
        final_grade: finalGrade,
        observations,
        present,
      })

    if (insertError) {
      setLoading(false)
      console.error("Error guardando resultado:", insertError.message)
      alert("No se pudo guardar el resultado.")
      return
    }

    // 2. Validar si aprobó (ejemplo: cualquier nota >= C se considera aprobado)
    const approvedGrades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-"]
    const isApproved = approvedGrades.includes(finalGrade)

    if (isApproved) { 
      try { 
        const updated = await updateStudentBelt(enrollment.studentId, enrollment.belt)
        alert(`Resultado guardado y cinturón actualizado a ${updated[0].current_belt}`) 
      } catch (err) { 
        alert("El resultado se guardó, pero no se pudo actualizar el cinturón del alumno.") 
      } 
    } else { 
      alert("Resultado guardado. El alumno no aprobó, por lo que su cinturón no se actualiza.") 
    }
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white shadow-lg w-full max-w-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-[#1a1a1a] text-lg">Registrar Resultado</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Subtítulo */}
        <div className="px-6 text-gray-700 text-sm italic">
          Está cargando las notas del alumno <strong>{studentName}</strong> 
          para cinturón <strong>{enrollment.belt}</strong>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-4">
          <div>
            <label>Kata</label>
            <select value={kata} onChange={(e) => setKata(e.target.value)} className="w-full border p-2" disabled={alreadySubmitted}>
              <option value="">Seleccionar nota</option>
              {gradeOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Kumite</label>
            <select value={kumite} onChange={(e) => setKumite(e.target.value)} className="w-full border p-2" disabled={alreadySubmitted}>
              <option value="">Seleccionar nota</option>
              {gradeOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Kihon</label>
            <select value={kihon} onChange={(e) => setKihon(e.target.value)} className="w-full border p-2" disabled={alreadySubmitted}>
              <option value="">Seleccionar nota</option>
              {gradeOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Nota Final</label>
            <select value={finalGrade} onChange={(e) => setFinalGrade(e.target.value)} className="w-full border p-2" disabled={alreadySubmitted}>
              <option value="">Seleccionar nota</option>
              {gradeOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Observaciones</label>
            <textarea value={observations} onChange={(e) => setObservations(e.target.value)} className="w-full border p-2" disabled={alreadySubmitted} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={present} onChange={(e) => setPresent(e.target.checked)} disabled={alreadySubmitted} />
            <span>Presente</span>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
            Cerrar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || alreadySubmitted}
            className={`px-6 py-2 rounded text-white ${
              alreadySubmitted
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#c41e3a] hover:bg-[#a01830]"
            }`}
          >
            {alreadySubmitted
              ? "Ya cargado"
              : loading
              ? "Guardando..."
              : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  )
}
