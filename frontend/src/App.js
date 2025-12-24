import { Routes, Route, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"

import { Login } from "./components/auth/Login"
import ChangePassword from "./components/auth/ChangePassword"
import { Header } from "./components/common/Header"
import { VerifyCertificate } from "./components/VerifyCertificate"

import { SenseiSidebar } from "./components/sensei/SenseiSidebar"
import { StudentSidebar } from "./components/student/StudentSidebar"
import AdminSidebar from "./components/admin/AdminSidebar"
import PublicLanding from "./components/PublicLanding"
import { SenseiDashboard } from "./components/sensei/SenseiDashboard"
import { SenseiStudentList } from "./components/sensei/SenseiStudentList"
import SenseiExamList from "./components/sensei/SenseiExamList"
import { StudentDashboard } from "./components/student/StudentDashboard"
import { AdminDojoList } from "./components/admin/AdminDojoList"
import { AdminSenseiList } from "./components/admin/AdminSenseiList"
import AdminCreateDojo from "./components/admin/AdminCreateDojo"

import { login } from "./utils/auth"
import DojoSenseis from "./components/sensei/DojoSenseis"

export default function App() {
  const [userRole, setUserRole] = useState(null)
  const [dojo, setDojo] = useState(null)
  const [userName, setUserName] = useState("")
  const [isHead, setIsHead] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (email, password, role) => {
    try {
      const { mustChangePassword } = await login(email, password, role)

      if (mustChangePassword) {
        navigate("/change-password", { state: { role } })
        return
      }
      
      setUserRole(role)

      if (role === "sensei") navigate("/sensei/dashboard")
      if (role === "alumno") navigate("/student/dashboard")
      if (role === "asociacion") navigate("/admin/dashboard")
    } catch {
      alert("Credenciales inválidas")
    }
  }

  const handleLogout = () => { 
    setUserRole(null) 
    setIsHead(false) 
    setDojo(null) 
    setUserName("") 
    navigate("/") 
  }
  
  useEffect(() => {
    async function fetchUserData() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return

      if (userRole === "sensei") {
        const { data: sensei } = await supabase 
          .from("sensei") 
          .select("is_head, full_name, dojo_id")
          .eq("user_id", user.id) 
          .single()

        if (sensei) {
          setIsHead(sensei.is_head)
          setUserName(sensei.full_name)

          const { data: dojoData } = await supabase
            .from("dojo")
            .select("name")
            .eq("id", sensei.dojo_id)
            .single()

          if (dojoData) setDojo(dojoData)
        } 
      }
      if (userRole === "alumno") {
        const { data: alumno } = await supabase
          .from("alumno")
          .select("full_name, dojo_id")
          .eq("user_id", user.id)
          .single()
        if (alumno) { 
          setUserName(alumno.full_name) 
          
          const { data: dojoData } = await supabase
            .from("dojo")
            .select("name")
            .eq("id", alumno.dojo_id)
            .single() 
            
          if (dojoData) setDojo(dojoData) 
          }
        }
        if (userRole === "asociacion") {
          setUserName("Asociación Argentina de Karate")
          setDojo(null)
        }
      } 
      
      fetchUserData()
  }, [userRole])

  return (
    <div className="min-h-screen flex flex-col">
      {!userRole ? (
        // Rutas públicas
        <Routes>
          <Route path="/" element={<PublicLanding />} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Routes>
      ) : (
        // Layout privado
        <>
          <Header
            role={userRole}
            dojoName={dojo?.name || ""}
            userName={userName}
            isHead={isHead}
          />
          <div className="flex flex-1">
            {userRole === "sensei" && (
              <SenseiSidebar onLogout={handleLogout} isHead={isHead} />
            )}
            {userRole === "alumno" && <StudentSidebar onLogout={handleLogout} />}
            {userRole === "asociacion" && <AdminSidebar onLogout={handleLogout} />}

            <main className="flex-1 p-6">
              <Routes>
                {/* SENSEI */}
                <Route path="/sensei/dashboard" element={<SenseiDashboard />} />
                <Route path="/sensei/alumnos" element={<SenseiStudentList />} />
                <Route path="/sensei/senseis" element={<DojoSenseis />} />
                <Route path="/sensei/exams" element={ <SenseiExamList senseiId="UUID_DEL_SENSEI" onViewDetail={(id) => console.log("Ver detalle examen", id)} onCreateExam={() => console.log("Crear examen")} /> } />

                {/* ALUMNO */}
                <Route path="/student/dashboard" element={<StudentDashboard />} />

                {/* ADMIN / ASOCIACIÓN */}
                <Route path="/admin/dashboard" element={<AdminDojoList />} />
                <Route path="/admin/senseis" element={<AdminSenseiList />} />
                <Route path="/admin/crear-dojo" element={<AdminCreateDojo />} />
              </Routes>
            </main>
          </div>
        </>
      )}
    </div>
  )
}
