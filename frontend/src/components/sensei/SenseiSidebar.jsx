import { LayoutDashboard, Users, ClipboardList, Award, LogOut, Bell } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

export function SenseiSidebar({ onLogout, isHead }) {
  const navigate = useNavigate()
  const location = useLocation()

  // Ítems base (siempre visibles)
  const baseItems = [
    { path: "/sensei/dashboard", label: "Mi dojo", icon: LayoutDashboard },
    { path: "/sensei/students", label: "Alumnos", icon: Users },
    { path: "/sensei/certificados", label: "Certificados", icon: Award },
    { path: "/sensei/notifications", label: "Notificaciones", icon: Bell },
  ]

  // Exámenes solo si es head
  const examItem = isHead
    ? { path: "/sensei/manage-exams", label: "Exámenes", icon: ClipboardList }
    : { path: "/sensei/exams", label: "Exámenes del dojo", icon: ClipboardList }

  const menuItems = isHead
    ? [...baseItems, examItem, { path: "/sensei/senseis", label: "Senseis", icon: Users }]
    : [...baseItems, examItem]

  return (
    <aside className="w-64 bg-[#1a1a1a] text-white min-h-screen p-6">
      <nav className="space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon
          const active = location.pathname === item.path

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? "bg-[#c41e3a] text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          )
        })}

        <div className="pt-6 mt-6 border-t border-gray-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </nav>
    </aside>
  )
}
