import { useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"
import { X, Paperclip, Pencil, Send } from "lucide-react"
import NotificationDetailSensei from "./NotificationDetailSensei"
console.log("NotificationDetailSensei import:", NotificationDetailSensei)

export default function SenseiNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  // detalle modal
  const [selected, setSelected] = useState(null)

  // compose bottom sheet
  const [composeOpen, setComposeOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [attachments, setAttachments] = useState([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("notification")
        .select("id, title, body, attachments, created_at, sensei:sender_id ( full_name )")
        .order("created_at", { ascending: false })
      setNotifications(data || [])
      setLoading(false)
    }
    fetchNotifications()
  }, [])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setAttachments((prev) => [...prev, ...files])
  }

  const removeAttachment = (idx) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx))

  const handleSend = async () => {
    setSending(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) throw new Error("Usuario no encontrado")

      const { data: senseiData } = await supabase
        .from("sensei")
        .select("id, dojo_id")
        .eq("user_id", user.id)
        .single()

      if (!senseiData) throw new Error("Sensei no encontrado")

      const uploadedFiles = []
      for (const file of attachments) {
        const filePath = `${senseiData.id}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(filePath, file)
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("attachments")
            .getPublicUrl(filePath)
          uploadedFiles.push({
            type: file.type.includes("pdf") ? "pdf" : "image",
            url: publicUrlData.publicUrl,
          })
        }
      }

      const { error } = await supabase.from("notification").insert({
        dojo_id: senseiData.dojo_id,
        sender_id: senseiData.id,
        title,
        body,
        attachments: uploadedFiles,
      })
      if (error) throw error

      alert("Notificación enviada con éxito.")
      setTitle("")
      setBody("")
      setAttachments([])
    } catch (err) {
      console.error(err)
      alert("Error al enviar la notificación.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-8">
      {selected ? (
        // Vista de detalle completa
        <NotificationDetailSensei
          notificationId={selected.id}
          onBack={() => setSelected(null)}
        />
      ) : (
        <>
          <h2 className="text-2xl font-light uppercase tracking-wide text-[#1a1a1a] mb-6">
            Notificaciones del <span className="text-[#c41e3a]">Dojo</span>
          </h2>

          {/* Bandeja de entrada */}
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
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setSelected(n)}
                    className="w-full text-left px-6 py-4 hover:bg-gray-50 flex justify-between items-start gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#1a1a1a] truncate">{n.title}</div>
                      <div className="text-sm text-gray-600 mt-1 truncate max-w-[60ch]">
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
                ))
              )}
            </div>
          </div>

          {/* Botón redactar */}
          <button
            onClick={() => setComposeOpen(true)}
            className="fixed right-6 bottom-6 flex items-center gap-3 bg-[#c41e3a] text-white px-4 py-3 uppercase text-xs tracking-wide shadow-lg hover:bg-[#a01830] transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Redactar
          </button>

          {/* Panel redactar */}
          {/* ... tu compose panel aquí */}
        </>
      )}
    </div>
  )
}
