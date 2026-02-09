import { useEffect, useState } from "react"
import CertificateCard from "../certificate/CertificateCard"
import { supabase } from "../../supabaseClient"
import { getAllCertificates } from "../../queries/certificateQueries"
import { BrowserProvider, Contract } from "ethers"
import CertificateRegistry from "../../abis/CertificateRegistry.json"

const CONTRACT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138"

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true)
      const data = await getAllCertificates()
      setCertificates(data || [])
      setLoading(false)
    }
    fetchCertificates()
  }, [])

  // filtro de búsqueda por alumno, fecha o grado
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

  // lógica de validación/denegación
  const handleCertificateAction = async (certificate, action) => {
    try {
      if (action === "validate") {
        // 1. Conectar a blockchain con ethers y MetaMask
        await window.ethereum.request({ method: "eth_requestAccounts" })
        const provider = new BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new Contract(CONTRACT_ADDRESS, CertificateRegistry.abi, signer)

        // 2. Registrar en blockchain usando el hash ya existente
        await contract.registerCertificate("0x" + certificate.hash)

        // 3. Actualizar Supabase
        await supabase
          .from("certificate")
          .update({
            is_valid: true,
            status: "valid",
            validated_at: new Date().toISOString(),
            validated_by: "d07b6723-ae7b-42c9-b3e4-b4d29af7752f"
          })
          .eq("id", certificate.id)

        alert("✅ Certificado validado en blockchain y Supabase")
        setCertificates((prev) => prev.filter((c) => c.id !== certificate.id))
      }

      if (action === "revoke") {
        await supabase
          .from("certificate")
          .update({
            is_valid: false,
            status: "denied",
            validated_at: new Date().toISOString(),
            validated_by: "d07b6723-ae7b-42c9-b3e4-b4d29af7752f"
          })
          .eq("id", certificate.id)

        alert("❌ Certificado denegado en Supabase")
        setCertificates((prev) => prev.filter((c) => c.id !== certificate.id))
      }
    } catch (err) {
      console.error("Error:", err)
      alert("Hubo un problema con la acción.")
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
            onValidated={handleCertificateAction}
            mode="admin"
          />
        ))
      )}
    </div>
  )
}
