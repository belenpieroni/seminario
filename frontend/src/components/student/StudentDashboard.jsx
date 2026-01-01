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
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-300 pb-4">
        <h2 className="text-2xl font-light uppercase tracking-wide text-[#1a1a1a]">
          Mi <span className="text-[#c41e3a]">Dojo</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Detalles del dojo */}
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
            <p>
              <span className="text-gray-600">Nombre:</span>{" "}
              <span className="font-medium">{dojo.name}</span>
            </p>
            <p>
              <span className="text-gray-600">Dirección:</span>{" "}
              <span className="font-medium">{dojo.address}</span>
            </p>
            <p>
              <span className="text-gray-600">Ubicación:</span>{" "}
              <span className="font-medium">
                {dojo.city}, {dojo.province}
              </span>
            </p>
            <p>
              <span className="text-gray-600">Teléfono:</span>{" "}
              <span className="font-medium">{dojo.phone}</span>
            </p>
          </div>
        </div>

        {/* Sensei a cargo */}
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
            <div className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span className="font-medium">{headSensei.full_name}</span>
                <span className="text-gray-600">{headSensei.dan_grade}</span>
              </li>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No asignado</p>
          )}
          </div>
        </div>

        {/* Senseis del dojo */}
        <div className="bg-white shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="p-2 bg-[#c41e3a]">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-[#1a1a1a] font-light uppercase tracking-wide">
              Senseis del dojo
            </h3>
          </div>
          <div className="p-6 text-sm">
            <ul className="space-y-2 text-[#1a1a1a]">
              {otherSenseis.length > 0 ? (
                otherSenseis.map((s, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="font-medium">{s.full_name}</span>
                    <span className="text-gray-600">{s.dan_grade}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic">No hay senseis adicionales</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
