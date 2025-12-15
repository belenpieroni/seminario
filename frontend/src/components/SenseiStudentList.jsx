import { useState } from "react"
import { Plus, Eye } from "lucide-react"

export function SenseiStudentList({ students, onViewDetail, onAddStudent }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: "",
    dni: "",
    currentBelt: "",
    lastExam: ""
  })

  const handleSubmit = e => {
    e.preventDefault()

    // Generar email del alumno
    const nameParts = newStudent.name.toLowerCase().split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts[nameParts.length - 1] || ""
    const email = `${firstName}${lastName}@dojo.com`

    console.log(`Email generado para alumno: ${email}`)

    onAddStudent(newStudent)
    setNewStudent({ name: "", dni: "", currentBelt: "", lastExam: "" })
    setShowAddForm(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[#1a1a1a]">Alumnos del dojo</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-[#c41e3a] text-white px-6 py-3 rounded-lg hover:bg-[#a01830] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Agregar alumno
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-[#1a1a1a] mb-4">Nuevo alumno</h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-[#1a1a1a] mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                value={newStudent.name}
                onChange={e =>
                  setNewStudent({ ...newStudent, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                required
              />
            </div>
            <div>
              <label className="block text-[#1a1a1a] mb-2">DNI</label>
              <input
                type="text"
                value={newStudent.dni}
                onChange={e =>
                  setNewStudent({ ...newStudent, dni: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                required
              />
            </div>
            <div>
              <label className="block text-[#1a1a1a] mb-2">
                Graduación actual
              </label>
              <select
                value={newStudent.currentBelt}
                onChange={e =>
                  setNewStudent({ ...newStudent, currentBelt: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Cinturón Blanco">Cinturón Blanco</option>
                <option value="Cinturón Amarillo">Cinturón Amarillo</option>
                <option value="Cinturón Naranja">Cinturón Naranja</option>
                <option value="Cinturón Verde">Cinturón Verde</option>
                <option value="Cinturón Azul">Cinturón Azul</option>
                <option value="Cinturón Marrón">Cinturón Marrón</option>
                <option value="Cinturón Negro">Cinturón Negro</option>
              </select>
            </div>
            <div>
              <label className="block text-[#1a1a1a] mb-2">Último examen</label>
              <input
                type="date"
                value={newStudent.lastExam}
                onChange={e =>
                  setNewStudent({ ...newStudent, lastExam: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-[#c41e3a] text-white px-6 py-2 rounded-lg hover:bg-[#a01830] transition-colors"
              >
                Guardar alumno
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-[#1a1a1a] px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#1a1a1a] text-white">
            <tr>
              <th className="px-6 py-4 text-left">Nombre</th>
              <th className="px-6 py-4 text-left">DNI</th>
              <th className="px-6 py-4 text-left">Graduación actual</th>
              <th className="px-6 py-4 text-left">Último examen</th>
              <th className="px-6 py-4 text-left">Acción</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr
                key={student.id}
                className="border-b border-gray-200 hover:bg-[#f8f8f8]"
              >
                <td className="px-6 py-4 text-[#1a1a1a]">{student.name}</td>
                <td className="px-6 py-4 text-gray-600">{student.dni}</td>
                <td className="px-6 py-4 text-gray-600">
                  {student.currentBelt}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {student.lastExam
                    ? new Date(student.lastExam).toLocaleDateString("es-AR")
                    : "N/A"}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onViewDetail(student.id)}
                    className="flex items-center gap-2 text-[#c41e3a] hover:text-[#a01830] transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
