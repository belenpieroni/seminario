import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Award,
  LogOut
} from "lucide-react"

export function SenseiSidebar({ currentView, onNavigate, onLogout }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "alumnos", label: "Alumnos", icon: Users },
    { id: "registrar-examen", label: "Registrar examen", icon: ClipboardList },
    { id: "certificados", label: "Certificados", icon: Award }
  ]

  return (
    <aside className="w-64 bg-[#1a1a1a] text-white min-h-screen p-6">
      <nav className="space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id
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
