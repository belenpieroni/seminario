import { useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"
import { Paperclip } from "lucide-react"
import { useNotifications } from "../common/NotificationContext"
import { BackButton } from "../common/BackButton"

export function NotificationDetail({ notificationId, studentId, onBack }) {
  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const { refreshUnread } = useNotifications() ?? {}

  useEffect(() => {
    if (!notificationId) return

    let mounted = true
    const fetchDetail = async () => {
      setLoading(true)
      try {
        console.debug("NotificationDetail: fetching", notificationId)
        const { data, error } = await supabase
          .from("notification")
          .select("id, title, body, attachments, created_at, sender_id, sensei:sender_id ( full_name )")
          .eq("id", notificationId)
          .single()

        if (error) {
          console.error("NotificationDetail - fetch error:", error)
          if (mounted) setNotification(null)
          return
        }

        if (mounted) setNotification(data)
      } catch (err) {
        console.error("NotificationDetail - exception:", err)
        if (mounted) setNotification(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchDetail()
    return () => {
      mounted = false
    }
  }, [notificationId])

  useEffect(() => {
    if (!notification || !studentId) return

    let mounted = true
    const markAsRead = async () => {
      try {
        setMarking(true)
        console.debug("NotificationDetail: marking as read", { notificationId: notification.id, studentId })

        const { error } = await supabase.from("notification_read").upsert(
          {
            notification_id: notification.id,
            student_id: studentId,
            read_at: new Date().toISOString()
          },
          { onConflict: ["notification_id", "student_id"] }
        )

        if (error) {
          console.error("NotificationDetail - upsert error:", error)
        } else {
          console.debug("NotificationDetail - marked as read successfully")
          if (typeof refreshUnread === "function") {
            try {
              await refreshUnread(studentId)
            } catch (err) {
              console.error("NotificationDetail - refreshUnread error:", err)
            }
          }
        }
      } catch (err) {
        console.error("NotificationDetail - exception marking read:", err)
      } finally {
        if (mounted) setMarking(false)
      }
    }

    markAsRead()
    return () => {
      mounted = false
    }
  }, [notification, studentId, refreshUnread])

  if (loading) return <p className="p-8 text-gray-600">Cargando notificación…</p>
  if (!notification) return <p className="p-8 text-gray-600">No se encontró la notificación.</p>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <BackButton onBack={onBack} />
          <h2 className="text-2xl font-light uppercase tracking-wide text-[#1a1a1a] mb-6">
            {notification.title}
          </h2>
          <div className="text-sm text-gray-500 mt-1">
            {notification.sensei?.full_name ? `De ${notification.sensei.full_name}` : "Remitente desconocido"}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 p-6 rounded">
        <div className="prose max-w-none text-gray-700 whitespace-pre-line">
          {notification.body}
        </div>

        {notification.attachments?.length > 0 && (
          <div className="pt-4 border-t border-gray-100 mt-6">
            <div className="text-sm text-gray-600 mb-2">Adjuntos</div>
            <div className="flex flex-wrap gap-3">
              {notification.attachments.map((a, i) => (
                <a
                  key={i}
                  href={a.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 text-sm rounded"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="truncate max-w-[18rem]">{a.name || a.url}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          {notification.created_at && (
            <span>Enviado el {new Date(notification.created_at).toLocaleString("es-AR")}</span>
          )}
          {marking && <span className="ml-4 text-gray-400">Marcando como leído…</span>}
        </div>
      </div>
    </div>
  )
}

export default NotificationDetail
