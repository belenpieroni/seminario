import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {  getSenseiById, getSenseisByDojo, updateSensei } from "../queries/senseiQueries";
import { EditableRow } from "./EditableRow"; 

export function SenseiManageModal({ senseiId, onClose, onSave }) {
  const [sensei, setSensei] = useState(null);
  const [dojoSenseis, setDojoSenseis] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await getSenseiById(senseiId);
      const dojoList = await getSenseisByDojo(data.dojo_id);

      setSensei(data);
      setDojoSenseis(dojoList);
    }

    load();
  }, [senseiId]);

  // 🔒 Protección obligatoria
  if (!sensei) return null;

  async function updateField(field, value) {
    const updated = await updateSensei(sensei.id, { [field]: value });

    // ✅ Mantener estructura local
    const merged = {
      ...sensei,
      [field]: updated[field]
    };

    setSensei(merged);

    // ✅ Avisar al padre SOLO los campos editados
    onSave({
      id: sensei.id,
      full_name: merged.full_name,
      dan_grade: merged.dan_grade
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl shadow-lg relative">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold">Gestionar Sensei</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <EditableRow
            label="Nombre"
            value={sensei.full_name}
            onSave={v => updateField("full_name", v)}
          />

          <EditableRow
            label="Grado Dan"
            value={sensei.dan_grade}
            onSave={v => updateField("dan_grade", v)}
          />

          <div>
            <h4 className="font-semibold mb-2">Senseis del dojo</h4>
            <ul className="bg-gray-50 p-4 space-y-1">
              {dojoSenseis.map(s => (
                <li key={s.id}>
                  {s.full_name} – {s.dan_grade}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
