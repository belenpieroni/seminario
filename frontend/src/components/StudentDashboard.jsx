import { Award, Building2, User } from "lucide-react"
import { StudentBeltProgress } from "./StudentBeltProgress"

export function StudentDashboard({ student }) {
  if (!student) {
    return (
      <div className="p-8 text-gray-500">
        Cargando información del alumno...
      </div>
    );
  }
  return (
    <div className="p-8">
      <h2 className="text-[#1a1a1a] mb-8">Mi progreso</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#c41e3a]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#c41e3a] rounded-lg">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-gray-600">Graduación actual</p>
              <p className="text-[#1a1a1a] mt-1">{student.currentBelt}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#c41e3a]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#c41e3a] rounded-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-gray-600">Dojo</p>
              <p className="text-[#1a1a1a] mt-1">{student.dojo}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#c41e3a]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#c41e3a] rounded-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-gray-600">Sensei a cargo</p>
              <p className="text-[#1a1a1a] mt-1">{student.sensei}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <StudentBeltProgress
          currentBelt={student.currentBelt}
          examHistory={student.examHistory}
        />
      </div>

      {student.lastExam && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-[#1a1a1a] mb-4">Último examen rendido</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600 mb-1">Fecha</p>
              <p className="text-[#1a1a1a]">
                {new Date(student.lastExam.date).toLocaleDateString("es-AR")}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Graduación</p>
              <p className="text-[#1a1a1a]">{student.lastExam.belt}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Estado</p>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full">
                {student.lastExam.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
