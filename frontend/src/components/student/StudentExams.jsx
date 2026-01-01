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
    const isEnrolled = enrollments.some(en => en.exam_id === e.id)

    return (
      <div key={e.id} className="bg-white shadow-lg border border-gray-200 rounded">
        {/* Header de la tarjeta */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#c41e3a]">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-[#1a1a1a] font-light uppercase tracking-wide">
              Examen en {e.location_dojo?.name || dojo.name}
            </h3>
          </div>
          <div className="text-sm text-gray-600 text-right">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#c41e3a]" />
              <span className="font-medium">{examDate.format("DD/MM/YYYY")}</span>
            </div>
            <p className="text-xs text-gray-500">
              Creado: {dayjs(e.created_at).format("DD/MM/YYYY HH:mm")}
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-3 text-sm">
          {e.observations && (
            <p className="text-gray-700">{e.observations}</p>
          )}

          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4 text-[#c41e3a]" />
            <span>Sede: <span className="font-medium">{e.location_dojo?.name || "Sede del dojo"}</span></span>
          </div>

          {/* Botón de acción */}
          {!isPast && (
            <div className="flex justify-end">
              {isEnrolled ? (
                <button
                  onClick={() => setSelectedExam(e.id)}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs uppercase tracking-wide"
                >
                  Inscripto
                </button>
              ) : (
                <button
                  onClick={() => setSelectedExam(e.id)}
                  className="px-4 py-2 bg-[#c41e3a] text-white rounded hover:bg-[#a01830] transition-colors text-xs uppercase tracking-wide"
                >
                  Detalle
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-8 space-y-8">
      {/* Próximos */}
      <div>
        <div className="flex items-center justify-between mb-6 border-b border-gray-300 pb-2">
          <h2 className="text-xl font-light uppercase tracking-wide text-[#1a1a1a]">
            Exámenes <span className="text-[#c41e3a]">próximos</span>
          </h2>
        </div>
        {upcomingExams.length === 0 ? (
          <p className="text-gray-500 italic">Aún no se ha programado un examen.</p>
        ) : (
          <div className="space-y-4">
            {upcomingExams.map(e => renderExamCard(e, false))}
          </div>
        )}
      </div>

      {/* Pasados */}
      <div>
        <div className="flex items-center justify-between mb-6 border-b border-gray-300 pb-2">
          <h2 className="text-xl font-light uppercase tracking-wide text-[#1a1a1a]">
            Exámenes <span className="text-[#c41e3a]">pasados</span>
          </h2>
        </div>
        {pastExams.length === 0 ? (
          <p className="text-gray-500 italic">Aún no se han realizado exámenes.</p>
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
