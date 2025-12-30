import { useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"
import { ClipboardList, Calendar, MapPin } from "lucide-react"
import dayjs from "dayjs"
import { ExamDetail } from "./ExamModal"

export function StudentExams() {
  const [student, setStudent] = useState(null)
  const [dojo, setDojo] = useState(null)
  const [exams, setExams] = useState([])
  const [enrollments, setEnrollments] = useState([]) // 👈 inscripciones
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return setLoading(false)

      const { data: studentData } = await supabase
        .from("student")
        .select("id, dojo_id, current_belt")
        .eq("user_id", user.id)
        .single()

      if (!studentData) return setLoading(false)
      setStudent(studentData)

      const { data: dojoData } = await supabase
        .from("dojo")
        .select("id, name")
        .eq("id", studentData.dojo_id)
        .single()
      setDojo(dojoData)

      const { data: examData } = await supabase
        .from("exam")
        .select(`
          id,
          exam_date,
          created_at,
          observations,
          location_dojo:location_dojo_id(name)
        `)
        .eq("dojo_id", studentData.dojo_id)
        .order("exam_date", { ascending: true })

      setExams(examData || [])

      // Traer inscripciones del alumno
      const { data: enrollmentData } = await supabase
        .from("exam_enrollment")
        .select("id, belt, exam_id")
        .eq("student_id", studentData.id)

      setEnrollments(enrollmentData || [])

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-8 text-gray-500">Cargando exámenes…</div>
  if (!student || !dojo) return <div className="p-8 text-gray-500">No se pudo cargar los exámenes.</div>

  const today = dayjs()
  const upcomingExams = exams.filter(e => !dayjs(e.exam_date).isBefore(today, "day"))
  const pastExams = exams.filter(e => dayjs(e.exam_date).isBefore(today, "day"))

  const renderExamCard = (e, isPast) => {
    const examDate = dayjs(e.exam_date)
    const isEnrolled = enrollments.some(en => en.exam_id === e.id) // 👈 check inscripción

    return (
      <div key={e.id} className="bg-white shadow-md p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#c41e3a]" />
            <span className="font-medium">
              Examen en {e.location_dojo?.name || dojo.name}
            </span>
          </div>
          <div className="flex flex-col text-gray-700 text-sm items-end">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{examDate.format("DD/MM/YYYY")}</span>
            </div>
            <span className="text-gray-500">
              Creado: {dayjs(e.created_at).format("DD/MM/YYYY HH:mm")}
            </span>
          </div>
        </div>

        {e.observations && (
          <p className="mt-2 text-sm text-gray-600">{e.observations}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4" />
            <span>Sede: {e.location_dojo?.name || "Sede del dojo"}</span>
          </div>
          {!isPast && (
            isEnrolled ? (
              <button
                onClick={() => setSelectedExam(e.id)}
                className="px-4 py-2 bg-green-200 text-green-800 rounded"
              >
                Inscripto
              </button>
            ) : (
              <button
                onClick={() => setSelectedExam(e.id)}
                className="px-4 py-2 bg-[#c41e3a] text-white rounded hover:bg-[#a01830] transition-colors"
              >
                Detalle
              </button>
            )
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Próximos */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Exámenes próximos</h2>
        {upcomingExams.length === 0 ? (
          <p className="text-gray-500">Aún no se ha programado un examen.</p>
        ) : (
          <div className="space-y-4">
            {upcomingExams.map(e => renderExamCard(e, false))}
          </div>
        )}
      </div>

      {/* Pasados */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Exámenes pasados</h2>
        {pastExams.length === 0 ? (
          <p className="text-gray-500">Aún no se han realizado exámenes.</p>
        ) : (
          <div className="space-y-4">
            {pastExams.map(e => renderExamCard(e, true))}
          </div>
        )}
      </div>

      {selectedExam && (
        <ExamDetail
          examId={selectedExam}
          studentId={student.id}
          onClose={() => setSelectedExam(null)}
        />
      )}
    </div>
  )
}
