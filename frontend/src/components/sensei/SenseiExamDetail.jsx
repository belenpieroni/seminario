import { useEffect, useState } from "react"
import { getExamDetail } from "../../queries/examQueries"
import { Calendar, MapPin, Plus } from "lucide-react"
import { BackButton } from "../common/BackButton"
import SenseiExamResultForm from "./SenseiExamResultForm"

export default function SenseiExamDetail({ examId, onBack }) {
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      const detail = await getExamDetail(examId)
      setExam(detail)
      setLoading(false)
    }
    fetchDetail()
  }, [examId])

  if (loading) return <p className="p-8 text-gray-600">Cargando detalle...</p>
  if (!exam) return <p className="p-8 text-gray-600">No se encontró el examen.</p>

  return (
    <div className="p-8">
      <BackButton onBack={onBack} />

      <h2 className="text-2xl font-light uppercase tracking-wide text-[#1a1a1a] mb-6">
        Detalle del <span className="text-[#c41e3a]">Examen</span>
      </h2>

      <div className="flex items-center gap-3 mb-4 text-gray-700">
        <Calendar className="w-5 h-5 text-[#c41e3a]" />
        <span className="font-medium">{exam.date}</span>
      </div>

      <div className="flex items-center gap-3 mb-6 text-gray-700">
        <MapPin className="w-5 h-5 text-[#c41e3a]" />
        <span className="font-medium">Sede: {exam.locationDojo}</span>
      </div>

      <h3 className="text-lg font-light uppercase tracking-wide text-[#1a1a1a] mb-4">
        Alumnos Inscriptos:{" "}
        <span className="text-[#c41e3a] font-semibold">{exam.enrollments.length}</span>
      </h3>

      <div className="bg-white shadow-lg border border-gray-200 overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-[#1a1a1a] text-white uppercase tracking-wide text-xs">
            <tr className="text-left">
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Dojo</th>
              <th className="px-4 py-3 text-left">Cinturón actual</th>
              <th className="px-4 py-3 text-left">Cinturón a rendir</th>
              <th className="px-4 py-3 text-left">Acción</th>
            </tr>
          </thead>
          <tbody>
            {exam.enrollments.map((enr) => (
              <tr key={enr.id} className="border-b">
                <td className="p-2">{enr.studentName}</td>
                <td className="p-2">{enr.studentDojo}</td>
                <td className="p-2">{enr.currentBelt}</td>
                <td className="p-2">{enr.beltToRender}</td>
                <td className="px-6 py-4">
                <button
                  onClick={() => setSelectedEnrollment(enr)}
                  className="flex items-center gap-2 px-4 py-2 border border-[#c41e3a] text-[#c41e3a] uppercase text-xs tracking-wide hover:bg-[#c41e3a] hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal del formulario de resultados */}
      {selectedEnrollment && (
        <SenseiExamResultForm
          enrollment={selectedEnrollment}
          onClose={() => setSelectedEnrollment(null)}
        />
      )}
    </div>
  )
}
