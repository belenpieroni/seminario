import { useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"
import { Building2, UserCheck, Users } from "lucide-react"

export function StudentDashboard() {
  const [dojo, setDojo] = useState(null)
  const [headSensei, setHeadSensei] = useState(null)
  const [otherSenseis, setOtherSenseis] = useState([])
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // 1️⃣ Usuario logueado
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return setLoading(false)

      // 2️⃣ Datos del alumno
      const { data: studentData } = await supabase
        .from("student")
        .select("id, full_name, dojo_id")
        .eq("user_id", user.id)
        .single()

      if (!studentData) return setLoading(false)
      setStudent(studentData)

      // 3️⃣ Datos del dojo
      const { data: dojoData } = await supabase
        .from("dojo")
        .select("id, name, address, city, province, phone")
        .eq("id", studentData.dojo_id)
        .single()
      setDojo(dojoData)

      // 4️⃣ Sensei a cargo
      const { data: head } = await supabase
        .from("sensei")
        .select("full_name, dan_grade")
        .eq("dojo_id", studentData.dojo_id)
        .eq("is_head", true)
        .single()
      setHeadSensei(head)

      // 5️⃣ Senseis no a cargo
      const { data: others } = await supabase
        .from("sensei")
        .select("full_name, dan_grade")
        .eq("dojo_id", studentData.dojo_id)
        .eq("is_head", false)
      setOtherSenseis(others || [])

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-8 text-gray-500">Cargando información…</div>
  }

  if (!student || !dojo) {
    return <div className="p-8 text-gray-500">No se pudo cargar la información del alumno.</div>
  }

  return (
    <div className="p-8 space-y-8">
      {/* Mi dojo */}
      <h2 className="text-[#1a1a1a] text-2xl font-semibold">Mi Dojo</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Detalles del dojo */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#c41e3a]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#c41e3a] rounded-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-[#1a1a1a] font-semibold">Detalles del Dojo</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-600">Nombre:</span> {dojo.name}</p>
            <p><span className="text-gray-600">Dirección:</span> {dojo.address}</p>
            <p><span className="text-gray-600">Ubicación:</span> {dojo.city}, {dojo.province}</p>
            <p><span className="text-gray-600">Teléfono:</span> {dojo.phone}</p>
          </div>
        </div>

        {/* Sensei a cargo */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#c41e3a]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#c41e3a] rounded-lg">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-[#1a1a1a] font-semibold">Sensei a cargo</h3>
          </div>
          {headSensei ? (
            <div className="space-y-1 text-sm">
              <p className="text-[#1a1a1a]">{headSensei.full_name}</p>
              <p className="text-gray-600">{headSensei.dan_grade}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No asignado</p>
          )}
        </div>

        {/* Senseis del dojo */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#c41e3a]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#c41e3a] rounded-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-[#1a1a1a] font-semibold">Senseis del dojo</h3>
          </div>
          <ul className="text-sm space-y-1">
            {otherSenseis.map((s, i) => (
              <li key={i}>{s.full_name} — {s.dan_grade}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
