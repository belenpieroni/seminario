import { useEffect, useState } from "react";
import { Bell, Calendar, Trophy, AlertCircle } from "lucide-react";
import { Card } from "./Card";
import { Badge } from "./Badge";

// Simulación de fetch desde backend
const fetchNotificaciones = () =>
  Promise.resolve([
    {
      id: 1,
      type: "evento",
      title: "Próximo Torneo",
      message: "Campeonato Regional el 5 de noviembre. La inscripción cierra pronto.",
      time: "hace 2 horas",
      unread: true,
    },
    {
      id: 2,
      type: "logro",
      title: "Examen de Cinturón Programado",
      message: "Tu examen para cinturón azul está programado para el 25 de octubre.",
      time: "hace 1 día",
      unread: true,
    },
    {
      id: 3,
      type: "recordatorio",
      title: "Cuota Mensual",
      message: "El pago de la cuota de octubre vence el día 15.",
      time: "hace 3 días",
      unread: false,
    },
  ]);

// Mapeo de tipo → ícono
const iconMap = {
  evento: Calendar,
  logro: Trophy,
  recordatorio: AlertCircle,
};

export function Notifications() {
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    fetchNotificaciones().then(setNotificaciones);
  }, []);

  const unreadCount = notificaciones.filter((n) => n.unread).length;

  return (
    <Card className="p-6 border-[#e5e5e5] bg-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5" style={{ color: "#c41e3a" }} />
          <h2 className="tracking-wide leading-relaxed" style={{ color: "#111111" }}>
            Notificaciones
          </h2>
        </div>
        {unreadCount > 0 && (
          <Badge
            className="rounded-full px-2 py-0.5"
            style={{ backgroundColor: "#c41e3a", color: "white" }}
          >
            {unreadCount}
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {notificaciones.map((n) => {
          const Icon = iconMap[n.type] || AlertCircle;
          return (
            <div
              key={n.id}
              className="p-4 rounded-lg transition-colors hover:bg-[#f8f8f8]"
              style={{
                backgroundColor: n.unread ? "#f8f8f8" : "transparent",
                borderLeft: n.unread ? "3px solid #c41e3a" : "3px solid transparent",
              }}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Icon className="w-4 h-4" style={{ color: "#666666" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="leading-relaxed" style={{ color: "#111111" }}>
                    {n.title}
                  </p>
                  <p className="mt-1 leading-relaxed" style={{ color: "#666666" }}>
                    {n.message}
                  </p>
                  <p className="mt-2 leading-relaxed" style={{ color: "#666666", fontSize: "0.875rem" }}>
                    {n.time}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
