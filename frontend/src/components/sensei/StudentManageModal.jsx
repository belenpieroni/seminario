import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getStudentById, getStudentsByDojo, updateStudent } from "../../queries/studentQueries";
import { EditableRow } from "../common/EditableRow";

export function StudentManageModal({ studentId, dojoId, onClose, onSave }) {
  const [student, setStudent] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getStudentById(studentId);
      setStudent(data);
    }
    load();
  }, [studentId]);

  // 🔒 Protección obligatoria
  if (!student) return null;

  async function handleDelete() {
    setSaving(true);
    try {
      await updateStudent(student.id, { is_active: false });
      const refreshed = await getStudentsByDojo(dojoId);
      onSave(refreshed); 
      onClose(true); 
    } catch (err) {
      console.error("Error al eliminar alumno:", err);
    } finally {
      setSaving(false);
    }
  }

  async function updateField(field, value) {
    const updated = await updateStudent(student.id, { [field]: value });

    // ✅ Mantener estructura local
    const merged = {
      ...student,
      [field]: updated[field],
    };

    setStudent(merged);

    // ✅ Avisar al padre SOLO los campos editados
    onSave({
      id: student.id,
      full_name: merged.full_name,
      birth_date: merged.birth_date,
      current_belt: merged.current_belt,
    });
  }

  // Calcular edad
  const age = student.birth_date
    ? Math.floor(
        (Date.now() - new Date(student.birth_date).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : "-";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-light uppercase tracking-wide text-[#1a1a1a]">
            Gestionar <span className="text-[#c41e3a]">Alumno</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-[#c41e3a] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Nombre y apellido */}
          <EditableRow
            label="Nombre y Apellido"
            value={student.full_name}
            onSave={(v) => updateField("full_name", v)}
          />

          {/* Fecha de nacimiento */}
          <EditableRow
            label="Fecha de nacimiento"
            value={student.birth_date}
            type="date"
            onSave={(v) => updateField("birth_date", v)}
          />

          {/* Edad calculada */}
          <div className="flex justify-between items-center bg-gray-50 p-3 border border-gray-200">
            <div>
              <p className="text-gray-600 uppercase text-xs tracking-wide">Edad</p>
              <p className="text-[#1a1a1a] font-medium">{age}</p>
            </div>
          </div>

          {/* Cinturón actual */}
          <EditableRow
            label="Cinturón actual"
            value={student.current_belt}
            onSave={(v) => updateField("current_belt", v)}
          />

          {/* Exámenes rendidos */}
          <div>
            <h4 className="font-light uppercase tracking-wide text-sm mb-2 text-[#1a1a1a]">
              Exámenes rendidos
            </h4>
            {student.exams?.length > 0 ? (
              <ul className="bg-gray-50 border border-gray-200 p-4 space-y-1 text-sm">
                {student.exams.map((exam) => (
                  <li key={exam.id} className="text-[#1a1a1a]">
                    {new Date(exam.date).toLocaleDateString("es-AR")} –{" "}
                    <span className="font-medium">{exam.belt}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No tiene exámenes registrados</p>
            )}
          </div>

          {/* Registrado en el sistema */}
          <div className="text-sm">
            <span className="font-light uppercase tracking-wide text-gray-600">
              Registrado el:
            </span>{" "}
            <span className="text-[#1a1a1a] font-medium">
              {new Date(student.registered_at).toLocaleDateString("es-AR")}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-600 text-white uppercase text-xs tracking-wide hover:bg-red-700 transition-colors"
            disabled={saving}
          >
            Eliminar alumno
          </button>

          <button
            onClick={() => onClose(false)}
            className="px-6 py-2 bg-gray-300 text-[#1a1a1a] uppercase text-xs tracking-wide hover:bg-gray-400 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}