// src/components/Input.jsx
export function Input({ id, type = "text", value, onChange, placeholder, className = "" }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`
        border border-gray-300 rounded-md px-3 py-2 w-full
        focus:border-red-700 focus:ring-1 focus:ring-red-700
        transition-all
        ${className}
      `}
    />
  );
}

