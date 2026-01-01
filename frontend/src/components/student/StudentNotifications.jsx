import { useEffect, useState, useCallback } from "react"
import { supabase } from "../../supabaseClient"
import { NotificationDetail } from "../common/NotificationDetail"
import { useNotifications } from "../common/NotificationContext"

export function StudentNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNotificationId, setSelectedNotificationId] = useState(null)
  const [student, setStudent] = useState(null)

  const { refreshUnread } = useNotifications() ?? {}

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) console.error("getUser error:", userError)
      const user = userData?.user
      console.log("👤 user:", user)
      if (!user) {
        setNotifications([])
        setLoading(false)
        return
      }

      const { data: studentData, error: studentError } = await supabase
        .from("student")
        .select("id, dojo_id")
        .eq("user_id", user.id)
        .single()

      if (studentError) console.error("student query error:", studentError)
      console.log("🎓 studentData:", studentData)
      if (!studentData) {
        setNotifications([])
        setLoading(false)
        return
      }

      setStudent(studentData)

      if (!studentData.dojo_id) {
        console.warn("⚠️ student has no dojo_id")
        setNotifications([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("notification")
        .select(`
          id,
          title,
          body,
          attachments,
          created_at,
          sensei:sender_id ( full_name ),
          notification_read!left(notification_id, student_id)
        `)
        .eq("dojo_id", studentData.dojo_id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("notification query error:", error)
        setNotifications([])
        setLoading(false)
        return
      }

      console.log("📬 notifications raw:", data)

      const withReadFlag = (data || []).map(n => ({
        ...n,
        isRead: (n.notification_read || []).some(r => r.student_id === studentData.id)
      }))

      console.log("✅ notifications with isRead:", withReadFlag.map(n => ({ id: n.id, isRead: n.isRead })))
      setNotifications(withReadFlag)

      if (refreshUnread) {
        refreshUnread(studentData.id, studentData.dojo_id)
      }
    } catch (err) {
      console.error("fetchData exception:", err)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [refreshUnread])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (selectedNotificationId) {
    return (
      <NotificationDetail
        notificationId={selectedNotificationId}
        studentId={student?.id}
        onBack={async () => {
          setSelectedNotificationId(null)
          await fetchData()
        }}
      />
    )
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-light uppercase tracking-wide text-[#1a1a1a] mb-6">
        Notificaciones del <span className="text-[#c41e3a]">Dojo</span>
      </h2>

      <div className="bg-white shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="uppercase tracking-wide text-xs text-gray-600">Bandeja de entrada</div>
          <div className="text-sm text-gray-500">{notifications.length} mensajes</div>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-6 text-gray-600">Cargando notificaciones…</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 italic">No hay notificaciones enviadas</div>
          ) : (
            notifications.map((n) => {
              const unreadClass = n.isRead ? "font-normal text-gray-700" : "font-bold text-[#1a1a1a]"
              return (
                <button
                  key={n.id}
                  onClick={() => setSelectedNotificationId(n.id)}
                  className="w-full text-left px-6 py-4 hover:bg-gray-50 flex justify-between items-start gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className={`truncate ${unreadClass}`}>
                        {n.title}
                      </div>
                    </div>
                    <div className={`text-sm mt-1 truncate max-w-[60ch] ${n.isRead ? "text-gray-600" : "text-gray-900 font-semibold"}`}>
                      {n.body}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right ml-4">
                    <div className="text-xs text-gray-500">
                      {new Date(n.created_at).toLocaleDateString("es-AR")}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {n.sensei?.full_name || "Sensei desconocido"}
                    </div>
                    {n.attachments?.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400">📎 {n.attachments.length}</div>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
