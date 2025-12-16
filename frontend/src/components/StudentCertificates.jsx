import { Award, Eye, Hash } from "lucide-react"
import { useState } from "react"
import { CertificateDetail } from "./CertificateDetail"

export function StudentCertificates({ certificates = [] }) {
  const [selectedHash, setSelectedHash] = useState(null)
  const [selectedCertificate, setSelectedCertificate] = useState(null)

  return (
    <div className="p-8">
      <h2 className="text-[#1a1a1a] mb-8">Mis certificados</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map(cert => (
          <div
            key={cert.id}
            className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#c41e3a]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#c41e3a] bg-opacity-10 rounded-lg">
                <Award className="w-8 h-8 text-[#c41e3a]" />
              </div>
              <div>
                <h3 className="text-[#1a1a1a]">{cert.belt}</h3>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-gray-600">Fecha de emisión</p>
                <p className="text-[#1a1a1a]">
                  {new Date(cert.issueDate).toLocaleDateString("es-AR")}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Estado</p>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  {cert.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedCertificate(cert)}
                className="flex-1 flex items-center justify-center gap-2 text-[#c41e3a] border border-[#c41e3a] py-2 rounded-lg hover:bg-[#c41e3a] hover:text-white transition-colors"
              >
                <Eye className="w-4 h-4" />
                Ver certificado
              </button>
              <button
                onClick={() =>
                  setSelectedHash(selectedHash === cert.id ? null : cert.id)
                }
                className="flex-1 flex items-center justify-center gap-2 text-[#c41e3a] border border-[#c41e3a] py-2 rounded-lg hover:bg-[#c41e3a] hover:text-white transition-colors"
              >
                <Hash className="w-4 h-4" />
                Ver hash
              </button>
            </div>

            {selectedHash === cert.id && (
              <div className="mt-4 p-3 bg-[#f8f8f8] rounded-lg">
                <p className="text-gray-600 mb-1">Hash blockchain:</p>
                <p className="text-[#1a1a1a] break-all">{cert.hash}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {certificates.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            No tienes certificados registrados aún
          </p>
        </div>
      )}

      {selectedCertificate && (
        <CertificateDetail
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  )
}
