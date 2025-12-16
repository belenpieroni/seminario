import { useState } from "react";
import { CheckCircle } from "lucide-react";

export default function AdminCreateDojo({ onCreateDojo }) {
  const [activeTab, setActiveTab] = useState("dojo");
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");

  const [dojoData, setDojoData] = useState({
    name: "",
    address: "",
    locality: "",
    province: "",
    phone: "",
    senseiName: "",
    senseiRank: "",
  });

  const provinces = [
    "Buenos Aires",
    "Córdoba",
    "Santa Fe",
    "Mendoza",
    "Tucumán",
    "Entre Ríos",
  ];

  const generateEmail = (senseiName, dojoName) => {
    const parts = senseiName.toLowerCase().trim().split(" ");
    const first = parts[0] || "";
    const last = parts[parts.length - 1] || "";
    const dojoSlug = dojoName.toLowerCase().replace(/\s+/g, "");
    return `${first}${last}@acargo.${dojoSlug}.com`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dojoData.name || !dojoData.senseiName || !dojoData.senseiRank) {
      alert("Completá todos los datos requeridos.");
      return;
    }

    try {
      const email = generateEmail(dojoData.senseiName, dojoData.name);
      setGeneratedEmail(email);

      const payload = {
        dojo: {
          name: dojoData.name.trim(),
          address: dojoData.address.trim(),
          locality: dojoData.locality.trim(),
          province: dojoData.province,
          phone: `+54${dojoData.phone}`,
        },
        sensei: {
          full_name: dojoData.senseiName.trim(),
          rank: dojoData.senseiRank,
        },
      };

      await onCreateDojo(payload);

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setActiveTab("dojo");
        setDojoData({
          name: "",
          address: "",
          locality: "",
          province: "",
          phone: "",
          senseiName: "",
          senseiRank: "",
        });
      }, 3500);

    } catch (err) {
      console.error(err);
      alert("Error creando dojo y sensei.");
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-6">
        Crear nuevo Dojo
      </h2>

      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-green-800">Dojo creado exitosamente</h3>
          </div>
          <p className="text-green-700">
            Se ha asignado el sensei a cargo y se ha creado su usuario.
          </p>
          <div className="mt-4 p-3 bg-white rounded border border-green-300">
            <p className="text-gray-600">Email generado para el sensei:</p>
            <p className="text-[#1a1a1a] mt-1">{generatedEmail}</p>
            <p className="text-gray-600 mt-2">Contraseña temporal: Karate2025!</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("dojo")}
            className={`px-6 py-3 font-medium ${
              activeTab === "dojo"
                ? "border-b-2 border-[#c41e3a] text-[#1a1a1a]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Información del Dojo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sensei")}
            className={`px-6 py-3 font-medium ${
              activeTab === "sensei"
                ? "border-b-2 border-[#c41e3a] text-[#1a1a1a]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sensei a cargo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tab Dojo */}
          {activeTab === "dojo" && (
            <>
              <div>
                <label className="block mb-2 text-[#1a1a1a]">Nombre del Dojo</label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-lg">
                    Dojo
                  </span>
                  <input
                    type="text"
                    value={dojoData.name}
                    onChange={(e) =>
                      setDojoData({ ...dojoData, name: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                    placeholder="Dragón"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[#1a1a1a]">Dirección</label>
                <input
                  type="text"
                  value={dojoData.address}
                  onChange={(e) =>
                    setDojoData({ ...dojoData, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                  placeholder="Calle Falsa 123"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-[#1a1a1a]">Localidad</label>
                  <input
                    type="text"
                    value={dojoData.locality}
                    onChange={(e) =>
                      setDojoData({ ...dojoData, locality: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                    placeholder="Ej: Córdoba"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-[#1a1a1a]">Provincia</label>
                  <select
                    value={dojoData.province}
                    onChange={(e) =>
                      setDojoData({ ...dojoData, province: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                    required
                  >
                    <option value="">Seleccionar provincia</option>
                    {provinces.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[#1a1a1a]">Teléfono</label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-lg">
                    +54
                  </span>
                  <input
                    type="text"
                    value={dojoData.phone}
                    onChange={(e) =>
                      setDojoData({ ...dojoData, phone: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                    placeholder="11 1234-5678"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Tab Sensei */}
          {activeTab === "sensei" && (
            <>
              <div>
                <label className="block mb-2 text-[#1a1a1a]">Nombre y apellido</label>
                <input
                  type="text"
                  value={dojoData.senseiName}
                  onChange={(e) =>
                    setDojoData({ ...dojoData, senseiName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                  placeholder="Takeshi Yamamoto"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-[#1a1a1a]">Grado de Dan</label>
                <select
                  value={dojoData.senseiRank}
                  onChange={(e) =>
                    setDojoData({ ...dojoData, senseiRank: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                  required
                >
                  <option value="">Seleccionar rango...</option>
                  <option value="1er Dan"> 1er Dan </option>
                  <option value="2do Dan"> 2do Dan </option>
                  <option value="3er Dan"> 3er Dan </option>
                  <option value="4to Dan"> 4to Dan </option>
                  <option value="5to Dan"> 5to Dan </option>
                  <option value="6to Dan"> 6to Dan </option>
                  <option value="7mo Dan"> 7mo Dan </option>
                  <option value="8vo Dan"> 8vo Dan </option>
                  <option value="9no Dan"> 9no Dan </option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-blue-800">
                  Se creará un usuario con email:{" "}
                  {dojoData.senseiName && dojoData.name
                    ? generateEmail(dojoData.senseiName, dojoData.name)
                    : "nombreapellido@acargo.nombredojo.com"}
                </p>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-[#c41e3a] text-white py-3 rounded-lg hover:bg-[#a01830] transition-colors"
          >
            Crear Dojo y asignar Sensei
          </button>
        </form>
      </div>
    </div>
  );
}
