import { LayoutDashboard, Bell, Award, User, LogOut, ClipboardList } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

export function StudentSidebar({ onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { path: "/student/dashboard", label: "Mi dojo", icon: LayoutDashboard },
    { path: "/student/notifications", label: "Notificaciones", icon: Bell },
    { path: "/student/exams", label: "Exámenes", icon: ClipboardList },
    { path: "/student/progress", label: "Mi progreso", icon: User },
    { path: "/student/certificados", label: "Mis certificados", icon: Award },
  ]

  return (
    <aside className="w-64 bg-[#1a1a1a] text-white min-h-screen shadow-lg border-r border-gray-700">
      {/* Branding */}
      <div className="px-6 py-8 border-b border-gray-700">
        <h1 className="text-s tracking-[0.3em] font-light uppercase">
          Menú
        </h1>
      </div>

      {/* Navegación */}
      <nav className="mt-6 space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon
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
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          )
        })}

        {/* Logout */}
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
