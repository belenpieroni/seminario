import { useState } from "react"
import { Mail, Lock } from "lucide-react"
import bgSensei from "../../assets/bg-sensei.jpg"
import bgAlumno from "../../assets/bg-student.jpg"
import bgAsociacion from "../../assets/bg-asociacion.jpg"

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
      className="min-h-screen flex items-center justify-center bg-cover bg-center transition-all duration-500"
      style={{ backgroundImage: `url(${backgrounds[role]})` }}
    >
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative w-full max-w-md px-4">
        <div className="backdrop-blur-md bg-white/80 shadow-2xl p-8">
          
          {/* TÍTULO */}
          <div className="text-center mb-10">
            <h1 className="text-2xl tracking-[0.3em] font-light text-[#1a1a1a] uppercase">
              Dojo <span className="text-[#c41e3a]">PORTAL</span>
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              Plataforma de gestión y certificación
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder=" "
                required
                className="
                  peer w-full
                  bg-transparent
                  border-0 border-b-2 border-[#c41e3a]
                  pl-8 pb-2 pt-4
                  text-[#1a1a1a]
                  focus:outline-none
                  focus:border-[#a01830]
                "
              />

              <label
                htmlFor="email"
                className="
                  absolute left-8
                  text-gray-500 
                  transition-all
                  peer-placeholder-shown:top-4
                  peer-placeholder-shown:text-sm
                  peer-placeholder-shown:text-gray-500
                  peer-focus:-top-1
                  peer-focus:text-xs
                  peer-focus:text-[#c41e3a]
                  -top-1 text-xs
                "
              >
                Email
              </label>
            </div>
            {/* PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder=" "
                required
                className="
                  peer w-full
                  bg-transparent
                  border-0 border-b-2 border-[#c41e3a]
                  pl-8 pb-2 pt-4
                  text-[#1a1a1a]
                  focus:outline-none
                  focus:border-[#a01830]
                "
              />

              <label
                htmlFor="password"
                className="
                  absolute left-8
                  text-gray-500 
                  transition-all
                  peer-placeholder-shown:top-4
                  peer-placeholder-shown:text-sm
                  peer-placeholder-shown:text-gray-500
                  peer-focus:-top-1
                  peer-focus:text-xs
                  peer-focus:text-[#c41e3a]
                  -top-1 text-xs
                "
              >
                Contraseña
              </label>
            </div>

            {/* OLVIDASTE CONTRASEÑA */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-[#c41e3a] transition"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* ROLES */}
            <div className="flex justify-between text-sm text-gray-700">
              {["sensei", "alumno", "asociacion"].map(r => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={role === r}
                    onChange={e => setRole(e.target.value)}
                    className="accent-[#c41e3a]"
                  />
                  <span className="capitalize">{r}</span>
                </label>
              ))}
            </div>

            {/* BOTÓN */}
            <button
              type="submit"
              className="w-full mt-4 bg-[#c41e3a] text-white py-3 hover:bg-[#a01830] transition tracking-widest text-sm"
            >
              INGRESAR
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
