import { useEffect, useState } from "react"
import { getStudentsByDojo } from "../../queries/studentQueries"
import { supabase } from "../../supabaseClient"

  const BELTS_ORDER = [
    "Blanco",
    "Amarillo",
    "Naranja",
    "Verde",
    "Azul",
    "Marrón",
    "Negro",
    "1er Dan",
    "2do Dan",
    "3er Dan",
    "4to Dan",
    "5to Dan",
    "6to Dan",
    "7mo Dan",
    "8vo Dan",
    "9no Dan"
  ]

export default function SenseiEnrollmentStudent({ examId, dojoId, onClose, onEnrolled }) {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState("")
  const [belt, setBelt] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchStudents = async () => {
      const data = await getStudentsByDojo(dojoId)
      setStudents(data)
    }
    fetchStudents()
  }, [dojoId])

  // Cuando selecciono un alumno, calculo su próximo cinturón
  const handleSelectStudent = (studentId) => {
    setSelectedStudent(studentId)
    const student = students.find(st => st.id === studentId)
    if (student) {
      const currentIndex = BELTS_ORDER.indexOf(student.current_belt)
      const nextBelt = currentIndex >= 0 && currentIndex < BELTS_ORDER.length - 1
        ? BELTS_ORDER[currentIndex + 1]
        : student.current_belt // si ya es Negro, se queda igual
      setBelt(nextBelt)
    }
  }

    const handleEnroll = async () => {
    if (!selectedStudent || !belt) return
    setLoading(true)

    const { error } = await supabase
        .from("exam_enrollment")
        .insert({
        exam_id: examId,
        student_id: selectedStudent,
        belt,
        })

    setLoading(false)

    if (error) {
        if (error.code === "23505") {
        alert("El alumno ya se inscribió a este examen")
        } else {
        alert("Error inscribiendo alumno: " + error.message)
        }
    } else {
        alert("Alumno inscripto correctamente")
        onEnrolled()
        onClose()
    }
    }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[400px]">
        <h3 className="text-lg font-light uppercase tracking-wide text-[#1a1a1a] mb-4">
          Inscribir <span className="text-[#c41e3a]">Alumno</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm uppercase tracking-wide text-gray-600">
              Alumno
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
              value={selectedStudent}
              onChange={e => handleSelectStudent(e.target.value)}
            >
              <option value="">Seleccionar alumno</option>
              {students.map(st => (
                <option key={st.id} value={st.id}>
                  {st.full_name} ({st.current_belt})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm uppercase tracking-wide text-gray-600">
              Grado a rendir
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
              value={belt}
              readOnly
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-[#1a1a1a] uppercase text-xs tracking-wide hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleEnroll}
            disabled={loading}
            className="px-6 py-2 bg-[#c41e3a] text-white uppercase text-xs tracking-wide hover:bg-[#a01830] transition-colors"
          >
            {loading ? "Inscribiendo..." : "Inscribir"}
          </button>
        </div>
      </div>
    </div>
  )
}
