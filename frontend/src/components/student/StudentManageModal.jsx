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
      <div className="bg-white w-full max-w-2xl shadow-lg relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold">Gestionar Alumno</h3>
          <button onClick={onClose}>
            <X />
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
            <div className="flex justify-between items-center bg-gray-50 p-3">
                <div>
                    <p className="text-gray-600">Edad</p>
                    {age}
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
                <h4 className="font-semibold mb-2">Exámenes rendidos</h4>
                {student.exams?.length > 0 ? (
                <ul className="bg-gray-50 p-4 space-y-1">
                    {student.exams.map((exam) => (
                    <li key={exam.id}>
                        {new Date(exam.date).toLocaleDateString("es-AR")} – {exam.belt}
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-gray-500">No tiene exámenes registrados</p>
                )}
            </div>

            {/* Registrado en el sistema */}
            <div>
                <span className="font-semibold">Registrado el: </span>
                {new Date(student.registered_at).toLocaleDateString("es-AR")}
            </div>
            
            {/* Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200">
                <button
                    onClick={handleDelete}
                    className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors"
                    disabled={saving}
                >
                    Eliminar alumno
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