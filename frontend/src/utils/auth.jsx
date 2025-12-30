import { supabase } from "../supabaseClient"

export async function login(email, password) {
  // 1. Login en Auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error("Credenciales inválidas")

  const user = data.user
  if (!user) throw new Error("Usuario no encontrado")

  // 2. Buscar en tabla sensei
  const { data: senseiRow } = await supabase
    .from("sensei")
    .select("id, full_name, dojo_id, is_head, must_change_password")
    .eq("user_id", user.id)
    .maybeSingle()

  if (senseiRow) {
    return {
      user,
      role: "sensei",
      isHead: senseiRow.is_head,
      mustChangePassword: senseiRow.must_change_password,
      fullName: senseiRow.full_name,
      dojoId: senseiRow.dojo_id,
    }
  }

  // 3. Buscar en tabla student
  const { data: studentRow } = await supabase
    .from("student")
    .select("id, full_name, dojo_id, must_change_password")
    .eq("user_id", user.id)
    .maybeSingle()

  if (studentRow) {
    return {
      user,
      role: "student",
      isHead: false,
      mustChangePassword: studentRow.must_change_password,
      fullName: studentRow.full_name,
      dojoId: studentRow.dojo_id,
    }
  }

  // 4. Si no está en sensei ni student → asociación
  return {
    user,
    role: "asociacion",
    isHead: false,
    mustChangePassword: false,
    fullName: "Asociación Argentina de Karate",
    dojoId: null,
  }
}
