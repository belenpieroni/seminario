import { useState, useEffect } from "react"
import { Eye, Plus, X } from "lucide-react"
import { supabase } from "../supabaseClient"

export function SenseiStudentList() {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [dojo, setDojo] = useState(null)   
  const [newStudent, setNewStudent] = useState({
    full_name: "",
    birth_date: "",
    current_belt: ""
  })

  const generatedEmail = (studentName, dojoName) => {
    const parts = studentName.toLowerCase().trim().split(" ")
    const first = parts[0] || ""
    const last = parts[parts.length - 1] || ""
    const dojoSlug = dojoName.toLowerCase().replace(/\s+/g, "")
    return `${first}${last}@${dojoSlug}.com`
  }

  const belts = [
    "Blanco",
    "Amarillo",
    "Naranja",
    "Verde",
    "Azul",
    "Marrón",
    "Negro"
  ]

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) {
        setLoading(false)
        return
      }

      // obtener dojo_id del sensei
      const { data: sensei } = await supabase
        .from("sensei")
        .select("dojo_id")
        .eq("user_id", user.id)
        .single()

      if (!sensei?.dojo_id) {
        setLoading(false)
        return
      }

      // traer datos del dojo (nombre)
      const { data: dojoData } = await supabase
        .from("dojo")
        .select("id, name")
        .eq("id", sensei.dojo_id)
        .single()

      setDojo(dojoData)

      // traer alumnos del dojo
      const { data: studentsData } = await supabase
        .from("student")
        .select("id, full_name, birth_date, current_belt, registered_at")
        .eq("dojo_id", sensei.dojo_id)

      setStudents(studentsData || [])
      setLoading(false)
    }

    fetchStudents()
  }, [])

  async function handleConfirmAdd() {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    const { data: sensei } = await supabase
      .from("sensei")
      .select("dojo_id")
      .eq("user_id", user.id)
      .single()

    if (!sensei?.dojo_id || !dojo?.name) return

    const { data, error } = await supabase.functions.invoke("create-student-dojo", {
      body: {
        dojo: { id: sensei.dojo_id, name: dojo.name },
        student: {
          full_name: newStudent.full_name,
          birth_date: newStudent.birth_date,
          current_belt: newStudent.current_belt,
        },
      },
    })

    if (error) {
      alert("Error agregando alumno: " + error.message)
      return
    }

    // data debería contener { email, password, student }
    setStudents(prev => [...prev, data.student])
    setShowAddForm(false)
    setShowConfirm(false)
    setNewStudent({ full_name: "", birth_date: "", current_belt: "" })
  }


  if (loading) {
    return <div className="p-8 text-gray-500">Cargando alumnos...</div>
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-8">Alumnos del dojo</h2>

      {/* Formulario agregar alumno */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Nuevo alumno</h3>

          <div className="space-y-6">
            <div>
              <label className="block mb-2">Nombre y apellido</label>
              <input
                className="w-full px-4 py-3 border"
                value={newStudent.full_name}
                onChange={e =>
                  setNewStudent({ ...newStudent, full_name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block mb-2">Fecha de nacimiento</label>
              <input
                type="date"
                className="w-full px-4 py-3 border"
                value={newStudent.birth_date}
                onChange={e =>
                  setNewStudent({ ...newStudent, birth_date: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block mb-2">Cinturón</label>
              <select
                className="w-full px-4 py-3 border"
                value={newStudent.current_belt}
                onChange={e =>
                  setNewStudent({ ...newStudent, current_belt: e.target.value })
                }
              >
                <option value="">Seleccionar cinturón</option>
                {belts.map(belt => (
                  <option key={belt} value={belt}>
                    {belt}
                  </option>
                ))}
              </select>
            </div>

            {/* Aviso con email y contraseña inicial */}
            <div className="bg-orange-50 border p-4">
              Email:{" "}
              <strong>
                {newStudent.full_name && dojo?.name
                  ? generatedEmail(newStudent.full_name, dojo.name)
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
                Crear alumno
              </button>
            </div>
            </div>
            </div>
            )}

            {/* Botón agregar alumno */}
            <div className="flex items-center justify-between mb-8">
              {!showAddForm && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-[#c41e3a] text-white px-4 py-2 rounded hover:bg-[#a01830]"
                  >
                    <Plus className="w-4 h-4" /> Agregar alumno
                  </button>
                </div>
              )}
            </div>

            {/* Tabla de alumnos */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#1a1a1a] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Nombre</th>
                    <th className="px-6 py-4 text-left">Edad</th>
                    <th className="px-6 py-4 text-left">Cinturón</th>
                    <th className="px-6 py-4 text-left">Registrado</th>
                    <th className="px-6 py-4 text-left">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-gray-500 text-center">
                        No hay alumnos registrados
                      </td>
                    </tr>
                  ) : (
                    students.map(student => (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{student.full_name}</td>
                        <td className="px-6 py-4">
                          {student.birth_date
                            ? Math.floor(
                                (Date.now() - new Date(student.birth_date).getTime()) /
                                  (1000 * 60 * 60 * 24 * 365.25)
                              )
                            : "-"}
                        </td>
                        <td className="px-6 py-4">{student.current_belt}</td>
                        <td className="px-6 py-4">
                          {new Date(student.registered_at).toLocaleDateString("es-AR")}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="text-[#c41e3a] border border-[#c41e3a] px-4 py-2 rounded hover:bg-[#c41e3a] hover:text-white flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> Ver
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal de confirmación */}
            {showConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
                  {/* Header */}
                  <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-[#1a1a1a] text-lg">Confirmar creación de alumno</h3>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Información del alumno */}
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="text-[#1a1a1a] mb-4 font-semibold">Información del alumno</h4>
                      <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                        <div className="flex">
                          <span className="text-gray-600 w-40">Nombre:</span>
                          <span className="text-[#1a1a1a]">{newStudent.full_name}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-600 w-40">Fecha de nacimiento:</span>
                          <span className="text-[#1a1a1a]">{newStudent.birth_date}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-600 w-40">Cinturón:</span>
                          <span className="text-[#1a1a1a]">{newStudent.current_belt}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-600 w-40">Email:</span>
                          <span className="text-[#1a1a1a]">
                            {newStudent.full_name && dojo?.name
                              ? generatedEmail(newStudent.full_name, dojo.name)
                              : "nombreapellido@nombredojo.com"}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-600 w-40">Contraseña inicial:</span>
                          <span className="text-[#1a1a1a]">dojo2025</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="px-6 py-3 bg-gray-300 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmAdd}
                      className="px-6 py-3 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a01830]"
                    >
                      Confirmar creación
                    </button>
                  </div>
                </div>
              </div>
            )}
    </div>
  )
}
