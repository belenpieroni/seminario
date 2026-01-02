import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getSenseiById, getSenseisByDojo, updateSensei } from "../../queries/senseiQueries";
import { EditableRow } from "../common/EditableRow";

export function SenseiManageModal({ senseiId, dojoId, onClose, onSave }) {
  const [sensei, setSensei] = useState(null);
  const [saving, setSaving] = useState(false);
  const DAN_GRADES = [
    "1er Dan",
    "2do Dan",
    "3er Dan",
    "4to Dan",
    "5to Dan",
    "6to Dan",
    "7mo Dan",
    "8vo Dan",
    "9no Dan",
  ]
  useEffect(() => {
    async function load() {
      const data = await getSenseiById(senseiId);
      setSensei(data);
    }
    load();
  }, [senseiId]);

  if (!sensei) return null;

  async function handleDelete() {
    setSaving(true);
    try {
        await updateSensei(sensei.id, { is_active: false });
        const refreshed = await getSenseisByDojo(dojoId);
        onSave(refreshed);
        onClose(true);
    } catch (err) {
        console.error("Error al eliminar sensei:", err);
    } finally {
        setSaving(false);
    }
  }

  async function updateField(field, value) {
    const updated = await updateSensei(sensei.id, { [field]: value });

    const merged = {
      ...sensei,
      [field]: updated[field],
    };

    setSensei(merged);

    onSave({
      id: sensei.id,
      full_name: merged.full_name,
      dan_grade: merged.dan_grade,
      registered_at: merged.registered_at,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl shadow-lg relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold">Gestionar Sensei</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Nombre y apellido */}
          <EditableRow
            label="Nombre y Apellido"
            value={sensei.full_name}
            onSave={(v) => updateField("full_name", v)}
          />

          {/* Grado (Dan) como select */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600 uppercase tracking-wide">Grado (Dan)</label>
            <div className="flex gap-2 items-center">
              <select
                value={sensei.dan_grade || ""}
                onChange={(e) => updateField("dan_grade", e.target.value)}
                className="px-3 py-2 border rounded"
                disabled={saving}
              >
                <option value="">Seleccionar grado</option>
                {DAN_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500">
                Actual: <span className="font-medium">{sensei.dan_grade || "-"}</span>
              </span>
            </div>
          </div>

          {/* Registrado en el sistema */}
          <div className="flex justify-between items-center bg-gray-50 p-3">
            <div>
              <p className="text-gray-600">Registrado el</p>
              {sensei.registered_at
                ? new Date(sensei.registered_at).toLocaleDateString("es-AR")
                : "-"}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200">
            <button
              onClick={handleDelete}
              className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors"
              disabled={saving}
            >
              Eliminar sensei
            </button>

            <button
              onClick={() => onClose(false)}
              className="px-6 py-3 bg-gray-400 text-white hover:bg-gray-500 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}