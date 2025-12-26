export function BackButton({ onBack }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="mb-4 text-sm text-[#c41e3a] hover:underline"
    >
      ← Volver
    </button>
  )
}
