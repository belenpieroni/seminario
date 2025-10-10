import { MapPin, Phone, Users } from "lucide-react";
import { Card } from "./Card";

export function DojoInfo() {
  return (
    <Card className="p-6 border-[#e5e5e5] bg-white">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-wide text-gray-900">
               Mi Dojo
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Takayama Dojo
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-700 text-white text-xl">
            🥋
          </div>
        </div>
        <div className="grid gap-3 mt-4">
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <MapPin className="w-4 h-4 text-red-700" />
            <span>Calle Falsa 123, La Plata</span>
          </div>

          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <Phone className="w-4 h-4 text-red-700" />
            <span>+54 9 11 1234-5678</span>
          </div>

          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <Users className="w-4 h-4 text-red-700" />
            <span>Sensei Cosme Fulanito</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
