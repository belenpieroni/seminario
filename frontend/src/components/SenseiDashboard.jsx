import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import { Users, ClipboardCheck, Calendar } from "lucide-react"

export function SenseiDashboard() {
  const [students, setStudents] = useState([])
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // 1. Obtener usuario logueado
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) {
        setLoading(false)
        return
      }

      // 2. Buscar el sensei asociado a ese user_id
      const { data: senseiRow } = await supabase
        .from("sensei")
        .select("id, dojo_id")
        .eq("user_id", user.id)
        .single()

      if (!senseiRow) {
        setLoading(false)
        return
      }

      // 3. Traer alumnos del dojo
      const { data: studentsData } = await supabase
        .from("student")
        .select("*")
        .eq("dojo_id", senseiRow.dojo_id)

      setStudents(studentsData || [])

      // 4. Traer exámenes del dojo
      const { data: examsData } = await supabase
        .from("exam")
        .select("*")
        .eq("dojo_id", senseiRow.dojo_id)

      setExams(examsData || [])

      setLoading(false)
    }

    fetchData()
  }, [])

  const totalStudents = students.length
  const totalExams = exams.length
  const lastExam = exams.length > 0 ? exams[exams.length - 1] : null

  const upcomingExams = [
    { date: "2025-12-20", student: "Carlos Méndez", belt: "Cinturón Verde" },
    { date: "2025-12-22", student: "Ana Torres", belt: "Cinturón Azul" }
  ]

  if (loading) {
    return <p className="p-8">Cargando datos...</p>
  }

  return (
    <div className="p-8">
      <h2 className="text-[#1a1a1a] mb-8">Panel del Sensei</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#c41e3a]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#c41e3a] rounded-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-gray-600">Alumnos registrados</p>
              <p className="text-[#1a1a1a] mt-1">{totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#c41e3a]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#c41e3a] rounded-lg">
              <ClipboardCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-gray-600">Exámenes realizados</p>
              <p className="text-[#1a1a1a] mt-1">{totalExams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#c41e3a]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#c41e3a] rounded-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-gray-600">Último examen tomado</p>
              <p className="text-[#1a1a1a] mt-1">
                {lastExam
                  ? new Date(lastExam.date).toLocaleDateString("es-AR")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-[#1a1a1a] mb-4">Próximos exámenes</h3>
        <div className="space-y-3">
          {upcomingExams.map((exam, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-[#f8f8f8] rounded-lg"
            >
              <div>
                <p className="text-[#1a1a1a]">{exam.student}</p>
                <p className="text-gray-600">{exam.belt}</p>
              </div>
              <div className="text-right">
                <p className="text-[#c41e3a]">
                  {new Date(exam.date).toLocaleDateString("es-AR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}