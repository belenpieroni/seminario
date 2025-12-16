import { useEffect, useState } from "react"
import { Building2, Edit2 } from "lucide-react"
import { getDojos } from "../queries/dojoQueries"

export function AdminDojoList({ onEditDojo = () => {} }) {
  const [dojos, setDojos] = useState([])
  const [loading, setLoading] = useState(true)

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
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[#1a1a1a] text-2xl font-semibold">Dojos registrados</h2>
      </div>

      {dojos.length === 0 && (
        <p className="text-gray-500">No hay dojos registrados</p>
      )}

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
              <h3 className="text-[#1a1a1a]">Dojo {dojo.name}</h3>
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
