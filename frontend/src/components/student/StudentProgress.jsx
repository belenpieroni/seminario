import { useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"
import dayjs from "dayjs"
import { Award, CheckCircle, XCircle, HelpCircle } from "lucide-react"
import beltLogo from "../../assets/logo.svg" // usa tu logo de cinturón

// Orden y colores de cinturones
const BELTS = [
  { name: "Cinturón Blanco", class: "bg-white border border-gray-300 text-gray-700" },
  { name: "Cinturón Amarillo", class: "bg-yellow-400 text-yellow-900" },
  { name: "Cinturón Naranja", class: "bg-orange-500 text-orange-50" },
  { name: "Cinturón Verde", class: "bg-green-600 text-green-50" },
  { name: "Cinturón Azul", class: "bg-blue-600 text-blue-50" },
  { name: "Cinturón Marrón", class: "bg-amber-800 text-amber-50" },
  { name: "Cinturón Negro", class: "bg-black text-white" },
]

const beltIndex = (belt) => BELTS.findIndex(b => b.name === belt)
const progressPercent = (belt) => {
  const idx = beltIndex(belt)
  return idx < 0 ? 0 : Math.round((idx / (BELTS.length - 1)) * 100)
}

export function StudentProgress() {
  const [student, setStudent] = useState(null)
  const [examHistory, setExamHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true)

      // Usuario logueado
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return setLoading(false)

      // Alumno
      const { data: studentData } = await supabase
        .from("student")
        .select("id, full_name, current_belt, dojo_id")
        .eq("user_id", user.id)
        .single()

      if (!studentData) return setLoading(false)
      setStudent(studentData)

      // Historial desde exam_result + enrollment + exam
      const { data: results } = await supabase
        .from("exam_result")
        .select(`
          id,
          final_grade,
          observations,
          present,
          recorded_at,
          enrollment:enrollment_id (
            target_belt,               -- ⚠️ ajustá este campo al real de tu tabla (ej. target_belt)
            exam:exam_id (
              exam_date,
              location:location_dojo_id (name)
            )
          )
        `)
        .eq("enrollment.student_id", studentData.id)

      const mapped = (results || []).map(r => ({
        id: r.id,
        // El cinturón objetivo se lee de enrollment.target_belt (ajustá el nombre si es distinto)
        belt: r.enrollment?.target_belt || "Cinturón desconocido",
        date: dayjs(r.enrollment?.exam?.exam_date).format("DD/MM/YYYY"),
        dojo: r.enrollment?.exam?.location?.name || "Dojo desconocido",
        grade: r.final_grade, // A/B/C... según tu enum
        status: !r.present ? "Ausente" : r.final_grade === "A" ? "Aprobado" : "Desaprobado",
        observations: r.observations || "",
      }))

      setExamHistory(mapped)
      setLoading(false)
    }

    fetchProgress()
  }, [])

  if (loading) return <div className="p-8 text-gray-500">Cargando progreso…</div>
  if (!student) return <div className="p-8 text-gray-500">No se pudo cargar el progreso.</div>

  const currentIdx = beltIndex(student.current_belt)
  const currentBeltClass = currentIdx >= 0 ? BELTS[currentIdx].class : "bg-gray-200 text-gray-700"
  const percent = progressPercent(student.current_belt)

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-[#1a1a1a] text-2xl font-semibold mb-4">Mi Progreso</h2>

      {/* Header: cinturón + progreso */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cinturón actual */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#c41e3a] flex items-center gap-4">
          <div className={`w-20 h-20 rounded-lg flex items-center justify-center ${currentBeltClass}`}>
            {/* Logo del cinturón, se puede tintar con opacity si tu SVG no admite fill-current */}
            <img src={beltLogo} alt="Cinturón" className="w-12 h-12 opacity-90" />
          </div>
          <div>
            <p className="text-gray-600">Graduación actual</p>
            <p className="text-[#1a1a1a] font-medium">{student.current_belt || "Desconocida"}</p>
          </div>
        </div>

        {/* Barra de progreso hacia el negro */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#c41e3a] md:col-span-2">
          <p className="text-gray-600 mb-2">Progreso hacia Cinturón Negro</p>
          <div className="w-full h-4 bg-gray-200 rounded">
            <div
              className="h-4 bg-[#c41e3a] rounded"
              style={{ width: `${percent}%` }}
              aria-label={`Progreso ${percent}%`}
            />
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-600">
            <span>Inicio</span>
            <span>{percent}%</span>
            <span>Negro</span>
          </div>

          {/* Etapas con marcas */}
          <div className="mt-4 flex items-center gap-2">
            {BELTS.map((b, idx) => (
              <div key={b.name} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full border ${
                    idx <= currentIdx ? "bg-[#c41e3a] border-[#c41e3a]" : "bg-white border-gray-300"
                  }`}
                  title={b.name}
                />
                {idx < BELTS.length - 1 && <div className="w-10 h-[2px] bg-gray-300" />}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">Etapa actual: {BELTS[currentIdx]?.name || "N/D"}</p>
        </div>
      </div>

      {/* Historial de exámenes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-[#1a1a1a] mb-4">Historial de exámenes</h3>

        {examHistory.length === 0 ? (
          <p className="text-gray-600">Aún no registrás exámenes.</p>
        ) : (
          <div className="space-y-3">
            {examHistory.map(exam => (
              <div
                key={exam.id}
                className="flex items-center justify-between p-4 border rounded hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                    <Award className="w-6 h-6 text-[#c41e3a]" />
                  </div>
                  <div>
                    <p className="text-[#1a1a1a] font-medium">
                      {exam.belt || "Cinturón desconocido"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {exam.date} • {exam.dojo}
                    </p>
                    {exam.observations && (
                      <p className="text-xs text-gray-500 mt-1">{exam.observations}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {exam.status === "Aprobado" && (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 text-sm">Aprobado</span>
                    </>
                  )}
                  {exam.status === "Desaprobado" && (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-700 text-sm">Desaprobado</span>
                    </>
                  )}
                  {exam.status === "Ausente" && (
                    <>
                      <HelpCircle className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700 text-sm">Ausente</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
