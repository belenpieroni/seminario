import { MapPin, Phone, Users } from "lucide-react";
import { Card } from "./Card";

// Simulación de datos del dojo (esto debe venir del backend)
const dojo = {
  nombre: "Takayama Dojo",
  direccion: "Av. del Petroleo Argentino 417, Berisso, Provincia de Buenos Aires",
  telefono: "+54 9 11 1234-5678",
  sensei: "Ivo Balduzzi",
  logoUrl: null,
};

export function DojoInfo() {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dojo.direccion)}`;
  const telefonoUrl = `tel:${dojo.telefono.replace(/\s+/g, "")}`;

  return (
    <Card className="p-6 border-[#e5e5e5] bg-white">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-wide text-gray-900">
              Mi Dojo
            </h2>
            <p className="mt-1 text-sm text-gray-500">{dojo.nombre}</p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-700 text-white text-xl overflow-hidden">
            {dojo.logoUrl ? (
              <img src={dojo.logoUrl} alt="Logo del dojo" className="w-full h-full object-cover" />
            ) : (
              <span>🥋</span>
            )}
          </div>
        </div>

        <div className="grid gap-3 mt-4">
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <MapPin className="w-4 h-4 text-red-700" />
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {dojo.direccion}
            </a>
          </div>

          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <Phone className="w-4 h-4 text-red-700" />
            <a href={telefonoUrl} className="hover:underline">
              {dojo.telefono}
            </a>
          </div>

          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <Users className="w-4 h-4 text-red-700" />
            <span>Sensei {dojo.sensei}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
