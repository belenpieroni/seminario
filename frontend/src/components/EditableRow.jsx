import { Edit2 } from "lucide-react";
import { useState, useEffect } from "react";

export function EditableRow({ label, value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value);

  useEffect(() => setTemp(value), [value]);

  return (
    <div className="flex justify-between items-center bg-gray-50 p-3">
      <div>
        <p className="text-gray-600">{label}</p>

        {editing ? (
          <input
            value={temp}
            onChange={e => setTemp(e.target.value)}
            className="border p-1"
          />
        ) : (
          <p>{value}</p>
        )}
      </div>

      {editing ? (
        <button
          onClick={() => {
            onSave(temp);
            setEditing(false);
          }}
          className="text-green-600"
        >
          Guardar
        </button>
      ) : (
        <button onClick={() => setEditing(true)}>
          <Edit2 className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );
}