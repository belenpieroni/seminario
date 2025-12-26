import { useEffect, useState } from "react"
import CreateExamForm from "./CreateExamForm"
import SenseiExamDetail from "./SenseiExamDetail"
import { Calendar, MapPin, Users, Plus } from "lucide-react"
import { supabase } from "../../supabaseClient"
import dayjs from "dayjs"

export default function SenseiExamList({ senseiId, onViewDetail }) {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [sensei, setSenseiId] = useState("")
  const [selectedExamId, setSelectedExamId] = useState(null)

  const getStatus = (examDate) => {
    const today = dayjs().format("YYYY-MM-DD")
    if (examDate > today) return "próximo"
    if (examDate === today) return "en curso"
    return "finalizado"
  }

  const getStatusColor = (status) => {
    if (status === "próximo") return "bg-blue-100 text-blue-800"
    if (status === "en curso") return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  const getStatusText = (status) => {
    if (status === "próximo") return "Próximo"
    if (status === "en curso") return "En curso"
    return "Finalizado"
  }
  useEffect(() => {
    const fetchSenseiId = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return

      const { data: sensei } = await supabase
        .from("sensei")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (sensei?.id) {
        setSenseiId(sensei.id)
      }
    }

    fetchSenseiId()
  }, [])


  useEffect(() => {
    const fetchExams = async () => {
      if (!sensei) {
        setExams([])
        setLoading(false)
        return
      }

      setLoading(true)
      const { data, error } = await supabase
        .from("exam")
        .select(`
          id,
          exam_date,
          observations,
          location:location_dojo_id (name),  
          dojo:dojo_id (name),
          enrollments:exam_enrollment(count)
        `)
        .eq("sensei_id", sensei)

      if (error) {
        console.error("Error cargando exámenes:", error)
      } else {
        const mapped = data.map((e) => ({
          id: e.id,
          date: dayjs(e.exam_date).format("DD/MM/YYYY"),
          dojo: e.location?.name || e.dojo?.name || "Dojo desconocido",
          enrolledCount: e.enrollments[0]?.count || 0,
          status: getStatus(e.exam_date),
        }))
        setExams(mapped)
      }
      setLoading(false)
    }

    fetchExams()
  }, [sensei])
  if (selectedExamId) {
    return(
      <SenseiExamDetail
      examId={selectedExamId}
      onBack={() => setSelectedExamId(null)}
      />
    )
  }

  return (
    <div className="p-8">
      {showCreateForm ? (
        <CreateExamForm
          senseiId={sensei}
          onBack={() => setShowCreateForm(false)}
          onExamCreated={(newExam) => {
            setShowCreateForm(false)
            setExams([...exams, {
              id: newExam.id,
              date: dayjs(newExam.exam_date).format("DD/MM/YYYY"),
              dojo: newExam.dojo?.name || "Dojo desconocido",
              enrolledCount: 0,
              status: getStatus(newExam.exam_date),
            }])
          }}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[#1a1a1a] text-2xl font-semibold">Exámenes</h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-[#c41e3a] text-white px-6 py-3 hover:bg-[#a01830] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear Examen
            </button>
          </div>

          {loading ? (
            <p className="text-gray-600">Cargando exámenes...</p>
          ) : exams.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No hay exámenes creados aún</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-[#c41e3a] text-white px-6 py-3 hover:bg-[#a01830] transition-colors"
              >
                Crear Primer Examen
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
                  onClick={() => setSelectedExamId(exam.id)}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <Calendar className="w-5 h-5 text-[#c41e3a]" />
                        <span className="text-lg font-medium">{exam.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-5 h-5 text-[#c41e3a]" />
                        <span>{exam.dojo}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm rounded ${getStatusColor(exam.status)}`}
                    >
                      {getStatusText(exam.status)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700 mb-4">
                    <Users className="w-5 h-5" />
                    <span>{exam.enrolledCount} inscriptos</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedExamId(exam.id)
                    }}
                    className="w-full bg-[#1a1a1a] text-white py-2 hover:bg-[#c41e3a] transition-colors"
                  >
                    Ver Detalles
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
