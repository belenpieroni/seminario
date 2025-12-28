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

      <h2 className="text-2xl font-semibold mb-6">Detalle del Examen</h2>

      <div className="flex items-center gap-4 mb-4 text-gray-700">
        <Calendar className="w-5 h-5 text-[#c41e3a]" />
        <span>{exam.date}</span>
      </div>

      <div className="flex items-center gap-4 mb-4 text-gray-700">
        <MapPin className="w-5 h-5 text-[#c41e3a]" />
        <span>Sede: {exam.locationDojo}</span>
      </div>

      <h3 className="text-xl font-medium mb-4">
        Alumnos Inscriptos: {exam.enrollments.length}
      </h3>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Nombre</th>
            <th className="p-2">Dojo</th>
            <th className="p-2">Cinturón actual</th>
            <th className="p-2">Cinturón a rendir</th>
            <th className="p-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          {exam.enrollments.map((enr) => (
            <tr key={enr.id} className="border-b">
              <td className="p-2">{enr.studentName}</td>
              <td className="p-2">{enr.studentDojo}</td>
              <td className="p-2">{enr.currentBelt}</td>
              <td className="p-2">{enr.beltToRender}</td>
              <td className="p-2">
                <button
                  onClick={() => setSelectedEnrollment(enr)}
                  className="bg-[#c41e3a] text-white p-2 rounded hover:bg-[#a01830]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
