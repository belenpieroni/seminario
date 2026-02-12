import { useState, useEffect } from "react"
import { supabase } from "../../supabaseClient"
import { updateStudentBelt } from "../../queries/studentQueries"
import { pdfGenerate } from "../../utils/pdfGenerate"
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
  const [showConfirm, setShowConfirm] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  // Cargar nombre del alumno desde tabla student
  useEffect(() => {
    const fetchStudent = async () => {
      const { data, error } = await supabase
        .from("student")
        .select("full_name")
        .eq("id", enrollment.studentId)
        .single()
      if (!error && data) setStudentName(data.full_name)
    }
    if (enrollment?.studentId) fetchStudent()
  }, [enrollment.studentId])

  // Verificar si ya existe resultado
  useEffect(() => {
    const checkExistingResult = async () => {
      const { data, error } = await supabase
        .from("exam_result")
        .select("*")
        .eq("enrollment_id", enrollment.id)
      if (!error && data && data.length > 0) {
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
    if (enrollment?.id) checkExistingResult()
  }, [enrollment.id])

  // Abre el modal de confirmación
  const handleSubmit = () => {
    if (alreadySubmitted) {
      alert("Ya existe un resultado cargado para este examen. No se puede volver a cargar.")
      return
    }
    setShowConfirm(true)
  }

  // Confirmación real: guarda en DB
  const handleConfirmSubmit = async () => {
    setLoading(true)

    // 1) Insertar resultado del examen
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
      alert("No se pudo guardar el resultado.")
      return
    }

    // 2) Verificar aprobación
    const approvedGrades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-"]
    const isApproved = approvedGrades.includes(finalGrade)

    if (isApproved) {
      try {
        // Actualizar cinturón
        const updated = await updateStudentBelt(enrollment.studentId, enrollment.belt)
        alert(`Resultado guardado y grado actualizado a ${updated[0].current_belt}`)

        // 3) Insertar certificado en DB para obtener issued_at
        const { data: insertedCert, error: certError } = await supabase
          .from("certificate")
          .insert({
            student_id: enrollment.studentId,
            exam_id: enrollment.examId,
            belt: enrollment.belt,
            is_valid: false,
          })
          .select()

        if (certError) throw certError

        // 4) Generar hash
        const issuedAt = insertedCert[0].issued_at
        const dataToHash = `${enrollment.studentId}-${enrollment.examId}-${enrollment.belt}-${issuedAt}`
        const encoder = new TextEncoder()
        const data = encoder.encode(dataToHash)
        const hashBuffer = await crypto.subtle.digest("SHA-256", data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")

        // 5) Generar PDF con el hash incluido
        const pdfBytes = await pdfGenerate({
          studentName: enrollment.studentName || studentName || "Alumno",
          belt: enrollment.belt,
          examDate: new Date().toLocaleDateString("es-AR"),
          senseiName: enrollment.senseiName,
          hash: hashHex, 
        })

        // 6) Subir PDF a Storage
        const safeName = (enrollment.studentName || studentName || "Alumno").trim()
        const fileName = `certificados/${safeName}-${Date.now()}.pdf`
        const { error: uploadErr } = await supabase.storage
          .from("certificados")
          .upload(fileName, new Blob([pdfBytes], { type: "application/pdf" }))
        if (uploadErr) throw uploadErr

        // 7) Actualizar certificado con pdf_url y hash
        await supabase
          .from("certificate")
          .update({ pdf_url: fileName, hash: hashHex })
          .eq("id", insertedCert[0].id)

      } catch (err) {
        console.error("❌ Error generando o guardando certificado:", err)
        alert("El resultado se guardó, pero hubo un error al generar el certificado.")
      }
    } else {
      console.log("ℹ️ Alumno desaprobado, no se genera certificado")
      alert("Resultado guardado. El alumno no aprobó, por lo que su grado no se actualiza.")
    }

    setLoading(false)
    setShowConfirm(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white shadow-2xl border border-gray-200 w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-light uppercase tracking-wide text-[#1a1a1a]">
            Registrar <span className="text-[#c41e3a]">Resultado</span>
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-[#c41e3a] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Subtítulo */}
        <div className="px-6 py-3 text-gray-700 text-sm italic border-b border-gray-100">
          Está cargando las notas del alumno <strong>{enrollment.studentName}</strong> para el grado{" "}
          <strong>{enrollment.belt}</strong>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {["Kata", "Kumite", "Kihon", "Nota Final"].map((label, idx) => {
            const value = [kata, kumite, kihon, finalGrade][idx]
            const setter = [setKata, setKumite, setKihon, setFinalGrade][idx]
            return (
              <div key={label}>
                <label className="block mb-2 text-sm uppercase tracking-wide text-gray-600">
                  {label}
                </label>
                <select
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
                  disabled={alreadySubmitted}
                >
                  <option value="">Seleccionar nota</option>
                  {gradeOptions.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            )
          })}

          <div>
            <label className="block mb-2 text-sm uppercase tracking-wide text-gray-600">
              Observaciones
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none min-h-[100px]"
              disabled={alreadySubmitted}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={present}
              onChange={(e) => setPresent(e.target.checked)}
              disabled={alreadySubmitted}
            />
            <span className="text-sm text-gray-700">Presente</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-[#1a1a1a] uppercase text-xs tracking-wide hover:bg-gray-400 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || alreadySubmitted}
            className={`px-6 py-2 uppercase text-xs tracking-wide text-white transition-colors ${
              alreadySubmitted
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#c41e3a] hover:bg-[#a01830]"
            }`}
          >
            {alreadySubmitted ? "Ya cargado" : "Confirmar"}
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 shadow-xl w-full max-w-md">
            <h4 className="text-[#1a1a1a] mb-4 font-medium uppercase text-sm tracking-wide">
              Confirmar carga de resultado
            </h4>
            <p className="text-gray-700 text-sm mb-6">
              ¿Está seguro que quiere cargar las notas de <strong>{enrollment.studentName}</strong> para el grado{" "}
              <strong>{enrollment.belt}</strong>?
            </p>

            {/* Detalle de notas */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm space-y-2 mb-6">
              <div><span className="text-gray-600">Alumno:</span> <span className="font-medium">{enrollment.studentName}</span></div>
              <div><span className="text-gray-600">Kata:</span> <span className="font-medium">{kata}</span></div>
              <div><span className="text-gray-600">Kumite:</span> <span className="font-medium">{kumite}</span></div>
              <div><span className="text-gray-600">Kihon:</span> <span className="font-medium">{kihon}</span></div>
              <div><span className="text-gray-600">Nota final:</span> <span className="font-medium">{finalGrade}</span></div>
              <div>
                <span className="text-gray-600">Estado:</span>{" "}
                {["A+","A","A-","B+","B","B-","C+","C","C-"].includes(finalGrade) ? (
                  <span className="font-semibold text-green-600">Aprobado</span>
                ) : (
                  <span className="font-semibold text-red-600">Desaprobado</span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 border-t border-gray-200 pt-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2 bg-gray-300 text-[#1a1a1a] rounded-md hover:bg-gray-400 transition-colors text-sm uppercase tracking-wide"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-6 py-2 bg-[#c41e3a] text-white rounded-md hover:bg-[#a01830] transition-colors text-sm uppercase tracking-wide"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
