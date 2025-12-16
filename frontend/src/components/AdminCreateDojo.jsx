import { useState } from "react"
import { CheckCircle } from "lucide-react"

export default function AdminCreateDojo({ onCreateDojo }) {
  const [dojoData, setDojoData] = useState({
    name: "",
    senseiName: "",
    senseiDni: "",
    senseiRank: ""
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState("")

  const handleSubmit = e => {
    e.preventDefault()

    // Generar email del sensei
    const email = generateEmail(dojoData.senseiName, dojoData.name)
    setGeneratedEmail(email)

    onCreateDojo(dojoData)
    setShowSuccess(true)

    setTimeout(() => {
      setShowSuccess(false)
      setDojoData({
        name: "",
        senseiName: "",
        senseiDni: "",
        senseiRank: ""
      })
    }, 5000)
  }

  const generateEmail = (senseiName, dojoName) => {
    const nameParts = senseiName.toLowerCase().split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts[nameParts.length - 1] || ""
    const dojoSlug = dojoName.toLowerCase().replace(/\s+/g, "")
    return `${firstName}${lastName}@${dojoSlug}.com`
  }

  return (
    <div className="p-8">
      <h2 className="text-[#1a1a1a] mb-8">Crear nuevo Dojo</h2>

      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-green-800">Dojo creado exitosamente</h3>
          </div>
          <p className="text-green-700">
            Se ha asignado el sensei a cargo y se ha creado su usuario.
          </p>
          <div className="mt-4 p-3 bg-white rounded border border-green-300">
            <p className="text-gray-600">Email generado para el sensei:</p>
            <p className="text-[#1a1a1a] mt-1">{generatedEmail}</p>
            <p className="text-gray-600 mt-2">
              Contraseña temporal: Karate2025!
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#1a1a1a] mb-2">Nombre del Dojo</label>
            <input
              type="text"
              value={dojoData.name}
              onChange={e => setDojoData({ ...dojoData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
              placeholder="Ej: Sakura Karate Dojo"
              required
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-[#1a1a1a] mb-4">Sensei a cargo</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[#1a1a1a] mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={dojoData.senseiName}
                  onChange={e =>
                    setDojoData({ ...dojoData, senseiName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                  placeholder="Ej: Takeshi Yamamoto"
                  required
                />
              </div>

              <div>
                <label className="block text-[#1a1a1a] mb-2">DNI</label>
                <input
                  type="text"
                  value={dojoData.senseiDni}
                  onChange={e =>
                    setDojoData({ ...dojoData, senseiDni: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                  placeholder="Ej: 12345678"
                  required
                />
              </div>

              <div>
                <label className="block text-[#1a1a1a] mb-2">Rango</label>
                <select
                  value={dojoData.senseiRank}
                  onChange={e =>
                    setDojoData({ ...dojoData, senseiRank: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                  required
                >
                  <option value="">Seleccionar rango...</option>
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
                  <option value="6to Dan - Cinturón Negro">
                    6to Dan - Cinturón Negro
                  </option>
                  <option value="7mo Dan - Cinturón Negro">
                    7mo Dan - Cinturón Negro
                  </option>
                  <option value="8vo Dan - Cinturón Negro">
                    8vo Dan - Cinturón Negro
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800">
                Se creará un usuario con email:{" "}
                {dojoData.senseiName && dojoData.name
                  ? generateEmail(dojoData.senseiName, dojoData.name)
                  : "nombreapellido@nombredojo.com"}
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#c41e3a] text-white py-3 rounded-lg hover:bg-[#a01830] transition-colors"
            >
              Crear Dojo y asignar Sensei
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
