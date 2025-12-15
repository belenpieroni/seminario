import { useState } from "react"
import { X, CheckCircle, ChevronDown, ChevronUp, Copy } from "lucide-react"

export function CertificateDetail({ certificate, onClose }) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyHash = () => {
    navigator.clipboard.writeText(certificate.hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-[#1a1a1a]">Detalle del certificado</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-[#c41e3a] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Estado verificado */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="text-green-800">✓ Certificado verificado</h3>
              <p className="text-green-600">
                Este certificado fue registrado en blockchain para garantizar su
                autenticidad.
              </p>
            </div>
          </div>

          {/* Información del certificado */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-1">Dojo emisor</p>
                <p className="text-[#1a1a1a]">{certificate.dojo}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Graduación</p>
                <p className="text-[#1a1a1a]">{certificate.belt}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-600 mb-1">Fecha de emisión</p>
              <p className="text-[#1a1a1a]">
                {new Date(certificate.issueDate).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </p>
            </div>
          </div>

          {/* Botón para ver detalles técnicos */}
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#f8f8f8] rounded-lg hover:bg-gray-200 transition-colors mb-4"
          >
            <span className="text-[#1a1a1a]">Ver detalles técnicos</span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-5 h-5 text-[#c41e3a]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#c41e3a]" />
            )}
          </button>

          {/* Detalles técnicos desplegables */}
          {showTechnicalDetails && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div>
                <p className="text-gray-600 mb-2">Hash del certificado</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-[#1a1a1a] text-white rounded text-sm break-all">
                    {certificate.hash}
                  </code>
                  <button
                    onClick={handleCopyHash}
                    className="flex-shrink-0 p-2 bg-[#c41e3a] text-white rounded hover:bg-[#a01830] transition-colors"
                    title="Copiar hash"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {copied && (
                  <p className="text-green-600 mt-1">
                    ¡Hash copiado al portapapeles!
                  </p>
                )}
              </div>

              <div>
                <p className="text-gray-600 mb-1">Red</p>
                <p className="text-[#1a1a1a]">Testnet (Red de prueba)</p>
              </div>

              <div>
                <p className="text-gray-600 mb-1">
                  Fecha de registro en blockchain
                </p>
                <p className="text-[#1a1a1a]">
                  {new Date(certificate.issueDate).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600">
                  Este certificado fue registrado en blockchain para garantizar
                  su autenticidad. El hash es único e inmutable, lo que asegura
                  que el certificado no puede ser falsificado ni modificado.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
