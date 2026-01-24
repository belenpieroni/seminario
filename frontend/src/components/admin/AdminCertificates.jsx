import { useEffect, useState } from "react"
import CertificateCard from "../certificate/CertificateCard"
import { supabase } from "../../supabaseClient"
import { getAllCertificates } from "../../queries/certificateQueries"

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  // 🔑 cargar todos los certificados
  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true)
      const data = await getAllCertificates()
      setCertificates(data || [])
      setLoading(false)
    }
    fetchCertificates()
  }, [])

  // 🔎 filtro de búsqueda por alumno, fecha o grado
  const filtered = certificates.filter((cert) => {
    const studentName = cert.student?.full_name?.toLowerCase() || ""
    const examDate = new Date(cert.exam?.exam_date).toLocaleDateString("es-AR")
    const belt = cert.belt?.toLowerCase() || ""

    return (
      studentName.includes(search.toLowerCase()) ||
      examDate.includes(search) ||
      belt.includes(search.toLowerCase())
    )
  })

  const handleDownload = async (pdfUrl) => {
    try {
      const { data, error } = await supabase.storage
        .from("certificados")
        .download(pdfUrl)

      if (error) throw error

      const blobUrl = URL.createObjectURL(data)
      window.open(blobUrl, "_blank")
    } catch (err) {
      console.error("Error descargando certificado:", err)
      alert("No se pudo descargar el certificado.")
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-light uppercase tracking-wide text-[#1a1a1a] mb-6">
        Certificados (Administración)
      </h2>

      <input
        type="text"
        placeholder="Buscar por alumno, fecha o grado..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded px-4 py-2 mb-6"
      />

      {loading ? (
        <p className="text-gray-600">Cargando certificados...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-600 italic">No se encontraron certificados.</p>
      ) : (
        filtered.map((cert) => (
          <CertificateCard
            key={cert.id}
            certificate={cert}
            onDownload={handleDownload}
            onValidated={(id) => setCertificates((prev) => prev.filter((c) => c.id !== id))}
            mode="admin"
            />
        ))
      )}
    </div>
  )
}
