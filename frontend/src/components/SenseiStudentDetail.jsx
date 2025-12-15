import { ArrowLeft, Plus } from "lucide-react"

export function SenseiStudentDetail({ student, onBack, onRegisterExam }) {
  return (
    <div className="p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#c41e3a] hover:text-[#a01830] mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver al listado
      </button>

      <h2 className="text-[#1a1a1a] mb-8">Perfil del alumno</h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-[#1a1a1a] mb-4 pb-3 border-b border-gray-200">
          Datos personales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 mb-1">Nombre completo</p>
            <p className="text-[#1a1a1a]">{student.name}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">DNI</p>
            <p className="text-[#1a1a1a]">{student.dni}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Dojo</p>
            <p className="text-[#1a1a1a]">{student.dojo}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Graduación actual</p>
            <p className="text-[#1a1a1a]">{student.currentBelt}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-[#1a1a1a] mb-4 pb-3 border-b border-gray-200">
          Historial de exámenes
        </h3>

        {student.examHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8f8f8]">
                <tr>
                  <th className="px-6 py-3 text-left text-[#1a1a1a]">Fecha</th>
                  <th className="px-6 py-3 text-left text-[#1a1a1a]">
                    Graduación
                  </th>
                  <th className="px-6 py-3 text-left text-[#1a1a1a]">Estado</th>
                </tr>
              </thead>
              <tbody>
                {student.examHistory.map((exam, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(exam.date).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{exam.belt}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">
            No hay exámenes registrados
          </p>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => onRegisterExam(student.id)}
            className="flex items-center gap-2 bg-[#c41e3a] text-white px-6 py-3 rounded-lg hover:bg-[#a01830] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Registrar nuevo examen
          </button>
        </div>
      </div>
    </div>
  )
}
