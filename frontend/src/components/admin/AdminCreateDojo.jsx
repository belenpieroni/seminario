import { supabase } from "../../supabaseClient";
import { useState, useEffect, useRef } from "react";
import { CheckCircle, X } from "lucide-react";
import { fetchProvincias, fetchLocalidadesByProvincia } from "../../utils/fetch";

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

  // Provincias / localidades (traídas desde la API)
  const [provincias, setProvincias] = useState([]); // [{ id, nombre }]
  const [localidades, setLocalidades] = useState([]); // [{ id, nombre }]
  const [selectedProvinciaId, setSelectedProvinciaId] = useState(null);

  // UI helpers
  const [provinceFilter, setProvinceFilter] = useState("");
  const [localityFilter, setLocalityFilter] = useState("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);

  const localityDebounceRef = useRef(null);

  // Cargar provincias al montar
  useEffect(() => {
    let mounted = true;
    setLoadingProvincias(true);
    fetchProvincias()
      .then((list) => {
        if (!mounted) return;
        // Normalizar a { id, nombre }
        const normalized = (list || []).map((p) => ({
          id: p.id,
          nombre: p.nombre,
        }));
        setProvincias(normalized);
      })
      .catch((err) => {
        console.error("Error cargando provincias:", err);
        setProvincias([]);
      })
      .finally(() => mounted && setLoadingProvincias(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Cuando se selecciona provincia (por id), cargar localidades iniciales
  useEffect(() => {
    if (!selectedProvinciaId) {
      setLocalidades([]);
      return;
    }

    let mounted = true;
    setLoadingLocalidades(true);
    // traer hasta 500 localidades por defecto
    fetchLocalidadesByProvincia(selectedProvinciaId, "", 500)
      .then((list) => {
        if (!mounted) return;
        const normalized = (list || []).map((l) => ({
          id: l.id,
          nombre: l.nombre,
        }));
        setLocalidades(normalized);
      })
      .catch((err) => {
        console.error("Error cargando localidades:", err);
        setLocalidades([]);
      })
      .finally(() => mounted && setLoadingLocalidades(false));

    return () => {
      mounted = false;
    };
  }, [selectedProvinciaId]);

  // Debounce para búsqueda de localidades por nombre dentro de la provincia seleccionada
  useEffect(() => {
    if (!selectedProvinciaId) return;
    if (localityDebounceRef.current) clearTimeout(localityDebounceRef.current);

    localityDebounceRef.current = setTimeout(() => {
      setLoadingLocalidades(true);
      fetchLocalidadesByProvincia(selectedProvinciaId, localityFilter || "", 200)
        .then((list) => {
          const normalized = (list || []).map((l) => ({
            id: l.id,
            nombre: l.nombre,
          }));
          setLocalidades(normalized);
        })
        .catch((err) => {
          console.error("Error buscando localidades:", err);
          setLocalidades([]);
        })
        .finally(() => setLoadingLocalidades(false));
    }, 350);

    return () => {
      if (localityDebounceRef.current) clearTimeout(localityDebounceRef.current);
    };
  }, [localityFilter, selectedProvinciaId]);

  // Filtrado local de provincias para el dropdown (por nombre)
  const filteredProvinces = provincias.filter((p) =>
    p.nombre.toLowerCase().includes(provinceFilter.toLowerCase())
  )
  .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

  // Filtrado local de localidades para el dropdown (por nombre)
  const filteredLocalities = localidades.filter((l) =>
    l.nombre.toLowerCase().includes(localityFilter.toLowerCase())
  )
  .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

  const generateEmail = (senseiName, dojoName) => {
    const parts = senseiName.toLowerCase().trim().split(" ");
    const first = parts[0] || "";
    const last = parts[parts.length - 1] || "";
    const dojoSlug = (dojoName || "").toLowerCase().replace(/\s+/g, "");
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
      if (typeof onCreateDojo === "function") onCreateDojo(data);
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
      setSelectedProvinciaId(null);
      setLocalidades([]);
      setProvinceFilter("");
      setLocalityFilter("");
    }, 3500);
  };

return (
  <div className="p-8">
    {/* Header */}
    <div className="flex items-center justify-between mb-8 border-b border-gray-300 pb-4">
      <h2 className="text-2xl font-light uppercase tracking-wide text-[#1a1a1a]">
        Crear <span className="text-[#c41e3a]">nuevo Dojo</span>
      </h2>
    </div>

    {showSuccess && (
      <div className="mb-6 bg-green-50 border border-green-200 rounded shadow-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="text-green-600 w-5 h-5" />
          <h3 className="text-green-800 font-medium uppercase tracking-wide">
            Dojo creado exitosamente
          </h3>
        </div>
        <p className="text-green-700 text-sm">
          Email generado: <strong>{generatedEmail}</strong>
        </p>
      </div>
    )}

    <div className="bg-white shadow-lg border border-gray-200 rounded overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("dojo")}
          className={`flex-1 px-6 py-3 text-sm uppercase tracking-wide ${
            activeTab === "dojo"
              ? "bg-[#c41e3a] text-white font-medium"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          Información del Dojo
        </button>
        <button
          onClick={() => setActiveTab("sensei")}
          className={`flex-1 px-6 py-3 text-sm uppercase tracking-wide ${
            activeTab === "sensei"
              ? "bg-[#c41e3a] text-white font-medium"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          Sensei a cargo
        </button>
      </div>

      <form className="p-6 space-y-6 text-sm">
        {/* DOJO */}
        {activeTab === "dojo" && (
          <>
            {/* Nombre */}
            <div>
              <label className="block mb-2 text-gray-600 uppercase text-xs">
                Nombre del dojo
              </label>
              <input
                className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                value={dojoData.name}
                onChange={e =>
                  setDojoData({ ...dojoData, name: e.target.value })
                }
                placeholder="Ej: Dojo Central"
              />
            </div>

            {/* Dirección */}
            <div>
              <label className="block mb-2 text-gray-600 uppercase text-xs">
                Dirección
              </label>
              <input
                className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                value={dojoData.address}
                onChange={e =>
                  setDojoData({ ...dojoData, address: e.target.value })
                }
                placeholder="Ej: Calle 123"
              />
            </div>

            {/* Provincia */}
            <label className="block mb-2 text-gray-600 uppercase text-xs">Provincia</label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                value={provinceFilter || dojoData.province}
                onChange={e => {
                  setProvinceFilter(e.target.value);
                  setShowProvinceDropdown(true);
                }}
                onFocus={() => setShowProvinceDropdown(true)}
                placeholder="Seleccionar provincia..."
              />

              {showProvinceDropdown && (
                <div className="absolute w-full bg-white border rounded shadow max-h-60 overflow-y-auto z-10">
                  {loadingProvincias ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Cargando provincias...</div>
                  ) : filteredProvinces.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">No se encontraron provincias</div>
                  ) : (
                    filteredProvinces.map((prov) => (
                      <div
                        key={prov.id}
                        onClick={() => {
                          // Guardamos el nombre para mostrar y el id para futuras consultas
                          setDojoData({ ...dojoData, province: prov.nombre, locality: "" });
                          setSelectedProvinciaId(prov.id);
                          setProvinceFilter("");
                          setShowProvinceDropdown(false);
                          setLocalityFilter("");
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {prov.nombre}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Localidad */}
            <label className="block mb-2 text-gray-600 uppercase text-xs">Localidad</label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 border rounded disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                value={localityFilter || dojoData.locality}
                onChange={e => {
                  setLocalityFilter(e.target.value);
                  setShowLocalityDropdown(true);
                }}
                onFocus={() => {
                  if (dojoData.province) setShowLocalityDropdown(true);
                }}
                disabled={!dojoData.province}
                placeholder={dojoData.province ? "Seleccionar localidad..." : "Seleccioná primero una provincia"}
              />

              {showLocalityDropdown && (
                <div className="absolute w-full bg-white border rounded shadow max-h-60 overflow-y-auto z-10">
                  {loadingLocalidades ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Cargando localidades...</div>
                  ) : filteredLocalities.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">No se encontraron localidades</div>
                  ) : (
                    filteredLocalities.map((loc) => (
                      <div
                        key={loc.id}
                        onClick={() => {
                          setDojoData({ ...dojoData, locality: loc.nombre });
                          setLocalityFilter("");
                          setShowLocalityDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {loc.nombre}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>


            {/* Teléfono */}
            <div>
              <label className="block mb-2 text-gray-600 uppercase text-xs">
                Teléfono
              </label>
              <div className="flex border rounded overflow-hidden">
                <span className="px-4 py-3 bg-gray-100 border-r">+54</span>
                <input
                  className="flex-1 px-4 py-3 focus:outline-none"
                  value={dojoData.phone}
                  onChange={e =>
                    setDojoData({ ...dojoData, phone: e.target.value })
                  }
                  placeholder="Ej: 11 2345 6789"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab("sensei")}
                className="px-6 py-3 bg-[#c41e3a] text-white rounded hover:bg-[#a01830] transition-colors text-xs uppercase tracking-wide"
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
              <label className="block mb-2 text-gray-600 uppercase text-xs">
                Nombre y apellido
              </label>
              <input
                className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                value={dojoData.senseiName}
                onChange={e =>
                  setDojoData({ ...dojoData, senseiName: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-600 uppercase text-xs">
                Rango
              </label>
              <select
                className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
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

            <div className="bg-orange-50 border border-orange-200 rounded p-4 text-sm">
              <span className="text-gray-700">Email generado:</span>{" "}
              <strong className="text-[#1a1a1a]">
                {dojoData.senseiName && dojoData.name
                  ? generateEmail(dojoData.senseiName, dojoData.name)
                  : "nombreapellido@nombredojo.com"}
              </strong>
            </div>
            <span className="text-gray-700">Contraseña predeterminada: dojo2025</span>{" "}

                          <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("dojo")}
                  className="px-6 py-3 bg-gray-300 text-xs uppercase tracking-wide rounded hover:bg-gray-400"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="px-6 py-3 bg-[#c41e3a] text-white rounded hover:bg-[#a01830] transition-colors text-xs uppercase tracking-wide"
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
          <div className="bg-white shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-[#1a1a1a] font-light uppercase tracking-wide">
                Confirmar creación de <span className="text-[#c41e3a]">Dojo</span>
              </h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-gray-500 hover:text-[#c41e3a] p-2 rounded"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-[#1a1a1a] mb-4 font-medium uppercase text-sm tracking-wide">
                  Información del Dojo
                </h4>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex">
                    <span className="text-gray-600 w-32">Nombre</span>
                    <span className="text-[#1a1a1a] font-medium">{dojoData.name}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">Dirección</span>
                    <span className="text-[#1a1a1a] font-medium">{dojoData.address}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">Provincia</span>
                    <span className="text-[#1a1a1a] font-medium">{dojoData.province}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">Localidad</span>
                    <span className="text-[#1a1a1a] font-medium">{dojoData.locality}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">Teléfono</span>
                    <span className="text-[#1a1a1a] font-medium">+54 {dojoData.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 w-32">Observaciones</span>
                    <span className="text-gray-700">{dojoData.observations || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Información del Sensei */}
              <div>
                <h4 className="text-[#1a1a1a] mb-4 font-medium uppercase text-sm tracking-wide">
                  Sensei a cargo
                </h4>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex">
                    <span className="text-gray-600 w-32">Nombre</span>
                    <span className="text-[#1a1a1a] font-medium">{dojoData.senseiName}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">Rango</span>
                    <span className="text-[#1a1a1a] font-medium">{dojoData.senseiRank}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">Email</span>
                    <span className="text-[#1a1a1a] font-medium">
                      {generateEmail(dojoData.senseiName, dojoData.name)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 w-32">Cuenta</span>
                    <span className="text-gray-700 text-sm">
                      {dojoData.senseiAccount || "No creada"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 px-6 py-4 border-t border-gray-200 bg-white">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-3 bg-gray-300 text-white rounded-md hover:bg-gray-400 transition-colors text-sm uppercase tracking-wide"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-[#c41e3a] text-white rounded-md hover:bg-[#a01830] transition-colors text-sm uppercase tracking-wide"
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
