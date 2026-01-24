import { useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"
import CertificateCard from "../certificate/CertificateCard"
import { getValidatedCertificatesByStudent } from "../../queries/certificateQueries"

export default function StudentCertificates() {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [studentId, setStudentId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) {
        setLoading(false)
        return
      }

      const { data: studentData, error: studentError } = await supabase
        .from("student")
        .select("id, full_name, dojo_id")
        .eq("user_id", user.id)
        .single()

      if (studentError || !studentData) {
        console.error("❌ Error obteniendo datos del alumno:", studentError)
        setLoading(false)
        return
      }
      setStudentId(studentData.id)

      const data = await getValidatedCertificatesByStudent(studentData.id)
      setCertificates(data || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleDownload = async (pdfUrl) => {
    try {
      const { data, error } = await supabase.storage
        .from("certificados")
        .download(pdfUrl)

      if (error) throw error

      const blobUrl = URL.createObjectURL(data)
      window.open(blobUrl, "_blank")
    } catch (err) {
      console.error("❌ Error descargando certificado:", err)
      alert("No se pudo descargar el certificado.")
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-light uppercase tracking-wide text-[#1a1a1a] mb-6">
        Mis certificados
      </h2>

      {loading ? (
        <p className="text-gray-600">Cargando certificados...</p>
      ) : certificates.length === 0 ? (
        <p className="text-gray-600 italic">
          Todavía no tienes certificados validados.
        </p>
      ) : (
        certificates.map((cert) => (
          <CertificateCard
            key={cert.id}
            certificate={cert}
            onDownload={handleDownload}
            mode="no-admin"
          />
        ))
      )}
    </div>
  )
}
