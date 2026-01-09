import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function CertificateCard({ certificate, onDownload }) {
  const [showObs, setShowObs] = useState(false)

  const examDate = new Date(certificate.exam?.exam_date).toLocaleDateString("es-AR")

  return (
    <div className="border rounded-lg shadow-md bg-white p-4 mb-4">
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
              <span className="text-green-600 font-medium">Validado</span>
            ) : (
              <span className="text-red-600 font-medium">Pendiente</span>
            )}
          </p>
        </div>
        <button
          onClick={() => onDownload(certificate.pdf_url)}
          className="px-4 py-2 border border-[#c41e3a] text-[#c41e3a] uppercase text-xs tracking-wide hover:bg-[#c41e3a] hover:text-white transition-colors"
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
    </div>
  )
}
