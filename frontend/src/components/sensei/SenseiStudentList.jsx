import { useState, useEffect, useMemo } from "react"
import { Plus, Eye, Trash, X } from "lucide-react"
import { supabase } from "../../supabaseClient"
import { StudentManageModal } from "./StudentManageModal"

export function SenseiStudentList() {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [dojo, setDojo] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [newStudent, setNewStudent] = useState({
    full_name: "",
    birth_date: "",
    current_belt: ""
  })

  const belts = [
    "Blanco",
    "Amarillo",
    "Naranja",
    "Verde",
    "Azul",
    "Marrón",
    "Negro",
    "1er Dan",
    "2do Dan",
    "3er Dan",
    "4to Dan",
    "5to Dan",
    "6to Dan",
    "7mo Dan",
    "8vo Dan",
    "9no Dan"
  ]

  const [filters, setFilters] = useState({
    name: "",
    age: "",
    ageCondition: "exact",
    belt: "",
    beltCondition: "exact",
    examDate: "",
    examStart: "",
    examEnd: ""
  })

  const filteredStudents = useMemo(
    () => applyFilters(students, filters),
    [students, filters]
  )

  const generatedEmail = (studentName, dojoName) => {
    const parts = (studentName || "").toLowerCase().trim().split(" ")
    const first = parts[0] || ""
    const last = parts[parts.length - 1] || ""
    const dojoSlug = (dojoName || "").toLowerCase().replace(/\s+/g, "")
    return `${first}${last}@${dojoSlug}.com`
  }

  function applyFilters(studentsList, filtersObj) {
    return (studentsList || []).filter((student) => {
      // Nombre / Apellido
      if (filtersObj.name) {
        const fullName = (student.full_name || "").toLowerCase()
        if (!fullName.includes(filtersObj.name.toLowerCase())) return false
      }

      // Edad
      if (filtersObj.age) {
        const age = student.birth_date
          ? Math.floor(
              (Date.now() - new Date(student.birth_date).getTime()) /
                (1000 * 60 * 60 * 24 * 365.25)
            )
          : null

        if (age !== null) {
          if (filtersObj.ageCondition === "exact" && age !== Number(filtersObj.age)) return false
          if (filtersObj.ageCondition === "menor" && age >= Number(filtersObj.age)) return false
          if (filtersObj.ageCondition === "mayor" && age <= Number(filtersObj.age)) return false
        }
      }

      // Cinturón
      if (filtersObj.belt) {
        const beltIndex = belts.indexOf(student.current_belt)
        const filterIndex = belts.indexOf(filtersObj.belt)

        if (filtersObj.beltCondition === "exact" && beltIndex !== filterIndex) return false
        if (filtersObj.beltCondition === "menor" && beltIndex >= filterIndex) return false
        if (filtersObj.beltCondition === "mayor" && beltIndex <= filterIndex) return false
      }

      return true
    })
  }

  function handleUpdatedStudent(updatedStudent) {
    setStudents((prevStudents) =>
      prevStudents.map((student) => (student.id === updatedStudent.id ? { ...student, ...updatedStudent } : student))
    )
  }

  useEffect(() => {
    let mounted = true

    async function fetchStudents() {
      setLoading(true)
      try {
        const { data: userData } = await supabase.auth.getUser()
        const user = userData?.user
        if (!user) {
          if (mounted) setLoading(false)
          return
        }

        // obtener dojo_id del sensei
        const { data: sensei } = await supabase
          .from("sensei")
          .select("dojo_id")
          .eq("user_id", user.id)
          .single()

        if (!sensei?.dojo_id) {
          if (mounted) setLoading(false)
          return
        }

        // traer datos del dojo (nombre)
        const { data: dojoData } = await supabase
          .from("dojo")
          .select("id, name")
          .eq("id", sensei.dojo_id)
          .single()

        if (mounted) setDojo(dojoData || null)

        // traer alumnos del dojo
        const { data: studentsData, error: studentsErr } = await supabase
          .from("student")
          .select("id, full_name, birth_date, current_belt, registered_at")
          .eq("dojo_id", sensei.dojo_id)
          .eq("is_active", true)

        if (studentsErr) {
          console.error("Error fetching students:", studentsErr)
          if (mounted) {
            setStudents([])
            setLoading(false)
          }
          return
        }

        const studentsList = studentsData || []

        // si no hay alumnos, terminamos
        if (studentsList.length === 0) {
          if (mounted) {
            setStudents([])
            setLoading(false)
          }
          return
        }

        // 1) obtener todos los student_ids
        const studentIds = studentsList.map((s) => s.id)

        // 2) traer todas las inscripciones de esos alumnos (exam_enrollment)
        const { data: enrollmentsData } = await supabase
        .from("exam_enrollment")
        .select(`
          student_id,
          exam_id,
          exam:exam_id ( exam_date ),
          exam_result ( present )
        `)
        .in("student_id", studentIds)

        if (!enrollmentsData || enrollmentsData.length === 0) {
          if (mounted) {
            setStudents(studentsList.map((s) => ({ ...s, last_exam_date: null })))
            setLoading(false)
          }
          return
        }

        // 3) obtener los exam_ids únicos y traer sus fechas
        const examIds = Array.from(new Set(enrollmentsData.map((e) => e.exam_id)))

        const { data: examsData, error: examsErr } = await supabase
          .from("exam")
          .select("id, exam_date")
          .in("id", examIds)

        if (examsErr) {
          console.error("Error fetching exams:", examsErr)
          if (mounted) {
            setStudents(studentsList.map((s) => ({ ...s, last_exam_date: null })))
            setLoading(false)
          }
          return
        }

        // 4) construir un map examId -> exam_date
        const examDateById = {}
        ;(examsData || []).forEach((ex) => {
          examDateById[ex.id] = ex.exam_date ? new Date(ex.exam_date).toISOString() : null
        })

        // 5) para cada student, buscar sus inscripciones y calcular la última fecha rendida
        const lastExamByStudent = {}
        ;(enrollmentsData || []).forEach((en) => {
          const examDate = en.exam?.exam_date ? new Date(en.exam.exam_date) : null
          const result = Array.isArray(en.exam_result) ? en.exam_result[0] : en.exam_result
          const present = result?.present

          if (examDate && present === true && examDate <= new Date()) {
            const current = lastExamByStudent[en.student_id]
            if (!current || examDate > new Date(current)) {
              lastExamByStudent[en.student_id] = examDate.toISOString()
            }
          }
        })


        // 6) mergear en students
        const studentsWithLastExam = studentsList.map((s) => ({
          ...s,
          last_exam_date: lastExamByStudent[s.id] || null
        }))

        if (mounted) {
          setStudents(studentsWithLastExam)
          setLoading(false)
        }
      } catch (err) {
        console.error("fetchStudents exception:", err)
        if (mounted) {
          setStudents([])
          setLoading(false)
        }
      }
    }

    fetchStudents()
    return () => {
      mounted = false
    }
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
          current_belt: newStudent.current_belt
        }
      }
    })

    if (error) {
      alert("Error agregando alumno: " + error.message)
      return
    }

    setStudents((prev) => [...prev, data.student])
    setShowAddForm(false)
    setShowConfirm(false)
    setNewStudent({ full_name: "", birth_date: "", current_belt: "" })
  }

  if (loading) {
    return <div className="p-8 text-gray-500">Cargando alumnos...</div>
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-300 pb-4">
        <h2 className="text-2xl font-light uppercase tracking-wide text-[#1a1a1a]">
          Alumnos <span className="text-[#c41e3a]">del Dojo</span>
        </h2>
      </div>

      {/* Formulario agregar alumno */}
      {showAddForm && (
        <div className="bg-white shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-light uppercase tracking-wide text-[#1a1a1a] mb-6">
            Nuevo <span className="text-[#c41e3a]">Alumno</span>
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm uppercase tracking-wide text-gray-600">
                Nombre y apellido
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
                value={newStudent.full_name}
                onChange={e => setNewStudent({ ...newStudent, full_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm uppercase tracking-wide text-gray-600">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
                value={newStudent.birth_date}
                onChange={e => setNewStudent({ ...newStudent, birth_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm uppercase tracking-wide text-gray-600">
                Cinturón
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
                value={newStudent.current_belt}
                onChange={e => setNewStudent({ ...newStudent, current_belt: e.target.value })}
              >
                <option value="">Seleccionar cinturón</option>
                {belts.map(belt => (
                  <option key={belt} value={belt}>{belt}</option>
                ))}
              </select>
            </div>

            {/* Aviso con email y contraseña inicial */}
            <div className="bg-orange-50 border p-4 text-sm text-orange-900">
              <p>
                Email:{" "}
                <strong>
                  {newStudent.full_name && dojo?.name
                    ? generatedEmail(newStudent.full_name, dojo.name)
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
                Crear alumno
              </button>
            </div>
          </div>
        </div>
      )}

            {/* Botones agregar/filtros */}
            <div className="flex items-center justify-between mb-8">
              {!showAddForm && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-[#c41e3a] text-white px-4 py-2 uppercase text-xs tracking-wide hover:bg-[#a01830] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Agregar alumno
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
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                  <h2 className="text-lg font-light uppercase tracking-wide text-[#1a1a1a]">Filtros</h2>
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
                    <h3 className="font-medium uppercase tracking-wide text-sm">Nombre y apellido</h3>
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
                    placeholder="Ingresar nombre o apellido"
                    value={filters.name}
                    onChange={e => setFilters({ ...filters, name: e.target.value })}
                  />
                </div>

                {/* Filtrar por edad */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium uppercase tracking-wide text-sm">Edad</h3>
                    <button
                      onClick={() => setFilters({ ...filters, age: "", ageCondition: "exact" })}
                      className="text-gray-500 hover:text-[#c41e3a]"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="px-3 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
                      value={filters.ageCondition}
                      onChange={e => setFilters({ ...filters, ageCondition: e.target.value })}
                    >
                      <option value="exact">Exactamente</option>
                      <option value="menor">Menor que</option>
                      <option value="mayor">Mayor que</option>
                    </select>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
                      placeholder="Edad"
                      value={filters.age}
                      onChange={e => setFilters({ ...filters, age: e.target.value })}
                    />
                  </div>
                </div>

                {/* Filtrar por cinturón */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium uppercase tracking-wide text-sm">Cinturón</h3>
                    <button
                      onClick={() => setFilters({ ...filters, belt: "", beltCondition: "exact" })}
                      className="text-gray-500 hover:text-[#c41e3a]"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {/* Condición */}
                    <select
                      className="px-3 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
                      value={filters.beltCondition}
                      onChange={e => setFilters({ ...filters, beltCondition: e.target.value })}
                    >
                      <option value="exact">Exactamente</option>
                      <option value="menor">Menor que</option>
                      <option value="mayor">Mayor que</option>
                    </select>

                    {/* Cinturón */}
                    <select
                      className="w-full px-3 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
                      value={filters.belt}
                      onChange={e => setFilters({ ...filters, belt: e.target.value })}
                    >
                      <option value="">Seleccionar cinturón</option>
                      {belts.map(belt => (
                        <option key={belt} value={belt}>{belt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </aside>
            )}
            {/* Tabla de alumnos */}
            <div className="bg-white shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead className="bg-[#1a1a1a] text-white uppercase tracking-wide text-sm">
                    <tr>
                      <th className="px-6 py-4 text-left">Nombre y Apellido</th>
                      <th className="px-6 py-4 text-left">Edad</th>
                      <th className="px-6 py-4 text-left">Cinturón</th>
                      <th className="px-6 py-4 text-left">Último examen</th>
                      <th className="px-6 py-4 text-left">Detalle</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-gray-500 text-center italic">
                          No hay alumnos registrados
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => {
                        const safeFormatDate = (iso) => {
                          if (!iso) return null
                          const d = new Date(iso)
                          if (Number.isNaN(d.getTime())) return null
                          return d.toLocaleDateString("es-AR")
                        }

                        const age = student.birth_date
                          ? Math.floor(
                              (Date.now() - new Date(student.birth_date).getTime()) /
                                (1000 * 60 * 60 * 24 * 365.25)
                            )
                          : null

                        return (
                          <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="truncate font-medium">{student.full_name || "-"}</div>
                            </td>

                            <td className="px-6 py-4">{age !== null ? age : "-"}</td>

                            <td className="px-6 py-4">{student.current_belt || "-"}</td>

                            <td className="px-6 py-4">
                              {student.last_exam_date ? (
                                <time dateTime={student.last_exam_date}>
                                  {safeFormatDate(student.last_exam_date)}
                                </time>
                              ) : (
                                "-"
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedStudent(student)}
                                aria-label={`Ver detalle de ${student.full_name}`}
                                className="flex items-center gap-2 px-4 py-2 border border-[#c41e3a] text-[#c41e3a] uppercase text-xs tracking-wide hover:bg-[#c41e3a] hover:text-white transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Ver
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal de detalle */}
            {selectedStudent && (
              <StudentManageModal
                studentId={selectedStudent.id}
                dojoId={dojo.id}
                onClose={() => setSelectedStudent(null)}
                onSave={handleUpdatedStudent}
              />
            )}

            {/* Modal de confirmación */}
            {showConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
                  {/* Header */}
                  <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-light uppercase tracking-wide text-[#1a1a1a]">
                      Confirmar creación de alumno
                    </h3>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Información del alumno */}
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="text-[#1a1a1a] mb-4 font-medium uppercase tracking-wide">
                        Información del alumno
                      </h4>
                      <div className="space-y-2 bg-gray-50 p-4 border border-gray-200">
                        <div className="flex">
                          <span className="text-gray-600 w-40">Nombre:</span>
                          <span className="text-[#1a1a1a] font-medium">{newStudent.full_name}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-600 w-40">Fecha de nacimiento:</span>
                          <span className="text-[#1a1a1a] font-medium">{newStudent.birth_date}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-600 w-40">Cinturón:</span>
                          <span className="text-[#1a1a1a] font-medium">{newStudent.current_belt}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-600 w-40">Email:</span>
                          <span className="text-[#1a1a1a] font-medium">
                            {newStudent.full_name && dojo?.name
                              ? generatedEmail(newStudent.full_name, dojo.name)
                              : "nombreapellido@nombredojo.com"}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-600 w-40">Contraseña inicial:</span>
                          <span className="text-[#1a1a1a] font-medium">dojo2025</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botones */}
                  <div className="flex justify-end gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="px-6 py-2 bg-gray-300 text-[#1a1a1a] uppercase text-xs tracking-wide hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmAdd}
                      className="px-6 py-2 bg-[#c41e3a] text-white uppercase text-xs tracking-wide hover:bg-[#a01830] transition-colors"
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
