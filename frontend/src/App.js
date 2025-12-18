import { useState } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import { Login } from "./components/Login"
import ChangePassword from "./components/ChangePassword"
import { Header } from "./components/Header"
import { SenseiSidebar } from "./components/SenseiSidebar"
import { SenseiDashboard } from "./components/SenseiDashboard"
import { SenseiStudentList } from "./components/SenseiStudentList"
import { SenseiStudentDetail } from "./components/SenseiStudentDetail"
import { SenseiExamForm } from "./components/SenseiExamForm"
import { StudentSidebar } from "./components/StudentSidebar"
import { StudentDashboard } from "./components/StudentDashboard"
import { StudentCertificates } from "./components/StudentCertificates"
import { StudentProfile } from "./components/StudentProfile"
import { VerifyCertificate } from "./components/VerifyCertificate"
import { AdminSenseiList } from "./components/AdminSenseiList"
import { AdminDojoList } from "./components/AdminDojoList"
import AdminCreateDojo from "./components/AdminCreateDojo"
import AdminSidebar from "./components/AdminSidebar"
import { createDojo } from "./queries/dojoQueries"
import { login } from "./utils/auth.jsx"

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [showPublicVerification, setShowPublicVerification] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (email, password, role) => {
    try {
      const { mustChangePassword } = await login(email, password, role)

      setIsLoggedIn(true)
      setUserRole(role)

      if (mustChangePassword) {
        navigate("/change-password")
      } else {
        navigate("/sensei-dashboard")
      }
    } catch (err) {
      alert("Credenciales inválidas")
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserRole(null)
    setCurrentView("dashboard")
    setSelectedStudentId(null)
    navigate("/")
  }

  const handleViewStudentDetail = studentId => {
    setSelectedStudentId(studentId)
    setCurrentView("student-detail")
  }

  const handleRegisterExamFromDetail = studentId => {
    setSelectedStudentId(studentId)
    setCurrentView("registrar-examen")
  }

  if (showPublicVerification) {
    return <VerifyCertificate onBack={() => setShowPublicVerification(false)} />
  }

  if (!isLoggedIn) {
    return (
      <div>
        <Login onLogin={handleLogin} />
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setShowPublicVerification(true)}
            className="bg-[#1a1a1a] text-white px-6 py-3 rounded-lg hover:bg-[#c41e3a] transition-colors shadow-lg"
          >
            Verificar certificado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />

        <Route path="/change-password" element={<ChangePassword />} />

        <Route path="/sensei-dashboard" element={<SenseiDashboard />} />

        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDojoList />} />
      </Routes>

      <Header
        dojoName={
          userRole === "asociacion"
            ? "Asociación Argentina de Karate"
            : "Sakura Karate Dojo"
        }
        role={
          userRole === "sensei"
            ? "Sensei"
            : userRole === "alumno"
            ? "Alumno"
            : "Asociación"
        }
        userName="Usuario"
      />

      <div className="flex">
        {userRole === "sensei" ? (
          <SenseiSidebar
            currentView={currentView}
            onNavigate={setCurrentView}
            onLogout={handleLogout}
          />
        ) : userRole === "alumno" ? (
          <StudentSidebar
            currentView={currentView}
            onNavigate={setCurrentView}
            onLogout={handleLogout}
          />
        ) : (
          <AdminSidebar
            currentView={currentView}
            onNavigate={setCurrentView}
            onLogout={handleLogout}
          />
        )}

        <main className="flex-1">
          {userRole === "sensei" && (
            <>
              {currentView === "dashboard" && <SenseiDashboard />}
              {currentView === "alumnos" && (
                <SenseiStudentList onViewDetail={handleViewStudentDetail} />
              )}
              {currentView === "student-detail" && selectedStudentId && (
                <SenseiStudentDetail
                  studentId={selectedStudentId}
                  onBack={() => setCurrentView("alumnos")}
                  onRegisterExam={handleRegisterExamFromDetail}
                />
              )}
              {currentView === "registrar-examen" && (
                <SenseiExamForm studentId={selectedStudentId || undefined} />
              )}
            </>
          )}
          {userRole === "alumno" && (
            <>
              {currentView === "dashboard" && <StudentDashboard />}
              {currentView === "certificados" && <StudentCertificates />}
              {currentView === "perfil" && <StudentProfile />}
            </>
          )}
          {userRole === "asociacion" && (
            <>
              {currentView === "dojos" && <AdminDojoList />}
              {currentView === "crear-dojo" && (
                <AdminCreateDojo onCreateDojo={createDojo} />
              )}
              {currentView === "senseis" && <AdminSenseiList />}
            </>
          )}
        </main>
      </div>

      <footer className="bg-[#1a1a1a] text-white py-6 text-center">
        <p>© 2025 Asociación Argentina de Karate</p>
        <p className="mt-2 text-gray-400">
          Gestión digital • Certificación segura • Blockchain
        </p>
      </footer>
    </div>
  )
}
