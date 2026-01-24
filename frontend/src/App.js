//imports generales
import { Routes, Route, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"
//Imports componentes auth
import { Login } from "./components/auth/Login"
import ChangePassword from "./components/auth/ChangePassword"
//Imports componentes common
import { Header } from "./components/common/Header"
//Imports componentes públicos
import { VerifyCertificate } from "./components/VerifyCertificate"
import PublicLanding from "./components/PublicLanding"
//Imports componentes asociación
import AdminSidebar from "./components/admin/AdminSidebar"
import { AdminDojoList } from "./components/admin/AdminDojoList"
import { AdminSenseiList } from "./components/admin/AdminSenseiList"
import AdminCertificates from "./components/admin/AdminCertificates"
import AdminCreateDojo from "./components/admin/AdminCreateDojo"
//Imports componentes sensei
import { SenseiSidebar } from "./components/sensei/SenseiSidebar"
import { SenseiDashboard } from "./components/sensei/SenseiDashboard"
import { SenseiStudentList } from "./components/sensei/SenseiStudentList"
import { SenseiExams } from "./components/sensei/SenseiExams"
import CertificateList from "./components/certificate/CertificateList"
import SenseiNotifications from "./components/sensei/SenseiNotifications"
import SenseiExamList from "./components/sensei/SenseiExamList"
import DojoSenseis from "./components/sensei/DojoSenseis"
//Imports componentes student
import { StudentSidebar } from "./components/student/StudentSidebar"
import { StudentDashboard } from "./components/student/StudentDashboard"
import { StudentExams } from "./components/student/StudentExams"
import StudentProgress from "./components/student/StudentProgress"
import { StudentNotifications } from "./components/student/StudentNotifications"
//Import utils
import { login } from "./utils/auth"

export default function App() {
  const [userRole, setUserRole] = useState(null)
  const [dojo, setDojo] = useState(null)
  const [userName, setUserName] = useState("")
  const [isHead, setIsHead] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (email, password) => {
    try {
      const { role, mustChangePassword, isHead, fullName, dojoId } = await login(email, password)

      if (mustChangePassword && (role === "sensei" || role === "student")) {
        navigate("/change-password", { state: { role } })
        return
      }

      setUserRole(role)
      setIsHead(isHead)
      setUserName(fullName)

      if (dojoId) {
        const { data: dojoData } = await supabase
          .from("dojo")
          .select("name")
          .eq("id", dojoId)
          .single()
        if (dojoData) setDojo(dojoData)
      } else {
        setDojo(null)
      }

      if (role === "sensei") navigate("/sensei/dashboard")
      if (role === "student") navigate("/student/dashboard")
      if (role === "asociacion") navigate("/admin/dashboard")
    } catch {
      alert("Credenciales inválidas")
    }
  }

  const handleLogout = () => {
    supabase.auth.signOut()
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
      if (userRole === "student") {
        const { data: student } = await supabase
          .from("student")
          .select("full_name, dojo_id")
          .eq("user_id", user.id)
          .single()
        if (student) {
          setUserName(student.full_name)

          const { data: dojoData } = await supabase
            .from("dojo")
            .select("name")
            .eq("id", student.dojo_id)
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
            {userRole === "student" && <StudentSidebar onLogout={handleLogout} />}
            {userRole === "asociacion" && <AdminSidebar onLogout={handleLogout} />}

            <main className="flex-1 p-6">
              <Routes>
                {/* SENSEI */}
                <Route path="/sensei/dashboard" element={<SenseiDashboard />} />
                <Route path="/sensei/students" element={<SenseiStudentList />} />
                <Route path="/sensei/senseis" element={<DojoSenseis />} />
                <Route path="/sensei/manage-exams" element={<SenseiExamList />} />
                <Route path="/sensei/exams" element={<SenseiExams />} />
                <Route path="/sensei/notifications" element={<SenseiNotifications />} />
                <Route path="/sensei/certificados" element={<CertificateList />} />

                {/* STUDENT */}
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/progress" element={<StudentProgress />} />
                <Route path="/student/notifications" element={<StudentNotifications />} />
                <Route path="/student/certificados" element={<StudentDashboard />} />
                <Route path="/student/exams" element={<StudentExams />} />

                {/* ADMIN / ASOCIACIÓN */}
                <Route path="/admin/dashboard" element={<AdminDojoList />} />
                <Route path="/admin/senseis" element={<AdminSenseiList />} />
                <Route path="/admin/crear-dojo" element={<AdminCreateDojo />} />
                <Route path="/admin/certificados" element={<AdminCertificates />} />
              </Routes>
            </main>
          </div>
        </>
      )}
    </div>
  )
}
