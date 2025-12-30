import { useState } from "react"
import { supabase } from "../../supabaseClient"
import { X, Paperclip } from "lucide-react"

export function SenseiNotifications() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [attachments, setAttachments] = useState([])
  const [sending, setSending] = useState(false)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setAttachments(files)
  }

  const handleSend = async () => {
    setSending(true)

    try {
      // Obtener sensei y dojo
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) throw new Error("Usuario no encontrado")

      const { data: senseiData } = await supabase
        .from("sensei")
        .select("id, dojo_id")
        .eq("user_id", user.id)
        .single()

      if (!senseiData) throw new Error("Sensei no encontrado")

      // Subir archivos a storage (ejemplo: bucket "attachments")
      const uploadedFiles = []
      for (const file of attachments) {
        const filePath = `${senseiData.id}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(filePath, file)

        if (uploadError) {
          console.error("Error subiendo archivo:", uploadError.message)
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("attachments")
            .getPublicUrl(filePath)
          uploadedFiles.push({
            type: file.type.includes("pdf") ? "pdf" : "image",
            url: publicUrlData.publicUrl,
          })
        }
      }

      // Insertar notificación en la tabla
      const { error } = await supabase.from("notification").insert({
        dojo_id: senseiData.dojo_id,
        sender_id: senseiData.id, // usamos sensei.id, no user_id
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
    <div className="p-8 space-y-6">
      <h2 className="text-[#1a1a1a] text-2xl font-semibold">Enviar notificación</h2>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        {/* Título */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="w-full border-b-2 border-[#c41e3a] focus:border-[#a01830] outline-none pb-2 text-lg"
        />

        {/* Cuerpo */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe tu mensaje..."
          rows={8}
          className="w-full border border-gray-300 rounded-lg p-4 focus:border-[#c41e3a] outline-none resize-none"
        />

        {/* Adjuntos */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-[#c41e3a] hover:text-[#a01830]">
            <Paperclip className="w-5 h-5" />
            <span>Adjuntar archivos</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              {attachments.map((file, idx) => (
                <span
                  key={idx}
                  className="bg-gray-200 px-2 py-1 rounded flex items-center gap-1"
                >
                  {file.name}
                  <button
                    onClick={() =>
                      setAttachments(attachments.filter((_, i) => i !== idx))
                    }
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Botón enviar */}
        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={sending}
            className="px-6 py-3 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a01830] transition-colors"
          >
            {sending ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  )
}
