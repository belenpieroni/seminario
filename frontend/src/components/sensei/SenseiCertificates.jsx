import { useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"
import CertificateList from "../certificate/CertificateList"
import { getValidatedCertificatesByDojo } from "../../queries/certificateQueries"

export default function SenseiCertificates() {
  const [dojoId, setDojoId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) {
        console.warn("⚠️ No hay usuario logueado")
        setLoading(false)
        return
      }

      const { data: senseiData, error: senseiError } = await supabase
        .from("sensei")
        .select("id, full_name, dojo_id")
        .eq("user_id", user.id)
        .single()

      if (senseiError || !senseiData) {
        console.error("❌ Error obteniendo datos del sensei:", senseiError)
        setLoading(false)
        return
      }

      console.log("👤 SenseiCertificates montado con dojoId:", senseiData.dojo_id)
      setDojoId(senseiData.dojo_id)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return <p className="text-gray-600">Cargando certificados...</p>
  }

  if (!dojoId) {
    return <p className="text-gray-600 italic">No se encontró dojo para este sensei.</p>
  }

  // 3️⃣ Renderiza CertificateList con el dojoId
  return (
    <CertificateList dojoId={dojoId} />
  )
}
