import { useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import { supabase } from "../supabaseClient"
import { Lock, Eye, EyeOff } from "lucide-react"
import fondo from "../assets/fondo.jpg"

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const role = location.state?.role
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showRepeat, setShowRepeat] = useState(false)
  const [loading, setLoading] = useState(false)
  const isValidLength = newPassword.length >= 6 && repeatPassword.length >= 6
  const passwordsMatch = newPassword === repeatPassword
  const canSubmit = isValidLength && passwordsMatch && !loading

  const handleChangePassword = async e => {
    e.preventDefault()
    setLoading(true)
    if (!isValidLength) {
        alert("La contraseña debe tener al menos 6 caracteres") 
        setLoading(false) 
        return 
    }

    if (newPassword !== repeatPassword) {
      alert("Las contraseñas nuevas no coinciden")
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      alert("La nueva contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: (await supabase.auth.getUser()).data.user.email,
      password: oldPassword,
    })
    if (loginError) {
      alert("La contraseña actual es incorrecta")
      setLoading(false)
      return
    }

    // 1. Cambiar password en auth
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) {
      alert("Error cambiando contraseña: " + error.message)
      setLoading(false)
      return
    }

    // 2. Actualizar flag en tu tabla
    const user = (await supabase.auth.getUser()).data.user
    if (role === "sensei") { 
      await supabase.from("sensei").update({ must_change_password: false }).eq("user_id", user.id)
    }
    if (role === "alumno") { 
      await supabase.from("alumno").update({ must_change_password: false }).eq("user_id", user.id)
    }

    // 3. Redirigir
    await supabase.auth.signOut()
    navigate("/")
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center transition-all duration-500"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative w-full max-w-md px-4">
        <div className="backdrop-blur-md bg-white/80 shadow-2xl p-8">
          {/* TÍTULO */}
          <div className="text-center mb-10">
            <h1 className="text-2xl tracking-[0.3em] font-light text-[#1a1a1a] uppercase">
              Cambiar contraseña
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              Ingrese su contraseña actual y nueva
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            {/* CONTRASEÑA ACTUAL */}
            <div className="relative">
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showOld ? "text" : "password"}
                id="oldPassword"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder=" "
                required
                className="peer w-full bg-transparent border-0 border-b-2 border-[#c41e3a] pl-8 pb-2 pt-4 text-[#1a1a1a] focus:outline-none focus:border-[#a01830]"
              />
              <label
                htmlFor="oldPassword"
                className="absolute left-8 text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:-top-1 peer-focus:text-xs peer-focus:text-[#c41e3a] -top-1 text-xs"
              >
                Contraseña actual
              </label>
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showOld ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* NUEVA CONTRASEÑA */}
            <div className="relative">
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showNew ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder=" "
                required
                className="peer w-full bg-transparent border-0 border-b-2 border-[#c41e3a] pl-8 pb-2 pt-4 text-[#1a1a1a] focus:outline-none focus:border-[#a01830]"
              />
              <label
                htmlFor="newPassword"
                className="absolute left-8 text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:-top-1 peer-focus:text-xs peer-focus:text-[#c41e3a] -top-1 text-xs"
              >
                Nueva contraseña
              </label>
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showNew ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* REPETIR NUEVA CONTRASEÑA */}
            <div className="relative">
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showRepeat ? "text" : "password"}
                id="repeatPassword"
                value={repeatPassword}
                onChange={e => setRepeatPassword(e.target.value)}
                placeholder=" "
                required
                className="peer w-full bg-transparent border-0 border-b-2 border-[#c41e3a] pl-8 pb-2 pt-4 text-[#1a1a1a] focus:outline-none focus:border-[#a01830]"
              />
              <label
                htmlFor="repeatPassword"
                className="absolute left-8 text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:-top-1 peer-focus:text-xs peer-focus:text-[#c41e3a] -top-1 text-xs"
              >
                Repetir nueva contraseña
              </label>
              <button
                type="button"
                onClick={() => setShowRepeat(!showRepeat)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showRepeat ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* BOTÓN */}
            <button type="submit" disabled={!canSubmit} className={`w-full mt-4 py-3 tracking-widest text-sm transition ${ canSubmit ? "bg-[#c41e3a] text-white hover:bg-[#a01830]" : "bg-gray-400 text-gray-200 cursor-not-allowed" }`} >
              Guardar contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}