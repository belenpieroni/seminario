import { useState, useEffect } from "react";
import { UserCheck, Eye } from "lucide-react";
import { getHeadSenseis } from "../../queries/senseiQueries";
import { SenseiHeadManageModal } from "./SenseiHeadManageModal";

export function AdminSenseiList() {
  const [senseis, setSenseis] = useState([]);
  const [selectedSensei, setSelectedSensei] = useState(null);

  useEffect(() => {
    async function fetchSenseis() {
      const data = await getHeadSenseis();
      setSenseis(data);
    }
    fetchSenseis();
  }, []);

  function handleUpdatedSensei(updated) {
    setSenseis(prev =>
      prev.map(s =>
        s.id === updated.id ? { ...s, ...updated } : s
      )
    );
    setSelectedSensei(null);
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-300 pb-4">
        <h2 className="text-2xl font-light uppercase tracking-wide text-[#1a1a1a]">
          Senseis <span className="text-[#c41e3a]">a cargo</span>
        </h2>
      </div>

      {senseis.length === 0 ? (
        <p className="text-gray-500 italic">No hay senseis registrados</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {senseis.map(sensei => (
            <div
              key={sensei.id}
              className="bg-white shadow-lg border border-gray-200 rounded"
            >
              {/* Header tarjeta */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="p-2 bg-[#c41e3a]">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[#1a1a1a] font-light uppercase tracking-wide">
                  {sensei.full_name}
                </h3>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Rango</p>
                  <p className="text-[#1a1a1a] font-medium">{sensei.dan_grade}</p>
                </div>
                <div>
                  <p className="text-gray-600">Dojo</p>
                  <p className="text-[#1a1a1a] font-medium">{sensei.dojo?.name || "-"}</p>
                </div>
              </div>

              {/* Botón */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => setSelectedSensei(sensei)}
                  className="w-full flex items-center justify-center gap-2 text-[#c41e3a] border border-[#c41e3a] py-2 rounded hover:bg-[#c41e3a] hover:text-white transition-colors text-xs uppercase tracking-wide"
                >
                  <Eye className="w-4 h-4" />
                  Ver detalle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSensei && (
        <SenseiHeadManageModal
          senseiId={selectedSensei.id}
          onClose={() => setSelectedSensei(null)}
          onSave={handleUpdatedSensei}
        />
      )}
    </div>
  );
}
