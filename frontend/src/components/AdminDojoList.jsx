import { Building2, Edit2 } from "lucide-react"

export function AdminDojoList({ dojos, onEditDojo = () => {} }) {
  return (
    <div className="p-8">
      <h2 className="text-[#1a1a1a] mb-8">Dojos registrados</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dojos.map(dojo => (
          <div
            key={dojo.id}
            className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#c41e3a]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#c41e3a] rounded-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-[#1a1a1a]">{dojo.name}</h3>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-gray-600">Sensei a cargo</p>
                <p className="text-[#1a1a1a]">{dojo.senseiInCharge}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-600">Senseis</p>
                  <p className="text-[#1a1a1a]">{dojo.totalSenseis}</p>
                </div>
                <div>
                  <p className="text-gray-600">Alumnos</p>
                  <p className="text-[#1a1a1a]">{dojo.totalStudents}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onEditDojo(dojo.id)}
              className="w-full flex items-center justify-center gap-2 text-[#c41e3a] border border-[#c41e3a] py-2 rounded-lg hover:bg-[#c41e3a] hover:text-white transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Gestionar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
