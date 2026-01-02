import { useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"
import { Paperclip } from "lucide-react"
import { BackButton } from "../common/BackButton"

export default function NotificationDetailSensei({ notificationId, onBack }) {
  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!notificationId) return

    let mounted = true
    const fetchDetail = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("notification")
          .select("id, title, body, attachments, created_at, sender_id, sensei:sender_id ( full_name )")
          .eq("id", notificationId)
          .single()

        if (error) {
          console.error("NotificationDetailSensei - fetch error:", error)
          if (mounted) setNotification(null)
          return
        }
        if (mounted) setNotification(data)
      } catch (err) {
        console.error("NotificationDetailSensei - exception:", err)
        if (mounted) setNotification(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchDetail()
    return () => { mounted = false }
  }, [notificationId])

  if (loading) return <p className="p-8 text-gray-600">Cargando notificación…</p>
  if (!notification) return <p className="p-8 text-gray-600">No se encontró la notificación.</p>

  return (
    <div className="p-8">
      {/* Header con botón atrás */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <BackButton onBack={onBack} />
          <h2 className="text-2xl font-light uppercase tracking-wide text-[#1a1a1a] mb-6">
            {notification.title}
          </h2>
          <div className="text-sm text-gray-500 mt-1">
            {notification.sensei?.full_name
              ? `De ${notification.sensei.full_name}`
              : "Remitente desconocido"}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="bg-white shadow-sm border border-gray-200 p-6 rounded">
        <div className="prose max-w-none text-gray-700 whitespace-pre-line">
          {notification.body}
        </div>

        {/* Adjuntos */}
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

        {/* Footer con fecha y remitente */}
        <div className="mt-6 text-xs text-gray-500">
          {notification.created_at && (
            <span>Enviado el {new Date(notification.created_at).toLocaleString("es-AR")}</span>
          )}
        </div>
      </div>
    </div>
  )
}
