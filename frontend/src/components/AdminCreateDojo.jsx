import { supabase } from "../supabaseClient";
import { useState } from "react";
import { CheckCircle, X } from "lucide-react";

const LOCALIDADES_POR_PROVINCIA = {
  "Buenos Aires": [
    "La Plata",
    "Mar del Plata",
    "Bahía Blanca",
    "Tandil",
    "Quilmes",
    "San Isidro",
    "Avellaneda",
    "Lomas de Zamora",
    "Morón",
    "San Miguel",
    "Tigre",
    "Vicente López",
  ],
  Córdoba: [
    "Córdoba Capital",
    "Villa Carlos Paz",
    "Río Cuarto",
    "Villa María",
    "Alta Gracia",
  ],
  "Santa Fe": ["Rosario", "Santa Fe Capital", "Rafaela", "Venado Tuerto"],
};

const PROVINCIAS = Object.keys(LOCALIDADES_POR_PROVINCIA);

export default function AdminCreateDojo({ onCreateDojo }) {
  const [activeTab, setActiveTab] = useState("dojo");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");

  const [dojoData, setDojoData] = useState({
    name: "",
    address: "",
    province: "",
    locality: "",
    phone: "",
    senseiName: "",
    senseiRank: "",
  });

  const [provinceFilter, setProvinceFilter] = useState("");
  const [localityFilter, setLocalityFilter] = useState("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);

  const filteredProvinces = PROVINCIAS.filter((p) =>
    p.toLowerCase().includes(provinceFilter.toLowerCase())
  );

  const filteredLocalities =
    dojoData.province && LOCALIDADES_POR_PROVINCIA[dojoData.province]
      ? LOCALIDADES_POR_PROVINCIA[dojoData.province].filter((l) =>
          l.toLowerCase().includes(localityFilter.toLowerCase())
        )
      : [];

  const generateEmail = (senseiName, dojoName) => {
    const parts = senseiName.toLowerCase().trim().split(" ");
    const first = parts[0] || "";
    const last = parts[parts.length - 1] || "";
    const dojoSlug = dojoName.toLowerCase().replace(/\s+/g, "");
    return `${first}${last}@${dojoSlug}.com`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = generateEmail(dojoData.senseiName, dojoData.name);
    setGeneratedEmail(email);

    const payload = {
      dojo: {
        name: dojoData.name.trim(),
        address: dojoData.address.trim(),
        province: dojoData.province,
        city: dojoData.locality,
        phone: `+54${dojoData.phone}`,
      },
      sensei: {
        full_name: dojoData.senseiName.trim(),
        rank: dojoData.senseiRank,
      },
      email, 
    };

    const { data, error } = await supabase.functions.invoke("create-head-sensei", {
      body: payload,
    });

    if (error) {
      console.error("Error invocando función:", error);
    } else {
      console.log("Respuesta función:", data);
    }

    setShowConfirm(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setActiveTab("dojo");
      setDojoData({
        name: "",
        address: "",
        province: "",
        locality: "",
        phone: "",
        senseiName: "",
        senseiRank: "",
      });
    }, 3500);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl text-[#1a1a1a] mb-6">Crear nuevo Dojo</h2>

      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="text-green-600" />
            <h3 className="text-green-800">Dojo creado exitosamente</h3>
          </div>
          <p className="text-green-700">
            Email generado: <strong>{generatedEmail}</strong>
          </p>
        </div>
      )}

      <div className="bg-white shadow-md">
        {/* TABS */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("dojo")}
            className={`flex-1 py-4 ${
              activeTab === "dojo"
                ? "bg-[#c41e3a] text-white"
                : "bg-gray-50 text-gray-600"
            }`}
          >
            Información del Dojo
          </button>
          <button
            onClick={() => setActiveTab("sensei")}
            className={`flex-1 py-4 ${
              activeTab === "sensei"
                ? "bg-[#c41e3a] text-white"
                : "bg-gray-50 text-gray-600"
            }`}
          >
            Sensei a cargo
          </button>
        </div>

        <form className="p-6 space-y-6">
          {/* DOJO */}
          {activeTab === "dojo" && (
            <>
              {/* Nombre */}
              <div>
                <div className="flex border">
                  <span className="px-4 py-3 bg-gray-100 border-r">Dojo</span>
                  <input
                    className="flex-1 px-4 py-3"
                    value={dojoData.name}
                    onChange={e =>
                      setDojoData({ ...dojoData, name: e.target.value })
                    }
                    placeholder="Nombre"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <input
                  className="w-full px-4 py-3 border"
                  value={dojoData.address}
                  onChange={e =>
                    setDojoData({ ...dojoData, address: e.target.value })
                  }
                  placeholder="Dirección"
                />
              </div>

              {/* Provincia */}
              <div>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 border"
                    value={dojoData.province || provinceFilter}
                    onChange={e => {
                      setProvinceFilter(e.target.value);
                      setDojoData({ ...dojoData, province: "", locality: "" });
                      setShowProvinceDropdown(true);
                    }}
                    onFocus={() => setShowProvinceDropdown(true)}
                    placeholder="Provincia..."
                  />
                  {showProvinceDropdown && (
                    <div className="absolute w-full bg-white border max-h-60 overflow-y-auto">
                      {filteredProvinces.map(p => (
                        <div
                          key={p}
                          onClick={() => {
                            setDojoData({ ...dojoData, province: p });
                            setProvinceFilter("");
                            setShowProvinceDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Localidad */}
              <div>
                <label className="block mb-2">Localidad</label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 border disabled:bg-gray-100"
                    value={dojoData.locality || localityFilter}
                    onChange={e => {
                      setLocalityFilter(e.target.value);
                      setShowLocalityDropdown(true);
                    }}
                    onFocus={() =>
                      dojoData.province && setShowLocalityDropdown(true)
                    }
                    disabled={!dojoData.province}
                    placeholder="Localidad..."
                  />
                  {showLocalityDropdown && (
                    <div className="absolute w-full bg-white border max-h-60 overflow-y-auto">
                      {filteredLocalities.map(l => (
                        <div
                          key={l}
                          onClick={() => {
                            setDojoData({ ...dojoData, locality: l });
                            setLocalityFilter("");
                            setShowLocalityDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {l}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <div className="flex border">
                  <span className="px-4 py-3 bg-gray-100 border-r">+54</span>
                  <input
                    className="flex-1 px-4 py-3"
                    value={dojoData.phone}
                    onChange={e =>
                      setDojoData({ ...dojoData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab("sensei")}
                  className="px-6 py-3 bg-[#c41e3a] text-white"
                >
                  Siguiente
                </button>
              </div>
            </>
          )}

          {/* SENSEI */}
          {activeTab === "sensei" && (
            <>
              <div>
                <label className="block mb-2">Nombre y apellido</label>
                <input
                  className="w-full px-4 py-3 border"
                  value={dojoData.senseiName}
                  onChange={e =>
                    setDojoData({ ...dojoData, senseiName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block mb-2">Rango</label>
                <select
                  className="w-full px-4 py-3 border"
                  value={dojoData.senseiRank}
                  onChange={e =>
                    setDojoData({ ...dojoData, senseiRank: e.target.value })
                  }
                >
                  <option value="">Seleccionar rango</option>
                  <option>1er Dan</option>
                  <option>2do Dan</option>
                  <option>3er Dan</option>
                  <option>4to Dan</option>
                  <option>5to Dan</option>
                  <option>6to Dan</option>
                  <option>7mo Dan</option>
                  <option>8vo Dan</option>
                  <option>9no Dan</option>
                </select>
              </div>

              <div className="bg-orange-50 border p-4">
                Email:{" "}
                <strong>
                  {dojoData.senseiName && dojoData.name
                    ? generateEmail(dojoData.senseiName, dojoData.name)
                    : "nombreapellido@nombredojo.com"}
                </strong>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("dojo")}
                  className="px-6 py-3 bg-gray-300"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="px-6 py-3 bg-[#c41e3a] text-white"
                >
                  Crear Dojo
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {/* MODAL */}
      {showConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="text-[#1a1a1a] text-lg">Confirmar creación de Dojo</h3>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Información del Dojo */}
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-[#1a1a1a] mb-4 font-semibold">Información del Dojo</h4>
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex">
                  <span className="text-gray-600 w-32">Nombre:</span>
                  <span className="text-[#1a1a1a]">{dojoData.name}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">Dirección:</span>
                  <span className="text-[#1a1a1a]">{dojoData.address}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">Provincia:</span>
                  <span className="text-[#1a1a1a]">{dojoData.province}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">Localidad:</span>
                  <span className="text-[#1a1a1a]">{dojoData.locality}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">Teléfono:</span>
                  <span className="text-[#1a1a1a]">+54 {dojoData.phone}</span>
                </div>
              </div>
            </div>

            {/* Información del Sensei */}
            <div>
              <h4 className="text-[#1a1a1a] mb-4 font-semibold">Sensei a cargo</h4>
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex">
                  <span className="text-gray-600 w-32">Nombre:</span>
                  <span className="text-[#1a1a1a]">{dojoData.senseiName}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">Rango:</span>
                  <span className="text-[#1a1a1a]">{dojoData.senseiRank}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">Email:</span>
                  <span className="text-[#1a1a1a]">
                    {generateEmail(dojoData.senseiName, dojoData.name)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-8 py-3 bg-gray-400 text-white hover:bg-gray-500 transition-colors rounded-md"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-[#c41e3a] text-white hover:bg-[#a01830] transition-colors rounded-md"
            >
              Confirmar
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
