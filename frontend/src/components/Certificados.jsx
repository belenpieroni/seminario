import { Award, Download, ExternalLink } from "lucide-react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";

const certificates = [
  {
    id: 1,
    title: "Cinturón Verde",
    date: "15 de agosto de 2024",
    issuer: "Takayama Dojo",
    status: "actual",
  },
  {
    id: 2,
    title: "Cinturón Naranja",
    date: "10 de junio de 2023",
    issuer: "Takayama Dojo",
    status: "completado",
  },
  {
    id: 3,
    title: "Cinturón Amarillo",
    date: "5 de septiembre de 2022",
    issuer: "Takayama Dojo",
    status: "completado",
  },
];

export function Certificados() {
  return (
    <Card className="p-6 border-[#e5e5e5] bg-white">
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-5 h-5" style={{ color: "#c41e3a" }} />
        <h2 className="tracking-wide leading-relaxed" style={{ color: "#111111" }}>
          Mis Certificados
        </h2>
      </div>

      <div className="space-y-3">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="p-4 rounded-lg border transition-all hover:shadow-sm"
            style={{
              borderColor: "#e5e5e5",
              backgroundColor: cert.status === "actual" ? "#f8f8f8" : "white",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="leading-relaxed" style={{ color: "#111111" }}>
                    {cert.title}
                  </h3>
                  {cert.status === "actual" && (
                    <Badge
                      className="px-2 py-0.5"
                      style={{ backgroundColor: "#c41e3a", color: "white" }}
                    >
                      Actual
                    </Badge>
                  )}
                </div>
                <p className="leading-relaxed text-gray-500 text-sm">{cert.issuer}</p>
                <p className="mt-1 leading-relaxed text-gray-500 text-sm">
                  Obtenido: {cert.date}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 text-white" />
                </Button>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t" style={{ borderColor: "#e5e5e5" }}>
        <div className="text-center">
          <p className="leading-relaxed text-gray-500">
            Próximo nivel: <span className="text-red-700">Cinturón Azul</span>
          </p>
          <p className="mt-1 leading-relaxed text-gray-500 text-sm">
            Fecha estimada del examen: octubre de 2025
          </p>
        </div>
      </div>
    </Card>
  );
}
