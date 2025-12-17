import { Edit2, Check } from "lucide-react";
import { useState } from "react";

export function EditableRow({ label, value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value);

  function handleSave() {
    onSave(temp);
    setEditing(false);
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-600 w-40">{label}</span>

      {!editing ? (
        <div className="flex items-center gap-2">
          <span className="text-[#1a1a1a]">{value || "-"}</span>
          <button onClick={() => setEditing(true)}>
            <Edit2 className="w-4 h-4 text-gray-500 hover:text-[#c41e3a]" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            value={temp}
            onChange={e => setTemp(e.target.value)}
            className="border px-3 py-1 w-64"
          />
          <button onClick={handleSave}>
            <Check className="w-4 h-4 text-green-600" />
          </button>
        </div>
      )}
    </div>
  );
}
