export default function ConfirmModal({ open, onClose, onConfirm, action }) {
  if (!open) return null

  const isValidate = action === "validate"

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">
          Confirmación
        </h2>
        <p className="text-gray-700 mb-6">
          ¿Está seguro que quiere {isValidate ? "validar" : "revocar"} el certificado?
          <br />
          <span className="font-medium">Esta acción no se puede deshacer.</span>
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-400 text-gray-600 uppercase text-xs tracking-wide hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 uppercase text-xs tracking-wide transition-colors ${
              isValidate
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {isValidate ? "Validar" : "Revocar"}
          </button>
        </div>
      </div>
    </div>
  )
}
