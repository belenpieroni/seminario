import { useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"
import { Bell, Calendar, MapPin, X } from "lucide-react"
import dayjs from "dayjs"

export function StudentNotifications() {
  const [student, setStudent] = useState(null)
  const [dojo, setDojo] = useState(null)
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const [enrolling, setEnrolling] = useState(false)

  const belts = ["blanco", "amarillo", "naranja", "verde", "azul", "marrón", "negro"]

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return setLoading(false)

      const { data: studentData } = await supabase
        .from("student")
        .select("id, current_belt, dojo_id")
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

      const todayISO = dayjs().format("YYYY-MM-DD")
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
        .gte("exam_date", todayISO)
        .order("exam_date", { ascending: true })

      setExams(examData || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const getNextBelt = (current) => {
    const idx = belts.indexOf(current?.toLowerCase())
    return idx >= 0 && idx < belts.length - 1 ? belts[idx + 1] : current
  }

  const handleConfirmEnroll = async () => {
    if (!student?.id || !selectedExam) return
    setEnrolling(true)

    const nextBelt = getNextBelt(student.current_belt)

    const { error } = await supabase
      .from("exam_enrollment")
      .insert({
        exam_id: selectedExam.id,
        student_id: student.id,
        belt: nextBelt,
      })

    setEnrolling(false)
    setShowConfirm(false)
    setSelectedExam(null)

    if (error) {
      console.error("Error en inscripción:", error.message)
      alert("No se pudo inscribir. Verificá si ya estabas inscripto.")
    } else {
      alert("Inscripción realizada con éxito.")
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Cargando notificaciones…</div>
  if (!student || !dojo) return <div className="p-8 text-gray-500">No se pudo cargar las notificaciones.</div>

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-[#1a1a1a] text-2xl font-semibold">Notificaciones</h2>

      <div className="space-y-4">
        {exams.length === 0 ? (
          <p className="text-gray-500">No hay exámenes próximos en tu dojo.</p>
        ) : (
          exams.map((e) => (
            <div key={e.id} className="bg-white shadow-md p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#c41e3a]" />
                  <span className="font-medium">
                    Examen en {e.location_dojo?.name || dojo.name}
                  </span>
                </div>
                <div className="flex flex-col text-gray-700 text-sm items-end">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{dayjs(e.exam_date).format("DD/MM/YYYY")}</span>
                  </div>
                  <span className="text-gray-500">
                    Notificado: {dayjs(e.created_at).format("DD/MM/YYYY HH:mm")}
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
                <button
                  className="bg-[#c41e3a] text-white px-4 py-2 rounded hover:bg-[#a01830]"
                  onClick={() => {
                    setSelectedExam(e)
                    setShowConfirm(true)
                  }}
                >
                  Inscribirme
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirm && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white shadow-lg w-full max-w-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-[#1a1a1a] text-lg">Confirmar inscripción</h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Info */}
            <div className="p-6 space-y-4">
              <p>
                ¿Está seguro que quiere inscribirse al examen del{" "}
                <strong>{dayjs(selectedExam.exam_date).format("DD/MM/YYYY")}</strong>{" "}
                en el dojo{" "}
                <strong>{selectedExam.location_dojo?.name || dojo.name}</strong>{" "}
                para rendir el cinturón{" "}
                <strong>{getNextBelt(student.current_belt)}</strong>?
              </p>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-8 py-3 bg-gray-400 text-white hover:bg-gray-500 transition-colors rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmEnroll}
                disabled={enrolling}
                className="px-8 py-3 bg-[#c41e3a] text-white hover:bg-[#a01830] transition-colors rounded-md"
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
