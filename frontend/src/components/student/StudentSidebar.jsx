import { LayoutDashboard, Award, User, LogOut, ClipboardList } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { NotificationBell } from "../common/NotificationBell"
import { useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"
import { useNotifications } from "../common/NotificationContext" // ajustá la ruta si hace falta

export function StudentSidebar({ onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()

  // Desestructuramos el contexto (si no está, quedan undefined)
  const notifCtx = useNotifications()
  const contextUnreadCount = notifCtx?.unreadCount ?? null
  const contextSetUnreadCount = notifCtx?.setUnreadCount ?? null
  const contextRefreshUnread = notifCtx?.refreshUnread ?? null

  // Estado local como fallback si el contexto no está presente
  const [localHasUnread, setLocalHasUnread] = useState(false)
  const [studentId, setStudentId] = useState(null)
  const [dojoId, setDojoId] = useState(null)

  // fetch que actualiza tanto el contexto (si existe) como el estado local
  const fetchUnread = async (sid, did) => {
    if (!sid || !did) return
    try {
      const { data, error } = await supabase
        .from("notification")
        .select(`
          id,
          notification_read!left(notification_id, student_id)
        `)
        .eq("dojo_id", did)

      if (error) {
        console.error("Error fetchUnread:", error)
        return
      }

      const unread = (data || []).filter(
        n => !n.notification_read.some(r => r.student_id === sid)
      )
      const unreadCount = unread.length

      // actualizar contexto si existe (número real)
      if (contextSetUnreadCount) {
        contextSetUnreadCount(unreadCount)
      } else {
        setLocalHasUnread(unreadCount > 0)
      }
    } catch (err) {
      console.error("fetchUnread exception:", err)
    }
  }

  // init: obtener studentId y dojoId y calcular unread inicial
  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const user = userData?.user
        if (!user) {
          if (mounted) {
            if (!contextSetUnreadCount) setLocalHasUnread(false)
            else contextSetUnreadCount(0)
          }
          return
        }

        const { data: studentData, error: studentError } = await supabase
          .from("student")
          .select("id, dojo_id")
          .eq("user_id", user.id)
          .single()

        if (studentError) {
          console.error("student query error:", studentError)
          return
        }
        if (!studentData) return

        if (!mounted) return
        setStudentId(studentData.id)
        setDojoId(studentData.dojo_id)

        // preferir refresh del contexto si existe
        if (contextRefreshUnread) {
          await contextRefreshUnread(studentData.id, studentData.dojo_id)
        } else {
          await fetchUnread(studentData.id, studentData.dojo_id)
        }
      } catch (err) {
        console.error("init exception:", err)
      }
    }

    init()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Suscripciones realtime solo después de tener studentId y dojoId
  useEffect(() => {
    if (!studentId || !dojoId) return

    const handleChange = () => {
      if (contextRefreshUnread) {
        contextRefreshUnread(studentId, dojoId)
      } else {
        fetchUnread(studentId, dojoId)
      }
    }

    const channelRead = supabase
      .channel(`notification_read_student_${studentId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notification_read" },
        handleChange
      )
      .subscribe()

    const channelNotif = supabase
      .channel(`notification_dojo_${dojoId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notification" },
        handleChange
      )
      .subscribe()

    return () => {
      // pasar el objeto channel para remover correctamente
      supabase.removeChannel(channelRead)
      supabase.removeChannel(channelNotif)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, dojoId, contextRefreshUnread])

  // decidir qué prop pasar al NotificationBell:
  // si el contexto tiene unreadCount, usarlo (convertido a booleano para el punto)
  // sino usar el estado local booleano
  const unreadCountToShow =
    typeof contextUnreadCount === "number" ? contextUnreadCount : (localHasUnread ? 1 : 0)

  const menuItems = [
    { path: "/student/dashboard", label: "Mi dojo", icon: LayoutDashboard },
    { path: "/student/notifications", label: "Notificaciones", icon: null },
    { path: "/student/exams", label: "Exámenes", icon: ClipboardList },
    { path: "/student/progress", label: "Mi progreso", icon: User },
    { path: "/student/certificados", label: "Certificados", icon: Award },
  ]

  return (
    <aside className="w-64 bg-[#1a1a1a] text-white min-h-screen shadow-lg border-r border-gray-700">
      <div className="px-6 py-8 border-b border-gray-700">
        <h1 className="text-s tracking-[0.3em] font-light uppercase">Menú</h1>
      </div>

      <nav className="mt-6 space-y-1">
        {menuItems.map(item => {
          const active = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm tracking-wide uppercase transition-colors border-l-4 ${
                active
                  ? "bg-[#c41e3a] text-white border-[#c41e3a]"
                  : "text-gray-300 hover:bg-gray-800 border-transparent"
              }`}
            >
              {item.icon ? (
                <item.icon className="w-5 h-5" />
              ) : (
                <NotificationBell unreadCount={unreadCountToShow} />
              )}
              <span>{item.label}</span>
            </button>
          )
        })}

        <div className="pt-6 mt-6 border-t border-gray-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-6 py-3 text-sm tracking-wide uppercase text-gray-300 hover:bg-gray-800 transition-colors border-l-4 border-transparent"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </nav>
    </aside>
  )
}
