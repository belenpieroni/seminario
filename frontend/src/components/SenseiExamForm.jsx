import { useState } from "react"
import { CheckCircle } from "lucide-react"

export function SenseiExamForm({
  students,
  selectedStudentId,
  onRegisterExam
}) {
  const [examData, setExamData] = useState({
    studentId: selectedStudentId || "",
    belt: "",
    date: new Date().toISOString().split("T")[0],
    observations: ""
  })
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = e => {
    e.preventDefault()
    onRegisterExam(examData)
    setShowSuccess(true)

    setTimeout(() => {
      setShowSuccess(false)
      setExamData({
        studentId: "",
        belt: "",
        date: new Date().toISOString().split("T")[0],
        observations: ""
      })
    }, 3000)
  }

  return (
    <div className="p-8">
      <h2 className="text-[#1a1a1a] mb-8">Registrar examen de graduación</h2>

      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-green-800">
              Certificado generado correctamente
            </h3>
          </div>
          <p className="text-green-700">
            Hash registrado en blockchain (testnet)
          </p>
          <p className="text-green-600 mt-2">
            Hash: 0x
            {Math.random()
              .toString(16)
              .substring(2, 15)}
            ...
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#1a1a1a] mb-2">Alumno</label>
            <select
              value={examData.studentId}
              onChange={e =>
                setExamData({ ...examData, studentId: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
              required
            >
              <option value="">Seleccionar alumno...</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#1a1a1a] mb-2">
              Graduación rendida
            </label>
            <select
              value={examData.belt}
              onChange={e => setExamData({ ...examData, belt: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
              required
            >
              <option value="">Seleccionar graduación...</option>
              <option value="Cinturón Blanco">Cinturón Blanco</option>
              <option value="Cinturón Amarillo">Cinturón Amarillo</option>
              <option value="Cinturón Naranja">Cinturón Naranja</option>
              <option value="Cinturón Verde">Cinturón Verde</option>
              <option value="Cinturón Azul">Cinturón Azul</option>
              <option value="Cinturón Marrón">Cinturón Marrón</option>
              <option value="Cinturón Negro">Cinturón Negro</option>
            </select>
          </div>

          <div>
            <label className="block text-[#1a1a1a] mb-2">
              Fecha del examen
            </label>
            <input
              type="date"
              value={examData.date}
              onChange={e => setExamData({ ...examData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
              required
            />
          </div>

          <div>
            <label className="block text-[#1a1a1a] mb-2">Observaciones</label>
            <textarea
              value={examData.observations}
              onChange={e =>
                setExamData({ ...examData, observations: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a] min-h-32"
              placeholder="Notas adicionales sobre el examen..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#c41e3a] text-white py-3 rounded-lg hover:bg-[#a01830] transition-colors"
          >
            Registrar examen
          </button>
        </form>
      </div>
    </div>
  )
}
