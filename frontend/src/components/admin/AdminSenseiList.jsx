import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
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
        s.id === updated.id
          ? { ...s, ...updated } // ✅ clave
          : s
      )
    );

    setSelectedSensei(null);
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-8">Senseis a cargo</h2>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#1a1a1a] text-white">
            <tr>
              <th className="px-6 py-4 text-left">Nombre</th>
              <th className="px-6 py-4 text-left">Rango</th>
              <th className="px-6 py-4 text-left">Dojo</th>
              <th className="px-6 py-4 text-left">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {senseis.map(sensei => (
              <tr key={sensei.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{sensei.full_name}</td>
                <td className="px-6 py-4">{sensei.dan_grade}</td>
                <td className="px-6 py-4">
                  {sensei.dojo?.name || "-"}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedSensei(sensei)}
                    className="text-[#c41e3a] border border-[#c41e3a] px-4 py-2 rounded hover:bg-[#c41e3a] hover:text-white"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
