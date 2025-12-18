import { supabase } from "../supabaseClient"

export async function login(email, password, role) {
  // 1. Login en Auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error("Credenciales inválidas")

  const user = data.user

  // 2. Si es sensei, consultamos el flag
  if (role === "sensei") {
    const { data: senseiRow, error: senseiError } = await supabase
      .from("sensei")
      .select("must_change_password")
      .eq("user_id", user.id)
      .single()

    if (senseiError) {
      console.error("Error consultando sensei:", senseiError)
      return { user, mustChangePassword: false }
    }

    return { user, mustChangePassword: senseiRow.must_change_password }
  }

  // otros roles no usan flag
  return { user, mustChangePassword: false }
}
