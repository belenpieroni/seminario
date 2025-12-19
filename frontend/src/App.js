import { Routes, Route, useNavigate } from "react-router-dom"
import { useState } from "react"

import { Login } from "./components/Login"
import ChangePassword from "./components/ChangePassword"
import { Header } from "./components/Header"

import { SenseiSidebar } from "./components/SenseiSidebar"
import { StudentSidebar } from "./components/StudentSidebar"
import AdminSidebar from "./components/AdminSidebar"

import { SenseiDashboard } from "./components/SenseiDashboard"
import { SenseiStudentList } from "./components/SenseiStudentList"
import { SenseiExamForm } from "./components/SenseiExamForm"
import { StudentDashboard } from "./components/StudentDashboard"
import { AdminDojoList } from "./components/AdminDojoList"
import { AdminSenseiList } from "./components/AdminSenseiList"
import AdminCreateDojo from "./components/AdminCreateDojo"

import { login } from "./utils/auth"

export default function App() {
  const [userRole, setUserRole] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (email, password, role) => {
    try {
      const { mustChangePassword } = await login(email, password)

      setUserRole(role)

      if (mustChangePassword) {
        navigate("/change-password")
        return
      }

      if (role === "sensei") navigate("/sensei/dashboard")
      if (role === "alumno") navigate("/student/dashboard")
      if (role === "asociacion") navigate("/admin/dashboard")
    } catch {
      alert("Credenciales inválidas")
    }
  }

  const handleLogout = () => {
    setUserRole(null)
    navigate("/")
  }

  // LOGIN
  if (!userRole) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        role={
          userRole === "sensei"
            ? "Sensei"
            : userRole === "alumno"
            ? "Alumno"
            : "Asociación"
        }
        dojoName="Dojo"
        userName="Usuario"
      />

      <div className="flex flex-1">
        {userRole === "sensei" && <SenseiSidebar onLogout={handleLogout} />}
        {userRole === "alumno" && <StudentSidebar onLogout={handleLogout} />}
        {userRole === "asociacion" && <AdminSidebar onLogout={handleLogout} />}

        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* SENSEI */}
            <Route path="/sensei/dashboard" element={<SenseiDashboard />} />
            <Route path="/sensei/alumnos" element={<SenseiStudentList />} />
            <Route path="/sensei/sensei" element={<SenseiDashboard />} />
            <Route path="/sensei/exams" element={<SenseiExamForm />} />

            {/* ALUMNO */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />

            {/* ADMIN / ASOCIACIÓN */}
            <Route path="/admin/dashboard" element={<AdminDojoList />} />
            <Route path="/admin/senseis" element={<AdminSenseiList />} />
            <Route path="/admin/crear-dojo" element={<AdminCreateDojo />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
