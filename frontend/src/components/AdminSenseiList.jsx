import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { getHeadSenseis, getSenseisByDojo } from "../queries/senseiQueries";

export function AdminSenseiList({ onDeleteSensei, onAddSensei }) {
  const [senseis, setSenseis] = useState([]);
  const [selectedDojo, setSelectedDojo] = useState(null);

  // Traer solo senseis a cargo
  useEffect(() => {
    async function fetchSenseis() {
      const data = await getHeadSenseis();
      setSenseis(data);
    }
    fetchSenseis();
  }, []);

  const handleViewDetails = async (sensei) => {
    const dojoSenseis = await getSenseisByDojo(sensei.dojo.id);
    setSelectedDojo({ ...sensei, dojoSenseis });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[#1a1a1a] text-2xl font-semibold">Senseis a cargo</h2>
    </div>

      {/* Lista senseis a cargo */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#1a1a1a] text-white">
            <tr>
              <th className="px-6 py-4 text-left">Nombre y Apellido</th>
              <th className="px-6 py-4 text-left">Rango</th>
              <th className="px-6 py-4 text-left">Dojo</th>
              <th className="px-6 py-4 text-left">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {senseis.map((sensei) => (
              <tr key={sensei.id} className="border-b border-gray-200 hover:bg-[#f8f8f8]">
                <td className="px-6 py-4 text-[#1a1a1a]">{sensei.full_name}</td>
                <td className="px-6 py-4 text-gray-600">{sensei.dan_grade}</td>
                <td className="px-6 py-4 text-gray-600">{sensei.dojo.name}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => handleViewDetails(sensei)}
                    className="w-full flex items-center justify-center gap-2 text-[#c41e3a] border border-[#c41e3a] py-2 rounded-lg hover:bg-[#c41e3a] hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POP-UP DETALLES DEL DOJO */}
      {selectedDojo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 md:w-2/3 p-6 relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDojo(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">
              Senseis en {selectedDojo.dojo.name}
            </h3>
            <p className="mb-4">
              <strong>A Cargo:</strong> {selectedDojo.full_name} ({selectedDojo.dan_grade})
            </p>

            {selectedDojo.dojoSenseis.length > 0 ? (
              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Nombre</th>
                    <th className="px-4 py-2 text-left">Rango</th>
                    <th className="px-4 py-2 text-left">Registrado</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDojo.dojoSenseis.map((s) => (
                    <tr key={s.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{s.full_name}</td>
                      <td className="px-4 py-2">{s.dan_grade}</td>
                      <td className="px-4 py-2">{s.registered_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay otros senseis registrados en este dojo.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
