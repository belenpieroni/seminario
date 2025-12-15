export function Header({ dojoName, role, userName, userRank }) {
  return (
    <header className="bg-[#1a1a1a] text-white py-6 px-8 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white mb-2">DOJO PORTAL</h1>
            <p className="text-gray-300">Dojo: {dojoName}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-300">Rol: {role}</p>
            {userName && (
              <div className="mt-2">
                <p className="text-white">
                  ¡Bienvenido de nuevo, {role.toLowerCase()} {userName}!
                </p>
                {userRank && <p className="text-gray-400">{userRank}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
