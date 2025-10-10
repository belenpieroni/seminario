import { useEffect, useState } from "react";
import { Award, Download, ExternalLink } from "lucide-react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";

const niveles = [
  "Cinturón Blanco",
  "Cinturón Amarillo",
  "Cinturón Naranja",
  "Cinturón Verde",
  "Cinturón Azul",
  "Cinturón Marrón",
  "Cinturón Negro",
];

// Simulación de fetch desde backend
const fetchCertificados = () =>
  Promise.resolve([
    {
      id: 1,
      title: "Cinturón Verde",
      date: "15 de agosto de 2025",
      issuer: "Takayama Dojo",
      status: "actual",
      fileUrl: null,
    },
    {
      id: 2,
      title: "Cinturón Naranja",
      date: "10 de junio de 2024",
      issuer: "Takayama Dojo",
      status: "completado",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    },
    {
      id: 3,
      title: "Cinturón Amarillo",
      date: "5 de septiembre de 2022",
      issuer: "Takayama Dojo",
      status: "completado",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    },
  ]);

export function Certificados() {
  const [certificados, setCertificados] = useState([]);

  useEffect(() => {
    fetchCertificados().then(setCertificados);
  }, []);

  const actual = certificados.find((c) => c.status === "actual");
  const indiceActual = niveles.indexOf(actual?.title);
  const siguienteNivel = indiceActual >= 0 ? niveles[indiceActual + 1] : null;


  return (
    <Card className="p-6 border-[#e5e5e5] bg-white">
        <div className="flex items-center gap-3 mb-6">
            <Award className="w-5 h-5" style={{ color: "#c41e3a" }} />
            <h2 className="tracking-wide leading-relaxed" style={{ color: "#111111" }}>
            Mis Certificados
            </h2>
        </div>

        <div className="space-y-3">
            {certificados.map((cert) => (
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
                    {typeof cert.fileUrl === "string" && cert.fileUrl.trim() !== "" ? (
                        <>
                        <a href={cert.fileUrl} download target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4 text-white" />
                            </Button>
                        </a>
                        <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4 text-white" />
                            </Button>
                        </a>
                        </>
                    ) : (
                        <span className="text-xs text-gray-400 italic">Archivo en proceso de emisión</span>
                    )}
                </div>
                </div>
            </div>
            ))}
        </div>

        <div className="mt-6 pt-6 border-t" style={{ borderColor: "#e5e5e5" }}>
            <div className="text-center">
                {siguienteNivel ? (
                <p className="leading-relaxed text-gray-500">
                    Próximo nivel: <span className="text-red-700">{siguienteNivel}</span>
                </p>
                ) : (
                <p className="leading-relaxed text-gray-400 italic">
                    Ya alcanzaste el cinturón negro
                </p>
                )}
            </div>
        </div>
    </Card>
  );
}
