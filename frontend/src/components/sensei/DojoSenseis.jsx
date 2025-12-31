import { useState, useEffect, useMemo } from "react";
import { Plus, X, Trash, Eye } from "lucide-react";
import { SenseiManageModal } from "./SenseiManageModal"; 
import { supabase } from "../../supabaseClient"; 

export default function DojoSenseis() {
  const [senseis, setSenseis] = useState([]);
  const [selectedSensei, setSelectedSensei] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dojo, setDojo] = useState(null); 
  const [showFilters, setShowFilters] = useState(false);
  const [newSensei, setNewSensei] = useState({ full_name: "", dan_grade: "" });
  const [filters, setFilters] = useState({
    name: "",
    dan: "",
    danCondition: "exact",
  });

  // Obtener dojo y senseis del usuario logueado
  useEffect(() => {
    async function fetchSenseis() {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      // obtener dojo_id del sensei logueado
      const { data: sensei } = await supabase
        .from("sensei")
        .select("dojo_id")
        .eq("user_id", user.id)
        .single();

      if (!sensei?.dojo_id) {
        setLoading(false);
        return;
      }

      // traer datos del dojo (nombre)
      const { data: dojoData } = await supabase
        .from("dojo")
        .select("id, name")
        .eq("id", sensei.dojo_id)
        .single();

      setDojo(dojoData);

      // traer senseis del dojo (no a cargo)
      const { data: senseisData } = await supabase
        .from("sensei")
        .select("id, full_name, dan_grade, registered_at, is_head")
        .eq("dojo_id", sensei.dojo_id)
        .eq("is_active", true)
        .eq("is_head", false);

      setSenseis(senseisData || []);
      setLoading(false);
    }

    fetchSenseis();
  }, []);

  const nonHeadSenseis = (senseis || []).filter(s => !s.is_head);

  const filteredSenseis = useMemo(() => {
    return nonHeadSenseis.filter(sensei => {
      // Filtro por nombre
      if (filters.name) {
        const fullName = sensei.full_name.toLowerCase();
        if (!fullName.includes(filters.name.toLowerCase())) return false;
      }

      // Filtro por grado (Dan)
      if (filters.dan) {
        const senseiDan = parseInt(sensei.dan_grade); 
        const filterDan = Number(filters.dan);

        if (filters.danCondition === "exact" && senseiDan !== filterDan) return false;
        if (filters.danCondition === "menor" && senseiDan >= filterDan) return false;
        if (filters.danCondition === "mayor" && senseiDan <= filterDan) return false;
      }

      return true;
    });
  }, [nonHeadSenseis, filters]);


  const generatedEmail = (name, dojoName) => {
    const parts = name.toLowerCase().trim().split(" ");
    const first = parts[0] || "";
    const last = parts[parts.length - 1] || "";
    const dojoSlug = dojoName.toLowerCase().replace(/\s+/g, "");
    return `${first}${last}@${dojoSlug}.com`;
  };

  const handleConfirmAdd = async () => {
    try {
      const email = generatedEmail(newSensei.full_name, dojo.name);

      const { data, error } = await supabase.functions.invoke("create-sensei", {
        body: {
          dojoId: dojo.id,
          sensei: {
            full_name: newSensei.full_name,
            dan_grade: newSensei.dan_grade,
          },
          email,
        },
      });

      if (error) {
        console.error("Error creando sensei:", error);
        alert("Error al crear sensei");
        return;
      }

      console.log("Sensei creado:", data);
      setSenseis(prev => [...prev, data.sensei]);
      setShowConfirm(false);
      setShowAddForm(false);
      setNewSensei({ full_name: "", dan_grade: "" });
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Error inesperado al crear sensei");
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Cargando senseis...</div>;
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-8">Senseis del dojo</h2>

      {/* Formulario agregar sensei */}
      {showAddForm && (
        <div className="bg-white shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-light uppercase tracking-wide text-[#1a1a1a] mb-6">
            Nuevo <span className="text-[#c41e3a]">Sensei</span>
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm uppercase tracking-wide text-gray-600">
                Nombre y apellido
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
                value={newSensei.full_name}
                onChange={e =>
                  setNewSensei({ ...newSensei, full_name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block mb-2 text-sm uppercase tracking-wide text-gray-600">
                Grado (Dan)
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
                value={newSensei.dan_grade}
                onChange={e =>
                  setNewSensei({ ...newSensei, dan_grade: e.target.value })
                }
              >
                <option value="">Seleccionar grado</option>
                <option value="1er Dan">1er Dan</option>
                <option value="2do Dan">2do Dan</option>
                <option value="3er Dan">3er Dan</option>
                <option value="4to Dan">4to Dan</option>
                <option value="5to Dan">5to Dan</option>
                <option value="6to Dan">6to Dan</option>
                <option value="7mo Dan">7mo Dan</option>
                <option value="8vo Dan">8vo Dan</option>
                <option value="9no Dan">9no Dan</option>
              </select>
            </div>

            {/* Aviso con email y contraseña inicial */}
            <div className="bg-orange-50 border p-4 text-sm text-orange-900">
              <p>
                Email:{" "}
                <strong>
                  {newSensei.full_name && dojo?.name
                    ? generatedEmail(newSensei.full_name, dojo.name)
                    : "nombreapellido@nombredojo.com"}
                </strong>
              </p>
              <p>
                Contraseña inicial: <strong>dojo2025</strong>
              </p>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-300 text-[#1a1a1a] uppercase text-xs tracking-wide hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="px-6 py-2 bg-[#c41e3a] text-white uppercase text-xs tracking-wide hover:bg-[#a01830] transition-colors"
              >
                Crear sensei
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex items-center justify-between mb-8">
        {!showAddForm && (
          <div className="mt-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-[#c41e3a] text-white px-4 py-2 uppercase text-xs tracking-wide hover:bg-[#a01830] transition-colors"
            >
              <Plus className="w-4 h-4" /> Agregar sensei
            </button>
          </div>
        )}
        <div className="mt-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-[#c41e3a] text-white uppercase text-xs tracking-wide hover:bg-[#a01830] transition-colors"
          >
            Filtros
          </button>
        </div>
      </div>

      {/* Aside de filtros */}
      {showFilters && (
        <aside className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 p-6 overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
            <h2 className="text-lg font-light uppercase tracking-wide text-[#1a1a1a]">
              Filtros
            </h2>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-[#c41e3a] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filtrar por nombre */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium uppercase tracking-wide text-sm">Nombre</h3>
              <button
                onClick={() => setFilters({ ...filters, name: "" })}
                className="text-gray-500 hover:text-[#c41e3a]"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
              placeholder="Ingresar nombre"
              value={filters.name}
              onChange={e => setFilters({ ...filters, name: e.target.value })}
            />
          </div>

          {/* Filtrar por grado (Dan) */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium uppercase tracking-wide text-sm">Grado (Dan)</h3>
              <button
                onClick={() => setFilters({ ...filters, dan: "", danCondition: "exact" })}
                className="text-gray-500 hover:text-[#c41e3a]"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
                value={filters.danCondition}
                onChange={e => setFilters({ ...filters, danCondition: e.target.value })}
              >
                <option value="exact">Exactamente</option>
                <option value="menor">Menor que</option>
                <option value="mayor">Mayor que</option>
              </select>
              <select
                className="w-full px-3 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
                value={filters.dan}
                onChange={e => setFilters({ ...filters, dan: e.target.value })}
              >
                <option value="">Seleccionar grado</option>
                {[...Array(9)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{`${i + 1}º Dan`}</option>
                ))}
              </select>
            </div>
          </div>
        </aside>
      )}

      {/* Tabla de senseis */}
      <div className="bg-white shadow-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#1a1a1a] text-white uppercase tracking-wide text-sm">
            <tr>
              <th className="px-6 py-4 text-left">Nombre y Apellido</th>
              <th className="px-6 py-4 text-left">Grado (Dan)</th>
              <th className="px-6 py-4 text-left">Registrado</th>
              <th className="px-6 py-4 text-left">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {filteredSenseis.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-gray-500 text-center italic">
                  No hay senseis registrados
                </td>
              </tr>
            ) : (
              filteredSenseis.map((sensei) => (
                <tr key={sensei.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">{sensei.full_name}</td>
                  <td className="px-6 py-4">{sensei.dan_grade}</td>
                  <td className="px-6 py-4">
                    {sensei.registered_at
                      ? new Date(sensei.registered_at).toLocaleDateString("es-AR")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedSensei(sensei)}
                      className="flex items-center gap-2 px-4 py-2 border border-[#c41e3a] text-[#c41e3a] uppercase text-xs tracking-wide hover:bg-[#c41e3a] hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalle */}
      {selectedSensei && (
        <SenseiManageModal
          senseiId={selectedSensei.id}
          dojoId={dojo.id}
          onClose={() => setSelectedSensei(null)}
          onSave={() => {}}
        />
      )}

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-light uppercase tracking-wide text-[#1a1a1a]">
                Confirmar <span className="text-[#c41e3a]">creación</span> de sensei
              </h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-gray-500 hover:text-[#c41e3a] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Información del sensei */}
            <div className="p-6 space-y-6">
              <h4 className="text-sm font-light uppercase tracking-wide text-[#1a1a1a] mb-4">
                Información del sensei
              </h4>
              <div className="space-y-2 bg-gray-50 border border-gray-200 p-4 text-sm">
                <div className="flex">
                  <span className="text-gray-600 w-40">Nombre:</span>
                  <span className="text-[#1a1a1a] font-medium">{newSensei.full_name}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-40">Grado (Dan):</span>
                  <span className="text-[#1a1a1a] font-medium">{newSensei.dan_grade}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-40">Email:</span>
                  <span className="text-[#1a1a1a] font-medium">
                    {newSensei.full_name && dojo?.name
                      ? generatedEmail(newSensei.full_name, dojo.name)
                      : "nombreapellido@nombredojo.com"}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-40">Contraseña inicial:</span>
                  <span className="text-[#1a1a1a] font-medium">dojo2025</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2 bg-gray-300 text-[#1a1a1a] uppercase text-xs tracking-wide hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAdd} // tu función para crear sensei en Supabase
                className="px-6 py-2 bg-[#c41e3a] text-white uppercase text-xs tracking-wide hover:bg-[#a01830] transition-colors"
              >
                Confirmar creación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
