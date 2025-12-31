import { useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"
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
        .eq("is_active", true)

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
      <div className="flex items-center justify-between mb-8 border-b border-gray-300 pb-4">
        <h2 className="text-2xl font-light uppercase tracking-wide text-[#1a1a1a]">
          Mi <span className="text-[#c41e3a]">Dojo</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* DOJO */}
        <div className="bg-white shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="p-2 bg-[#c41e3a]">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-[#1a1a1a] font-light uppercase tracking-wide">
              Detalles del Dojo
            </h3>
          </div>
          <div className="p-6 space-y-2 text-sm">
            <p><span className="text-gray-600">Nombre:</span> <span className="font-medium">{dojo.name}</span></p>
            <p><span className="text-gray-600">Dirección:</span> <span className="font-medium">{dojo.address}</span></p>
            <p><span className="text-gray-600">Ubicación:</span> <span className="font-medium">{dojo.city}, {dojo.province}</span></p>
          </div>
        </div>

        {/* SENSEI A CARGO */}
        <div className="bg-white shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="p-2 bg-[#c41e3a]">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-[#1a1a1a] font-light uppercase tracking-wide">
              Sensei a cargo
            </h3>
          </div>
          <div className="p-6 text-sm">
            {headSensei ? (
              <>
                <p className="text-[#1a1a1a] font-medium">{headSensei.full_name}</p>
                <p className="text-gray-600">{headSensei.dan_grade}</p>
              </>
            ) : (
              <p className="text-gray-500 italic">No asignado</p>
            )}
          </div>
        </div>

        {/* ESTADÍSTICAS */}
        <div className="bg-white shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="p-2 bg-[#c41e3a]">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-[#1a1a1a] font-light uppercase tracking-wide">
              Comunidad
            </h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Alumnos</p>
              <p className="text-[#1a1a1a] font-medium">{stats.students}</p>
            </div>
            <div>
              <p className="text-gray-600">Senseis</p>
              <p className="text-[#1a1a1a] font-medium">{stats.senseis}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}