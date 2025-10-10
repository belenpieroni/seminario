export function Checkbox({ id, checked, onChange }) {
  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4"
    />
  );
}
