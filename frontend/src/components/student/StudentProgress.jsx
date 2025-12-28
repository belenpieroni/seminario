import { useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import ExamHistory from "./ExamModal"
import beltWebp from "../../assets/belt.webp"

ChartJS.register(ArcElement, Tooltip, Legend)

const LEVELS = [
  { name: "Blanco", color: "#e5e7eb" },
  { name: "Amarillo", color: "#facc15" },
  { name: "Naranja", color: "#fb923c" },
  { name: "Verde", color: "#16a34a" },
  { name: "Azul", color: "#2563eb" },
  { name: "Marrón", color: "#92400e" },
  { name: "Negro", color: "#111827" },
]

const normalize = (s) => (s || "").toString().trim().toLowerCase()
const findLevelIndex = (belt) => {
  const n = normalize(belt)
  if (!n) return -1
  if (n.includes("dan") || n === "negro") return LEVELS.length - 1
  return LEVELS.findIndex(l => n === l.name.toLowerCase() || n.includes(l.name.toLowerCase()))
}

function BeltMask({ colorHex, size = 280 }) {
  const styleMask = {
    width: size,
    height: Math.round(size * 0.45),
    backgroundColor: colorHex,
    WebkitMaskImage: `url(${beltWebp})`,
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    WebkitMaskPosition: "center",
    maskImage: `url(${beltWebp})`,
    maskRepeat: "no-repeat",
    maskSize: "contain",
    maskPosition: "center",
    display: "block",      
    margin: "0 auto",       
  }
  return <div style={styleMask} />
}

export default function StudentProgress() {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return setLoading(false)

      const { data: studentData } = await supabase
        .from("student")
        .select("id, full_name, current_belt")
        .eq("user_id", user.id)
        .single()

      if (!studentData) return setLoading(false)
      setStudent(studentData)
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <div className="p-8 text-gray-500">Cargando…</div>
  if (!student) return <div className="p-8 text-gray-500">No se pudo cargar el alumno.</div>

  const idx = findLevelIndex(student.current_belt)
  const currentColor = idx >= 0 ? LEVELS[idx].color : "#9ca3af"
  const isDanOrBlack = normalize(student.current_belt).includes("dan") || normalize(student.current_belt) === "negro"

  const chartData = {
    labels: LEVELS.map(l => l.name),
    datasets: [
      {
        data: LEVELS.map(() => 1),
        backgroundColor: LEVELS.map((l, i) =>
          i <= idx || isDanOrBlack ? l.color : "#f3f4f6"
        ),
        borderWidth: 2,
        borderColor: "#9ca3af", // gris para que el blanco se vea delimitado
      },
    ],
  }

  const chartOptions = {
    rotation: -90,
    circumference: 180,
    plugins: { legend: { display: false } },
  }

  const titleColor = student.current_belt?.toLowerCase().includes("blanco")
    ? "#111827"
    : currentColor

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-[#1a1a1a] text-2xl font-semibold">Mi Progreso</h2>
      <div className="bg-white p-8 rounded-lg w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">        
          {/* Columna izquierda: título + cinturón */}
          <div className="flex flex-col items-center gap-6">
            <h2
              className="text-4xl font-bold text-center"
              style={{ color: titleColor }}
            >
              {student.current_belt || "Nivel desconocido"}
            </h2>
            <BeltMask colorHex={currentColor} size={450} />
          </div>

          {/* Columna derecha: título "Progreso" + gráfico */}
          <div className="flex flex-col items-center gap-6 w-full">
            <h3
              className="text-3xl font-semibold text-center"
              style={{
                color: student.current_belt?.toLowerCase().includes("blanco")
                  ? "#111827"
                  : currentColor,
              }}
            >
              Progreso
            </h3>
            <div style={{ width: 350, height: 200 }}>
              <Doughnut
                data={{
                  ...chartData,
                  datasets: chartData.datasets.map((ds) => ({
                    ...ds,
                    borderWidth: 2,
                    borderColor: "#9ca3af",
                  })),
                }}
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <ExamHistory studentId={student.id} />
    </div>
  )
}
