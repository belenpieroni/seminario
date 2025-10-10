import { useState } from "react";
import { User } from "lucide-react";

export function Header({ nombre, apellido }) {
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  function handleImagenSeleccionada(e) {
    const archivo = e.target.files[0];
    if (archivo) {
      const url = URL.createObjectURL(archivo);
      setFotoPerfil(url);
    }
  }

  function handleAbrirSelector() {
    document.getElementById("foto-perfil").click();
    setMostrarOpciones(false);
  }

  function handleEliminarFoto() {
    setFotoPerfil(null);
    setMostrarOpciones(false);
  }

  return (
    <header className="border-b" style={{ backgroundColor: "#1a1a1a", borderColor: "#e5e5e5" }}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="tracking-widest leading-relaxed text-white">DOJO PORTAL</h1>
            <p className="mt-1 tracking-wide leading-relaxed" style={{ color: "#666666" }}>
              ¡Bienvenido de nuevo, {nombre} {apellido}!
            </p>
          </div>

          <div className="relative">
            <div
              onClick={() => setMostrarOpciones(!mostrarOpciones)}
              className="flex items-center justify-center w-12 h-12 rounded-full overflow-hidden bg-red-700 cursor-pointer"
            >
              {fotoPerfil ? (
                <img src={fotoPerfil} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>

            {mostrarOpciones && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                <button
                  onClick={handleAbrirSelector}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cambiar foto de perfil
                </button>
                {fotoPerfil && (
                  <button
                    onClick={handleEliminarFoto}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Eliminar foto de perfil
                  </button>
                )}
              </div>
            )}

            <input
              id="foto-perfil"
              type="file"
              accept="image/*"
              onChange={handleImagenSeleccionada}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
