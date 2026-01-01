import { useEffect, useState } from "react"
import { getExamHistory, getExamDetailByEnrollment } from "../../queries/examQueries"
import { X } from "lucide-react"
import { supabase } from "../../supabaseClient"
import dayjs from "dayjs"

export function ExamDetail({ examId, studentId, onClose }) {
  const [exam, setExam] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const grades = [
    "Blanco", "Amarillo", "Naranja", "Verde", "Azul", "Marrón", "Negro",
    "1er Dan", "2do Dan", "3er Dan", "4to Dan", "5to Dan",
    "6to Dan", "7mo Dan", "8vo Dan", "9no Dan"
  ]

  const getNextGrade = (current) => {
    const idx = grades.findIndex(g => g.toLowerCase() === current?.toLowerCase())
    return idx >= 0 && idx < grades.length - 1 ? grades[idx + 1] : current
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: examData } = await supabase
        .from("exam")
        .select(`
          id,
          exam_date,
          observations,
          location_dojo:location_dojo_id(name, address, phone)
        `)
        .eq("id", examId)
        .single()
      setExam(examData)

      const { data: enrollmentData } = await supabase
        .from("exam_enrollment")
        .select("id, belt")
        .eq("exam_id", examId)
        .eq("student_id", studentId)
        .maybeSingle()
      setEnrollment(enrollmentData)

      const { data: studentData } = await supabase
        .from("student")
        .select("id, current_belt")
        .eq("id", studentId)
        .single()
      setStudent(studentData)

      setLoading(false)
    }

    fetchData()
  }, [examId, studentId])

  const handleConfirmEnroll = async () => {
    setEnrolling(true)

    const nextBelt = getNextGrade(student?.current_belt)

    const { error } = await supabase.from("exam_enrollment").insert({
      exam_id: examId,
      student_id: studentId,
      belt: nextBelt,
    })

    setEnrolling(false)
    setShowConfirm(false)

    if (error) {
      alert("Error al inscribirse: " + error.message)
    } else {
      alert("Inscripción realizada con éxito.")
      onClose()
    }
  }

  if (loading || !exam) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white shadow-lg w-full max-w-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-[#1a1a1a] font-light uppercase tracking-wide">
            Examen
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-[#c41e3a]">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Info */}
        <div className="p-6 space-y-3 text-sm">
          <p><span className="text-gray-600">Fecha:</span> <span className="font-medium">{dayjs(exam.exam_date).format("DD/MM/YYYY")}</span></p>
          <p><span className="text-gray-600">Sede:</span> <span className="font-medium">{exam.location_dojo?.name}</span></p>
          {exam.location_dojo?.address && (
            <p><span className="text-gray-600">Dirección:</span> <span className="font-medium">{exam.location_dojo.address}</span></p>
          )}
          {exam.location_dojo?.phone && (
            <p><span className="text-gray-600">Teléfono:</span> <span className="font-medium">{exam.location_dojo.phone}</span></p>
          )}
          {exam.observations && (
            <p><span className="text-gray-600">Observaciones:</span> <span className="font-medium">{exam.observations}</span></p>
          )}

          {enrollment ? (
            <>
              <p><span className="text-gray-600">Estado inscripción:</span> <span className="font-medium">Ya inscripto</span></p>
              <p><span className="text-gray-600">Cinturón:</span> <span className="font-medium">{enrollment.belt}</span></p>
            </>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={() => setShowConfirm(true)}
                disabled={enrolling}
                className="px-6 py-2 bg-[#c41e3a] text-white rounded hover:bg-[#a01830] transition-colors text-xs uppercase tracking-wide"
              >
                Inscribirme
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Popup confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white shadow-lg w-full max-w-lg rounded-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-[#1a1a1a] font-light uppercase tracking-wide">Confirmar inscripción</h3>
              <button onClick={() => setShowConfirm(false)} className="text-gray-500 hover:text-[#c41e3a]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 text-sm space-y-3">
              <p>
                ¿Está seguro que quiere inscribirse al examen del{" "}
                <span className="font-medium">{dayjs(exam.exam_date).format("DD/MM/YYYY")}</span>{" "}
                para rendir el cinturón{" "}
                <span className="font-medium">{getNextGrade(student?.current_belt)}</span>{" "}
                en el dojo <span className="font-medium">{exam.location_dojo?.name}</span>?
              </p>
            </div>

            <div className="flex justify-end gap-4 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 text-xs uppercase tracking-wide"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmEnroll}
                disabled={enrolling}
                className="px-6 py-2 bg-[#c41e3a] text-white rounded hover:bg-[#a01830] text-xs uppercase tracking-wide"
              >
                {enrolling ? "Inscribiendo..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ExamModal({ enrollmentId, onClose }) {
  const [exam, setExam] = useState(null)

  useEffect(() => {
    const fetchDetail = async () => {
      const detail = await getExamDetailByEnrollment(enrollmentId)
      setExam(detail)
    }
    if (enrollmentId) fetchDetail()
  }, [enrollmentId])

  if (!exam) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white shadow-lg w-full max-w-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-[#1a1a1a] font-light uppercase tracking-wide">Examen</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-[#c41e3a]">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Información */}
        <div className="p-6 space-y-3 text-sm">
          <p><span className="text-gray-600">Dojo:</span> <span className="font-medium">{exam.dojo_name}</span></p>
          <p><span className="text-gray-600">Sensei:</span> <span className="font-medium">{exam.sensei_name}</span></p>
          <p><span className="text-gray-600">Cinturón rendido:</span> <span className="font-medium">{exam.belt}</span></p>
          <p><span className="text-gray-600">Presente:</span> <span className="font-medium">{exam.present ? "Sí" : "No"}</span></p>

          {exam.present && (
            <>
              <p><span className="text-gray-600">Kata:</span> <span className="font-medium">{exam.kata}</span></p>
              <p><span className="text-gray-600">Kumite:</span> <span className="font-medium">{exam.kumite}</span></p>
              <p><span className="text-gray-600">Kihon:</span> <span className="font-medium">{exam.kihon}</span></p>
              <p><span className="text-gray-600">Nota final:</span> <span className="font-medium">{exam.final_grade}</span></p>
              <p><span className="text-gray-600">Observaciones:</span> <span className="font-medium">{exam.observations}</span></p>
            </>
          )}

          <p>
            <span className="text-gray-600">Estado:</span>{" "}
            {exam.approved ? (
              <span className="text-green-600 font-medium">Aprobado</span>
            ) : (
              <span className="text-red-600 font-medium">Desaprobado</span>
            )}
          </p>
        </div>

        {/* Botón cerrar */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 text-xs uppercase tracking-wide"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export function ExamHistory({ studentId }) {
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)

  useEffect(() => {
    const fetchExams = async () => {
      const history = await getExamHistory(studentId)
      setExams(history)
    }
    fetchExams()
  }, [studentId])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-300 pb-4">
        <h2 className="text-2xl font-light uppercase tracking-wide text-[#1a1a1a]">
          Historial <span className="text-[#c41e3a]">de Exámenes</span>
        </h2>
      </div>

      {exams.length === 0 ? (
        <p className="text-gray-500 italic">No hay exámenes registrados.</p>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white shadow-lg border border-gray-200 rounded"
            >
              {/* Header tarjeta */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div>
                  <p className="text-[#1a1a1a] font-medium">{exam.belt}</p>
                  <p className="text-sm text-gray-600">{exam.date}</p>
                  {exam.present && (
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      Participaste
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Estado rápido */}
                  {exam.approved ? (
                    <span className="text-green-600 font-semibold text-sm uppercase">
                      Aprobado
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold text-sm uppercase">
                      Desaprobado
                    </span>
                  )}

                  <button
                    onClick={() => setSelectedExam(exam.id)}
                    className="px-4 py-2 bg-[#c41e3a] text-white rounded hover:bg-[#a01830] transition-colors text-xs uppercase tracking-wide"
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedExam && (
        <ExamModal
          enrollmentId={selectedExam}
          onClose={() => setSelectedExam(null)}
        />
      )}
    </div>
  )
}
