import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { supabase } from "../../supabaseClient"
import ConfirmModal from "./ConfirmModal"

export default function CertificateCard({ certificate, onDownload, onValidated, mode = "no-admin" }) {
  const [showObs, setShowObs] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [action, setAction] = useState(null)

  const examDate = new Date(certificate.exam?.exam_date).toLocaleDateString("es-AR")

  const handleConfirm = async () => {
    setConfirmOpen(false)
    if (action === "validate") {
      try {
        const { error } = await supabase
          .from("certificate")
          .update({
            is_valid: true,
            validated_by: "d07b6723-ae7b-42c9-b3e4-b4d29af7752f", 
            validated_at: new Date().toISOString(),
          })
          .eq("id", certificate.id)

        if (error) throw error
        alert("Certificado validado correctamente")
        onValidated?.(certificate.id)
      } catch (err) {
        console.error("Error validando certificado:", err)
        alert("No se pudo validar el certificado.")
      }
    } else if (action === "revoke") {
      try {
        const { error } = await supabase
          .from("certificate")
          .update({
            is_valid: false,
            validated_by: "d07b6723-ae7b-42c9-b3e4-b4d29af7752f",
            validated_at: new Date().toISOString(),
          })
          .eq("id", certificate.id)

        if (error) throw error
        alert("Certificado revocado correctamente")
        onValidated?.(certificate.id)
      } catch (err) {
        console.error("Error revocando certificado:", err)
        alert("No se pudo revocar el certificado.")
      }
    }
  }

  return (
    <div className="border shadow-md bg-white p-4 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            {certificate.student?.full_name}
            {certificate.exam?.dojo?.name && (
              <span className="text-sm text-gray-500"> ({certificate.exam.dojo.name})</span>
            )}
          </h3>
          <p className="text-sm text-gray-600">Grado: {certificate.belt}</p>
          <p className="text-sm text-gray-600">Fecha examen: {examDate}</p>
          <p className="text-sm text-gray-600">Sede: {certificate.exam?.location_dojo?.name}</p>
          <p className="text-sm text-gray-600">
            Estado:{" "}
            {certificate.is_valid ? (
              <span className="text-green-600 font-medium">Válido</span>
            ) : certificate.validated_at ? (
              <span className="text-red-600 font-medium">Revocado</span>
            ) : (
              <span className="text-yellow-600 font-medium">Pendiente</span>
            )}
          </p>
        </div>
        <button
          onClick={() => onDownload(certificate.pdf_url)}
          disabled={!certificate.is_valid}
          className={`px-4 py-2 border uppercase text-xs tracking-wide transition-colors
            ${certificate.is_valid
              ? "border-[#c41e3a] text-[#c41e3a] hover:bg-[#c41e3a] hover:text-white"
              : "border-gray-300 text-gray-400 cursor-not-allowed"
            }`}
        >
          Ver certificado
        </button>
      </div>

      {/* Observaciones desplegables */}
      {certificate.exam?.observations && (
        <div className="mt-2">
          <button
            onClick={() => setShowObs(!showObs)}
            className="flex items-center text-sm text-gray-700 hover:text-[#c41e3a]"
          >
            {showObs ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
            Observaciones
          </button>
          {showObs && (
            <p className="mt-2 text-gray-600 text-sm">{certificate.exam.observations}</p>
          )}
        </div>
      )}

      {/* Botones de Validar/Revocar solo en modo admin */}
      {mode === "admin" && !certificate.is_valid && (
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => { setAction("validate"); setConfirmOpen(true) }}
            className="px-4 py-2 border border-green-600 text-green-600 uppercase text-xs tracking-wide hover:bg-green-600 hover:text-white transition-colors"
          >
            Validar
          </button>
          <button
            onClick={() => { setAction("revoke"); setConfirmOpen(true) }}
            className="px-4 py-2 border border-red-600 text-red-600 uppercase text-xs tracking-wide hover:bg-red-600 hover:text-white transition-colors"
          >
            Revocar
          </button>
        </div>
      )}

      {/* Modal de confirmación */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        action={action}
      />
    </div>
  )
}
