import { useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"
import { Bell } from "lucide-react"

export function StudentNotifications() {
  const [student, setStudent] = useState(null)
  const [dojo, setDojo] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return setLoading(false)

      const { data: studentData } = await supabase
        .from("student")
        .select("id, current_belt, dojo_id")
        .eq("user_id", user.id)
        .single()

      if (!studentData) return setLoading(false)
      setStudent(studentData)

      const { data: dojoData } = await supabase
        .from("dojo")
        .select("id, name")
        .eq("id", studentData.dojo_id)
        .single()
      setDojo(dojoData)

      const { data: notifData } = await supabase
        .from("notification")
        .select("id, message, created_at")
        .eq("dojo_id", studentData.dojo_id)
        .order("created_at", { ascending: false })
      setNotifications(notifData || [])

      setLoading(false)
    }

    fetchNotifications()
  }, [])

  if (loading) return <div className="p-8 text-gray-500">Cargando notificaciones…</div>
  if (!student || !dojo) return <div className="p-8 text-gray-500">No se pudo cargar las notificaciones.</div>

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-[#1a1a1a] text-2xl font-semibold">Notificaciones</h2>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No hay notificaciones</p>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="bg-white shadow-md p-4 rounded-lg flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#c41e3a]" />
                <span>{n.message}</span>
              </div>
              {n.message.includes("examen") && (
                <button
                  className="bg-[#c41e3a] text-white px-4 py-2 rounded hover:bg-[#a01830]"
                  onClick={() =>
                    alert(`¿Inscribirte para rendir el cinturón ${student.current_belt} el día X en ${dojo.name}?`)
                  }
                >
                  Inscribirme
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
