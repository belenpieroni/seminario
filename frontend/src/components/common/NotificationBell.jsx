// common/NotificationBell.jsx
import { Bell } from "lucide-react"

export function NotificationBell({ unreadCount = 0 }) {
  const hasUnread = unreadCount > 0

  return (
    <div className="relative">
      <Bell className="w-5 h-5 text-white" />
      {hasUnread && (
        <span
          className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full ring-2 ring-[#1a1a1a]"
          aria-label="Tiene notificaciones sin leer"
        />
      )}
    </div>
  )
}
