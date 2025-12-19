import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import { Building2, Users, UserCheck } from "lucide-react"

export function SenseiDashboard() {
  const [dojo, setDojo] = useState(null)
  const [stats, setStats] = useState({ students: 0, senseis: 0 })
  const [headSensei, setHeadSensei] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDojoData = async () => {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return setLoading(false)

      const { data: sensei } = await supabase
        .from("sensei")
        .select("dojo_id")
        .eq("user_id", user.id)
        .single()

      if (!sensei?.dojo_id) return setLoading(false)

      const dojoId = sensei.dojo_id

      const { data: dojoData } = await supabase
        .from("dojo")
        .select("name, address, city, province")
        .eq("id", dojoId)
        .single()

      setDojo(dojoData)

      const { count: studentsCount } = await supabase
        .from("student")
        .select("*", { count: "exact", head: true })
        .eq("dojo_id", dojoId)

      const { count: senseisCount } = await supabase
        .from("sensei")
        .select("*", { count: "exact", head: true })
        .eq("dojo_id", dojoId)

      const { data: head } = await supabase
        .from("sensei")
        .select("full_name, dan_grade")
        .eq("dojo_id", dojoId)
        .eq("is_head", true)
        .single()

      setStats({ students: studentsCount || 0, senseis: senseisCount || 0 })
      setHeadSensei(head)
      setLoading(false)
    }

    fetchDojoData()
  }, [])

  if (loading) {
    return <div className="p-8 text-gray-500">Cargando información del dojo…</div>
  }

  if (!dojo) {
    return <div className="p-8 text-gray-500">No se pudo cargar la información del dojo.</div>
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[#1a1a1a] text-2xl font-semibold">Mi Dojo</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* DOJO */}
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
          </div>
        </div>

        {/* SENSEI A CARGO */}
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

        {/* ESTADÍSTICAS */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#c41e3a]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#c41e3a] rounded-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-[#1a1a1a] font-semibold">Comunidad</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Alumnos</p>
              <p className="text-[#1a1a1a]">{stats.students}</p>
            </div>
            <div>
              <p className="text-gray-600">Senseis</p>
              <p className="text-[#1a1a1a]">{stats.senseis}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}