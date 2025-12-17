import { useEffect, useState } from "react";
import { X, Pencil, Check } from "lucide-react";
import { getDojoById, updateDojoField, deleteDojo } from "../queries/dojoQueries";

export default function DojoManageModal({ dojoId, onClose }) {
  const [dojo, setDojo] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadDojo() {
      const data = await getDojoById(dojoId);
      setDojo(data);
    }
    loadDojo();
  }, [dojoId]);

  if (!dojo) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6">Cargando dojo...</div>
      </div>
    );
  }

  const updateField = async (field, value) => {
    if (value === dojo[field]) {
      setEditingField(null);
      return;
    }

    try {
      setSaving(true);

      await updateDojoField(dojo.id, field, value);

      setDojo(prev => ({
        ...prev,
        [field]: value
      }));

      setEditingField(null);
    } catch (err) {
      alert("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de eliminar este dojo? Esta acción no se puede deshacer."
    );

    if (!confirmDelete) return;

    try {
      await deleteDojo(dojo.id);
      onClose(true); // refrescar lista
    } catch (err) {
      alert("No se pudo eliminar el dojo");
    }
  };

  const EditableRow = ({ label, field }) => {
    const isEditing = editingField === field;

    return (
      <div className="flex items-center justify-between bg-gray-50 p-4">
        <div className="flex-1">
          <p className="text-gray-600">{label}</p>

          {!isEditing ? (
            <p className="text-[#1a1a1a]">{dojo[field] || "-"}</p>
          ) : (
            <input
              className="mt-1 w-full px-2 py-1 border border-gray-300"
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
              autoFocus
            />
          )}
        </div>

        {!isEditing ? (
          <button
            onClick={() => {
              setEditingField(field);
              setTempValue(dojo[field] || "");
            }}
            className="text-gray-500 hover:text-[#c41e3a]"
          >
            <Pencil size={18} />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              disabled={saving}
              onClick={() => updateField(field, tempValue)}
              className="text-green-600"
            >
              <Check size={18} />
            </button>
            <button
              onClick={() => setEditingField(null)}
              className="text-gray-400"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-[#1a1a1a] text-lg font-semibold">
            Gestionar Dojo
          </h3>
          <button
            onClick={() => onClose(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info editable */}
          <div>
            <h4 className="text-[#1a1a1a] mb-3">Información del Dojo</h4>
            <div className="space-y-2">
              <EditableRow label="Nombre" field="name" />
              <EditableRow label="Dirección" field="address" />
              <EditableRow label="Localidad" field="city" />
              <EditableRow label="Provincia" field="province" />
              <EditableRow label="Teléfono" field="phone" />
            </div>
          </div>

          {/* Info fija */}
          <div>
            <h4 className="text-[#1a1a1a] mb-3">Datos generales</h4>
            <div className="bg-gray-50 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Sensei a cargo</span>
                <span className="text-[#1a1a1a]">
                  {dojo.senseiInCharge}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Senseis</span>
                <span className="text-[#1a1a1a]">
                  {dojo.totalSenseis}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Alumnos</span>
                <span className="text-[#1a1a1a]">
                  {dojo.totalStudents}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Eliminar dojo
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
  );
}
