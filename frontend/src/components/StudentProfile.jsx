export function StudentProfile({ student }) {
  return (
    <div className="p-8">
      <h2 className="text-[#1a1a1a] mb-8">Mi perfil</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 mb-2">Nombre completo</p>
            <p className="text-[#1a1a1a]">{student.name}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-2">DNI</p>
            <p className="text-[#1a1a1a]">{student.dni}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-2">Dojo</p>
            <p className="text-[#1a1a1a]">{student.dojo}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-2">Sensei</p>
            <p className="text-[#1a1a1a]">{student.sensei}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-2">Fecha de ingreso</p>
            <p className="text-[#1a1a1a]">
              {new Date(student.joinDate).toLocaleDateString("es-AR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
