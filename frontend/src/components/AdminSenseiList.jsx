import { useState } from "react"
import { Trash2, Plus } from "lucide-react"

export function AdminSenseiList({ senseis, onDeleteSensei, onAddSensei }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSensei, setNewSensei] = useState({
    name: "",
    dni: "",
    rank: "",
    dojo: ""
  })

  const handleSubmit = e => {
    e.preventDefault()
    onAddSensei(newSensei)
    setNewSensei({ name: "", dni: "", rank: "", dojo: "" })
    setShowAddForm(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[#1a1a1a]">Senseis registrados</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-[#c41e3a] text-white px-6 py-3 rounded-lg hover:bg-[#a01830] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Agregar Sensei
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-[#1a1a1a] mb-4">Nuevo Sensei</h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-[#1a1a1a] mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                value={newSensei.name}
                onChange={e =>
                  setNewSensei({ ...newSensei, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                required
              />
            </div>
            <div>
              <label className="block text-[#1a1a1a] mb-2">DNI</label>
              <input
                type="text"
                value={newSensei.dni}
                onChange={e =>
                  setNewSensei({ ...newSensei, dni: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                required
              />
            </div>
            <div>
              <label className="block text-[#1a1a1a] mb-2">Rango</label>
              <select
                value={newSensei.rank}
                onChange={e =>
                  setNewSensei({ ...newSensei, rank: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="1er Dan - Cinturón Negro">
                  1er Dan - Cinturón Negro
                </option>
                <option value="2do Dan - Cinturón Negro">
                  2do Dan - Cinturón Negro
                </option>
                <option value="3er Dan - Cinturón Negro">
                  3er Dan - Cinturón Negro
                </option>
                <option value="4to Dan - Cinturón Negro">
                  4to Dan - Cinturón Negro
                </option>
                <option value="5to Dan - Cinturón Negro">
                  5to Dan - Cinturón Negro
                </option>
              </select>
            </div>
            <div>
              <label className="block text-[#1a1a1a] mb-2">Dojo</label>
              <input
                type="text"
                value={newSensei.dojo}
                onChange={e =>
                  setNewSensei({ ...newSensei, dojo: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                required
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-[#c41e3a] text-white px-6 py-2 rounded-lg hover:bg-[#a01830] transition-colors"
              >
                Guardar Sensei
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-[#1a1a1a] px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#1a1a1a] text-white">
            <tr>
              <th className="px-6 py-4 text-left">Nombre</th>
              <th className="px-6 py-4 text-left">DNI</th>
              <th className="px-6 py-4 text-left">Rango</th>
              <th className="px-6 py-4 text-left">Dojo</th>
              <th className="px-6 py-4 text-left">Cargo</th>
              <th className="px-6 py-4 text-left">Acción</th>
            </tr>
          </thead>
          <tbody>
            {senseis.map(sensei => (
              <tr
                key={sensei.id}
                className="border-b border-gray-200 hover:bg-[#f8f8f8]"
              >
                <td className="px-6 py-4 text-[#1a1a1a]">{sensei.name}</td>
                <td className="px-6 py-4 text-gray-600">{sensei.dni}</td>
                <td className="px-6 py-4 text-gray-600">{sensei.rank}</td>
                <td className="px-6 py-4 text-gray-600">{sensei.dojo}</td>
                <td className="px-6 py-4">
                  {sensei.isInCharge ? (
                    <span className="px-3 py-1 bg-[#c41e3a] text-white rounded-full">
                      A cargo
                    </span>
                  ) : (
                    <span className="text-gray-500">Asistente</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {!sensei.isInCharge && (
                    <button
                      onClick={() => onDeleteSensei(sensei.id)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Dar de baja
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
