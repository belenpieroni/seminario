import { useEffect, useState } from "react"
import { getDojoNotifications } from "../../queries/dojoQueries"
import { supabase } from "../../supabaseClient"
import { Bell, Calendar, Paperclip } from "lucide-react"
import dayjs from "dayjs"

export function StudentNotifications() {
  const [student, setStudent] = useState(null)
  const [dojo, setDojo] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return setLoading(false)

      const { data: studentData } = await supabase
        .from("student")
        .select("id, dojo_id")
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

      const notifData = await getDojoNotifications(studentData.dojo_id)
      setNotifications(notifData)

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-8 text-gray-500">Cargando notificaciones…</div>

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-[#1a1a1a] text-2xl font-semibold">Notificaciones del dojo</h2>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No hay notificaciones en tu dojo.</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="bg-white shadow-md p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#c41e3a]" />
                  <span className="font-medium">{n.title}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{dayjs(n.created_at).format("DD/MM/YYYY HH:mm")}</span>
                </div>
              </div>

              <p className="mt-2 text-sm text-gray-700">{n.body}</p>

              {n.attachments && n.attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
                  {n.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    >
                      <Paperclip className="w-4 h-4" />
                      {file.type === "pdf" ? "Documento PDF" : "Imagen"}
                    </a>
                  ))}
                </div>
              )}

              <p className="mt-2 text-xs text-gray-500">
                Remitente: {n.sender?.full_name || "Sensei"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
