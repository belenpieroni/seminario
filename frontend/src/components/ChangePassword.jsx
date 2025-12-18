import { useState } from "react"
import { supabase } from "../supabaseClient"

export default function ChangePassword() {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async e => {
    e.preventDefault()
    setLoading(true)

    // 1. Cambiar password en auth
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      alert("Error cambiando contraseña")
      setLoading(false)
      return
    }

    // 2. Actualizar flag
    const user = (await supabase.auth.getUser()).data.user

    await supabase
      .from("user_role")
      .update({ must_change_password: false })
      .eq("user_id", user.id)

    // 3. Redirigir
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleChangePassword} className="bg-white p-8 shadow-lg">
        <h2 className="mb-4 text-xl">Cambiar contraseña</h2>

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border w-full p-3 mb-4"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#c41e3a] text-white py-3"
        >
          Guardar contraseña
        </button>
      </form>
    </div>
  )
}