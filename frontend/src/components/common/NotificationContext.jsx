// src/context/NotificationContext.jsx
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [studentId, setStudentId] = useState(null)
  const [dojoId, setDojoId] = useState(null)

  // función que calcula las no leídas para un student/doj
  const refreshUnread = async (sid, did) => {
    if (!sid || !did) {
      console.debug("refreshUnread: falta studentId o dojoId", { sid, did })
      return
    }
    try {
      console.debug("refreshUnread: consultando unread para", { sid, did })
      const { data, error } = await supabase
        .from("notification")
        .select(`id, notification_read!left(notification_id, student_id)`)
        .eq("dojo_id", did)

      if (error) {
        console.error("refreshUnread - error query notifications:", error)
        return
      }

      const unread = (data || []).filter(
        (n) => !n.notification_read.some((r) => r.student_id === sid)
      )
      console.debug("refreshUnread - unread count:", unread.length)
      setUnreadCount(unread.length)
    } catch (err) {
      console.error("refreshUnread - exception:", err)
    }
  }

  // init: obtener student y dojo al montar
  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) console.error("NotificationProvider getUser error:", userError)
        const user = userData?.user
        if (!user) {
          console.debug("NotificationProvider: no hay usuario logueado")
          return
        }

        const { data: studentData, error: studentError } = await supabase
          .from("student")
          .select("id, dojo_id")
          .eq("user_id", user.id)
          .single()

        if (studentError) {
          console.error("NotificationProvider student query error:", studentError)
          return
        }
        if (!studentData) {
          console.warn("NotificationProvider: no se encontró student para user", user.id)
          return
        }

        if (!mounted) return
        setStudentId(studentData.id)
        setDojoId(studentData.dojo_id)

        // inicializar contador
        await refreshUnread(studentData.id, studentData.dojo_id)
      } catch (err) {
        console.error("NotificationProvider init exception:", err)
      }
    }

    init()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Realtime: suscribimos cuando tenemos studentId y dojoId
  useEffect(() => {
    if (!studentId || !dojoId) return

    const handleChange = () => {
      refreshUnread(studentId, dojoId)
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

    console.debug("NotificationProvider: suscripciones realtime activas", { studentId, dojoId })

    return () => {
      supabase.removeChannel(channelRead)
      supabase.removeChannel(channelNotif)
      console.debug("NotificationProvider: suscripciones realtime removidas")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, dojoId])

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, refreshUnread }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
