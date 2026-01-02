import { useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import { supabase } from "../../supabaseClient"
import { Lock, Eye, EyeOff } from "lucide-react"
import fondo from "../../assets/fondo.jpg"
import { BackButton } from "../common/BackButton"

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

    try {
      if (!isValidLength) {
        alert("La contraseña debe tener al menos 6 caracteres")
        return
      }

      if (!passwordsMatch) {
        alert("Las contraseñas nuevas no coinciden")
        return
      }

      // obtener usuario actual (antes de re-login)
      const userResp = await supabase.auth.getUser()
      const currentUser = userResp?.data?.user
      if (!currentUser?.email) {
        alert("No se pudo obtener el usuario actual.")
        return
      }

      // 0) Re-autenticar con la contraseña antigua
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: oldPassword,
      })
      if (loginError) {
        alert("La contraseña actual es incorrecta")
        return
      }

      // 1) Cambiar password en Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (updateError) {
        alert("Error cambiando contraseña: " + updateError.message)
        return
      }

      // 2) Re-obtener usuario (para asegurarnos del id actual)
      const { data: refreshedUserData, error: refreshedErr } = await supabase.auth.getUser()
      const user = refreshedUserData?.user
      if (!user) {
        alert("No se pudo verificar el usuario después de cambiar la contraseña.")
        return
      }

      // 3) Actualizar flag must_change_password en la tabla correspondiente
      //    Intentamos actualizar la tabla esperada según role.
      //    Si la tabla no existe o no hay filas afectadas, lo informamos.
      let updateResult = null
      if (role === "sensei") {
        updateResult = await supabase
          .from("sensei")
          .update({ must_change_password: false })
          .eq("user_id", user.id)
      } else if (role === "student") {
        updateResult = await supabase
          .from("student")
          .update({ must_change_password: false })
          .eq("user_id", user.id)

        if (!updateResult || updateResult.error || (updateResult.data && updateResult.data.length === 0)) {
          const fallback = await supabase
            .from("student")
            .update({ must_change_password: false })
            .eq("user_id", user.id)
          // preferimos fallback si tuvo éxito
          if (fallback && !fallback.error && fallback.data && fallback.data.length > 0) {
            updateResult = fallback
          }
        }
      } else {
        const trySensei = await supabase
          .from("sensei")
          .update({ must_change_password: false })
          .eq("user_id", user.id)
        const trystudent = await supabase
          .from("student")
          .update({ must_change_password: false })
          .eq("user_id", user.id)
        updateResult = trySensei.error ? trystudent : trySensei
      }

      // 4) Revisar resultado de la actualización
      if (!updateResult) {
        console.warn("No se obtuvo respuesta al intentar actualizar must_change_password.")
      } else if (updateResult.error) {
        console.error("Error actualizando must_change_password:", updateResult.error)
        // Puede ser RLS: informar al usuario
        alert("La contraseña se cambió, pero no se pudo actualizar el flag en la base (permiso denegado). Contactá al administrador.")
      } else {
        // Si la respuesta incluye data, verificamos si afectó filas
        const affected = Array.isArray(updateResult.data) ? updateResult.data.length : (updateResult.count ?? null)
        if (affected === 0) {
          // No se encontró fila para ese user_id
          console.warn("No se encontró registro para user_id en la tabla correspondiente.")
          alert("La contraseña se cambió correctamente, pero no se encontró el registro del usuario para actualizar el flag. Contactá al administrador si el problema persiste.")
        }
      }

      // 5) Cerrar sesión y redirigir
      await supabase.auth.signOut()
      navigate("/login")
    } catch (err) {
      console.error("Error en handleChangePassword:", err)
      alert("Ocurrió un error inesperado. Intentá nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center transition-all duration-500"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative w-full max-w-md px-4">
        <div className="backdrop-blur-md bg-white/80 shadow-2xl p-8">
          <BackButton onBack={() => navigate("/login")} />
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
                minLength={6}
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
              {newPassword && (
                <p className={`mt-1 text-xs ${newPassword.length < 6 ? "text-red-600" : "text-green-600"}`}>
                  {newPassword.length < 6 ? "Debe tener al menos 6 caracteres" : "✔ Contraseña válida"}
                </p>
              )}
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
                minLength={6}
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
              {repeatPassword && (
                <p className={`mt-1 text-xs ${repeatPassword === newPassword ? "text-green-600" : "text-red-600"}`}>
                  {repeatPassword === newPassword ? "" : "Las contraseñas no coinciden"}
                </p>
              )}
            </div>

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full mt-4 py-3 tracking-widest text-sm transition ${canSubmit ? "bg-[#c41e3a] text-white hover:bg-[#a01830]" : "bg-gray-400 text-gray-200 cursor-not-allowed"}`}
            >
              Guardar contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
