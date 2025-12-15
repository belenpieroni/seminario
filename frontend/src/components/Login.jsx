import { useState } from "react"
import bgSensei from "../assets/bg-sensei.jpg"
import bgAlumno from "../assets/bg-student.jpg"
import bgAsociacion from "../assets/bg-asociacion.jpg"

export function Login({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("sensei")
  const backgrounds = {
    sensei: bgSensei,
    alumno: bgAlumno,
    asociacion: bgAsociacion
  }


  const handleSubmit = e => {
    e.preventDefault()
    onLogin(email, password, role)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center transition-all duration-500"
      style={{
        backgroundImage: `url(${backgrounds[role]})`
      }}
    >
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8 border-t-4 border-[#c41e3a]">
          <div className="text-center mb-8">
            <h1 className="text-[#1a1a1a] mb-2">Sistema de Gestión de Dojos</h1>
            <p className="text-gray-600">
              Acceso a la plataforma de gestión y certificación
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-[#1a1a1a] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent"
                placeholder="ejemplo@dojo.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[#1a1a1a] mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-[#1a1a1a] mb-3">
                Ingresar como:
              </label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="sensei"
                    checked={role === "sensei"}
                    onChange={e => setRole(e.target.value)}
                    className="w-4 h-4 text-[#c41e3a] focus:ring-[#c41e3a]"
                  />
                  <span className="ml-2 text-[#1a1a1a]">Sensei</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="alumno"
                    checked={role === "alumno"}
                    onChange={e => setRole(e.target.value)}
                    className="w-4 h-4 text-[#c41e3a] focus:ring-[#c41e3a]"
                  />
                  <span className="ml-2 text-[#1a1a1a]">Alumno</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="asociacion"
                    checked={role === "asociacion"}
                    onChange={e => setRole(e.target.value)}
                    className="w-4 h-4 text-[#c41e3a] focus:ring-[#c41e3a]"
                  />
                  <span className="ml-2 text-[#1a1a1a]">Asociación</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#c41e3a] text-white py-3 rounded-lg hover:bg-[#a01830] transition-colors"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}