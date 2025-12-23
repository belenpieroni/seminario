export function Header({ dojoName, role, userName, isHead }) {
  return (
    <header className="bg-[#1a1a1a] text-white py-6 px-8 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Izquierda */}
          <div>
            <h1 className="text-2xl tracking-[0.3em] font-light uppercase">
              DOJO <span className="text-[#c41e3a]">PORTAL</span>
            </h1>
            {role === "sensei" || role === "alumno" ? (
              <p className="mt-1 text-sm text-gray-400 tracking-wide uppercase">
                DOJO {dojoName}
              </p>
            ) : null}
          </div>

          {/* Derecha */}
          <div className="text-right">
            {role === "asociacion" && (
              <p className="text-lg font-semibold text-gray-200 tracking-wide">
                ASOCIACIÓN ARGENTINA DE KARATE
              </p>
            )}

            {(role === "sensei" || role === "alumno") && (
              <div>
                <p className="text-base font-medium text-white">
                  Bienvenido de nuevo, <span className="font-semibold">{userName}</span>
                </p>
                <p className="text-sm text-gray-400 mt-1 italic">
                  Rol:{" "}
                  {role === "sensei"
                    ? isHead
                      ? "Sensei a cargo"
                      : "Sensei"
                    : "Alumno"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
