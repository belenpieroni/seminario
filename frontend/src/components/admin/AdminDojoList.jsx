import { useEffect, useState } from "react"
import { Building2, Edit2 } from "lucide-react"
import { getDojos } from "../../queries/dojoQueries"
import DojoManageModal from "./DojoManageModal"

export function AdminDojoList({ onEditDojo = () => {} }) {
  const [dojos, setDojos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDojoId, setSelectedDojoId] = useState(null);
  const [updateDojo, deleteDojo] = useState(null);

  useEffect(() => {
    async function fetchDojos() {
      const data = await getDojos()
      setDojos(data)
      setLoading(false)
    }

    fetchDojos()
  }, [])

  if (loading) {
    return (
      <div className="p-8 text-gray-500">
        Cargando dojos...
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-300 pb-4">
        <h2 className="text-2xl font-light uppercase tracking-wide text-[#1a1a1a]">
          Dojos <span className="text-[#c41e3a]">registrados</span>
        </h2>
      </div>

      {dojos.length === 0 && (
        <p className="text-gray-500 italic">No hay dojos registrados</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dojos.map(dojo => (
          <div
            key={dojo.id}
            className="bg-white shadow-lg border border-gray-200 rounded"
          >
            {/* Header tarjeta */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="p-2 bg-[#c41e3a]">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-[#1a1a1a] font-light uppercase tracking-wide">
                {dojo.name}
              </h3>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Sensei a cargo</p>
                <p className="text-[#1a1a1a] font-medium">{dojo.senseiInCharge}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Senseis</p>
                  <p className="text-[#1a1a1a] font-medium">{dojo.totalSenseis}</p>
                </div>
                <div>
                  <p className="text-gray-600">Alumnos</p>
                  <p className="text-[#1a1a1a] font-medium">{dojo.totalStudents}</p>
                </div>
              </div>
            </div>

            {/* Botón */}
            <div className="px-6 pb-6">
              <button
                className="w-full flex items-center justify-center gap-2 text-[#c41e3a] border border-[#c41e3a] py-2 rounded hover:bg-[#c41e3a] hover:text-white transition-colors text-xs uppercase tracking-wide"
                onClick={() => setSelectedDojoId(dojo.id)}
              >
                <Edit2 className="w-4 h-4" />
                Gestionar
              </button>
            </div>

            {selectedDojoId && (
              <DojoManageModal
                dojoId={selectedDojoId}
                onClose={() => setSelectedDojoId(null)}
                onSave={updateDojo}
                onDelete={deleteDojo}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}