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
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-[#1a1a1a] text-lg">Detalle del Examen</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Info */}
        <div className="p-6 space-y-4">
          <p><strong>Fecha:</strong> {dayjs(exam.exam_date).format("DD/MM/YYYY")}</p>
          <p><strong>Sede:</strong> {exam.location_dojo?.name}</p>
          {exam.location_dojo?.address && (
            <p><strong>Dirección:</strong> {exam.location_dojo.address}</p>
          )}
          {exam.location_dojo?.phone && (
            <p><strong>Teléfono:</strong> {exam.location_dojo.phone}</p>
          )}
          {exam.observations && <p><strong>Observaciones:</strong> {exam.observations}</p>}

          {enrollment ? (
            <>
              <p><strong>Estado inscripción:</strong> Ya inscripto</p>
              <p><strong>Cinturón:</strong> {enrollment.belt}</p>
            </>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={() => setShowConfirm(true)}
                disabled={enrolling}
                className="px-6 py-2 bg-[#c41e3a] text-white rounded hover:bg-[#a01830]"
              >
                Inscribirme
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Popup de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white shadow-lg w-full max-w-lg rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-[#1a1a1a] text-lg">Confirmación de Inscripción</h3>
              <button onClick={() => setShowConfirm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p>
                ¿Está seguro que quiere inscribirse al examen del{" "}
                <strong>{dayjs(exam.exam_date).format("DD/MM/YYYY")}</strong>{" "}
                para rendir el cinturón{" "}
                <strong>{getNextGrade(student?.current_belt)}</strong>{" "}
                en el dojo <strong>{exam.location_dojo?.name}</strong>?
              </p>
            </div>

            <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmEnroll}
                disabled={enrolling}
                className="px-6 py-2 bg-[#c41e3a] text-white rounded hover:bg-[#a01830]"
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
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-[#1a1a1a] text-lg">Detalle del Examen</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Información */}
        <div className="p-6 space-y-4">
          <p><strong>Dojo:</strong> {exam.dojo_name}</p>
          <p><strong>Sensei:</strong> {exam.sensei_name}</p>
          <p><strong>Cinturón rendido:</strong> {exam.belt}</p>
          <p><strong>Presente:</strong> {exam.present ? "Sí" : "No"}</p>

          {exam.present && (
            <>
              <p><strong>Kata:</strong> {exam.kata}</p>
              <p><strong>Kumite:</strong> {exam.kumite}</p>
              <p><strong>Kihon:</strong> {exam.kihon}</p>
              <p><strong>Nota final:</strong> {exam.final_grade}</p>
              <p><strong>Observaciones:</strong> {exam.observations}</p>
            </>
          )}

          <p>
            <strong>Estado:</strong>{" "}
            {exam.approved ? (
              <span className="text-green-600">Aprobado</span>
            ) : (
              <span className="text-red-600">Desaprobado</span>
            )}
          </p>
        </div>

        {/* Botón cerrar */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ExamHistory({ studentId }) {
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
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4">Historial de Exámenes</h2>
      {exams.length === 0 ? (
        <p className="text-gray-500">No hay exámenes registrados.</p>
      ) : (
        <ul className="space-y-4">
          {exams.map((exam) => (
            <li
              key={exam.id}
              className="flex justify-between items-center bg-gray-100 p-4 rounded"
            >
              <div>
                <p className="font-semibold">{exam.belt}</p>
                <p className="text-sm text-gray-600">{exam.date}</p>
              </div>
              <button 
                onClick={() => setSelectedExam(exam.id)}
                className="px-4 py-2 bg-[#c41e3a] text-white rounded hover:bg-[#a01830]" 
              > Ver detalle 
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedExam && (
        <ExamModal enrollmentId={selectedExam} onClose={() => setSelectedExam(null)} />
      )}
    </div>
  )
}
