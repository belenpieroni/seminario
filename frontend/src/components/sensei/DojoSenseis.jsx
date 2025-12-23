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
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Nuevo sensei</h3>

          <div className="space-y-6">
            <div>
              <label className="block mb-2">Nombre y apellido</label>
              <input
                className="w-full px-4 py-3 border"
                value={newSensei.full_name}
                onChange={e =>
                  setNewSensei({ ...newSensei, full_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block mb-2">Grado (Dan)</label>
              <select
                className="w-full px-4 py-3 border rounded-lg"
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
            <div className="bg-orange-50 border p-4">
              Email:{" "}
              <strong>
                {newSensei.full_name && dojo?.name
                  ? generatedEmail(newSensei.full_name, dojo.name)
                  : "nombreapellido@nombredojo.com"}
              </strong>
              <br />
              Contraseña inicial: <strong>dojo2025</strong>
            </div>

            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-gray-300 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="px-6 py-3 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a01830]"
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
              className="flex items-center gap-2 bg-[#c41e3a] text-white px-4 py-2 rounded hover:bg-[#a01830]"
            >
              <Plus className="w-4 h-4" /> Agregar sensei
            </button>
          </div>
        )}
        <div className="mt-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a01830]"
          >
            Filtros
          </button>
        </div>
      </div>

      {/* Aside de filtros */}
      {showFilters && (
        <aside className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-6 overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Filtros</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Filtrar por nombre</h3>
              <button
                onClick={() => setFilters({ ...filters, name: "" })}
                className="text-gray-500 hover:text-red-600"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Ingresar nombre"
              value={filters.name}
              onChange={e => setFilters({ ...filters, name: e.target.value })}
            />
          </div>

          {/* Filtrar por grado (Dan) */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Filtrar por grado (Dan)</h3>
              <button
                onClick={() => setFilters({ ...filters, dan: "", danCondition: "exact" })}
                className="text-gray-500 hover:text-red-600"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border rounded-lg"
                value={filters.danCondition}
                onChange={e => setFilters({ ...filters, danCondition: e.target.value })}
              >
                <option value="exact">Exactamente</option>
                <option value="menor">Menor que</option>
                <option value="mayor">Mayor que</option>
              </select>
              <select
                className="w-full px-3 py-2 border rounded-lg"
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
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#1a1a1a] text-white">
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
                <td colSpan={4} className="px-6 py-4 text-gray-500 text-center">
                  No hay senseis registrados
                </td>
              </tr>
            ) : (
              filteredSenseis.map(sensei => (
                <tr key={sensei.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{sensei.full_name}</td>
                  <td className="px-6 py-4">{sensei.dan_grade}</td>
                  <td className="px-6 py-4">
                    {sensei.registered_at
                      ? new Date(sensei.registered_at).toLocaleDateString("es-AR")
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedSensei(sensei)}
                      className="text-[#c41e3a] border border-[#c41e3a] px-4 py-2 rounded hover:bg-[#c41e3a] hover:text-white flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-[#1a1a1a] text-lg">Confirmar creación de sensei</h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Información del sensei */}
            <div className="p-6 space-y-6">
              <h4 className="text-[#1a1a1a] mb-4 font-semibold">Información del sensei</h4>
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex">
                  <span className="text-gray-600 w-40">Nombre:</span>
                  <span className="text-[#1a1a1a]">{newSensei.full_name}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-40">Grado (Dan):</span>
                  <span className="text-[#1a1a1a]">{newSensei.dan_grade}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-40">Email:</span>
                  <span className="text-[#1a1a1a]">
                    {newSensei.full_name && dojo?.name
                      ? generatedEmail(newSensei.full_name, dojo.name)
                      : "nombreapellido@nombredojo.com"}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-40">Contraseña inicial:</span>
                  <span className="text-[#1a1a1a]">dojo2025</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-3 bg-gray-300 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAdd} // tu función para crear sensei en Supabase
                className="px-6 py-3 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a01830]"
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
