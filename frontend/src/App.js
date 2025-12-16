import { useState } from "react"
import { Login } from "./components/Login"
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
import { createDojo } from "./queries/dojoQueries";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [showPublicVerification, setShowPublicVerification] = useState(false)

  // Mock data
  const [students, setStudents] = useState([
    {
      id: "1",
      name: "Juan Pérez",
      dni: "12345678",
      currentBelt: "Cinturón Verde",
      lastExam: "2025-11-15",
      dojo: "Sakura Karate Dojo",
      examHistory: [
        { date: "2025-01-10", belt: "Cinturón Blanco", status: "Aprobado" },
        { date: "2025-05-20", belt: "Cinturón Amarillo", status: "Aprobado" },
        { date: "2025-11-15", belt: "Cinturón Verde", status: "Aprobado" }
      ]
    },
    {
      id: "2",
      name: "María González",
      dni: "87654321",
      currentBelt: "Cinturón Azul",
      lastExam: "2025-10-05",
      dojo: "Sakura Karate Dojo",
      examHistory: [
        { date: "2024-12-10", belt: "Cinturón Blanco", status: "Aprobado" },
        { date: "2025-04-15", belt: "Cinturón Amarillo", status: "Aprobado" },
        { date: "2025-07-20", belt: "Cinturón Verde", status: "Aprobado" },
        { date: "2025-10-05", belt: "Cinturón Azul", status: "Aprobado" }
      ]
    },
    {
      id: "3",
      name: "Carlos Méndez",
      dni: "45678912",
      currentBelt: "Cinturón Blanco",
      lastExam: "",
      dojo: "Sakura Karate Dojo",
      examHistory: []
    }
  ])

  const [exams, setExams] = useState([
    {
      id: "1",
      studentId: "1",
      belt: "Cinturón Verde",
      date: "2025-11-15",
      status: "Aprobado",
      observations: "Excelente técnica"
    },
    {
      id: "2",
      studentId: "2",
      belt: "Cinturón Azul",
      date: "2025-10-05",
      status: "Aprobado",
      observations: "Muy buen desempeño"
    }
  ])

  const [senseis, setSenseis] = useState([
    {
      id: "1",
      name: "Julián Gomez",
      dni: "11222333",
      rank: "5to Dan - Cinturón Negro",
      dojo: "Sakura Karate Dojo",
      isInCharge: true
    },
    {
      id: "2",
      name: "Roberto Sánchez",
      dni: "22333444",
      rank: "4to Dan - Cinturón Negro",
      dojo: "Dragon Rojo Dojo",
      isInCharge: true
    },
    {
      id: "3",
      name: "Ana Torres",
      dni: "33444555",
      rank: "2do Dan - Cinturón Negro",
      dojo: "Sakura Karate Dojo",
      isInCharge: false
    }
  ])

  const senseiData = {
    name: "Takeshi Yamamoto",
    rank: "5to Dan - Cinturón Negro"
  }

  const currentStudentData = {
    name: "Juan Pérez",
    dni: "12345678",
    currentBelt: "Cinturón Verde",
    dojo: "Sakura Karate Dojo",
    sensei: "Takeshi Yamamoto",
    joinDate: "2025-01-01",
    examHistory: [
      { date: "2025-01-10", belt: "Cinturón Blanco", status: "Aprobado" },
      { date: "2025-05-20", belt: "Cinturón Amarillo", status: "Aprobado" },
      { date: "2025-11-15", belt: "Cinturón Verde", status: "Aprobado" }
    ],
    lastExam: {
      date: "2025-11-15",
      belt: "Cinturón Verde",
      status: "Aprobado"
    }
  }

  const certificates = [
    {
      id: "1",
      belt: "Cinturón Blanco",
      issueDate: "2025-01-10",
      status: "Verificado",
      hash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p",
      dojo: "Sakura Karate Dojo"
    },
    {
      id: "2",
      belt: "Cinturón Amarillo",
      issueDate: "2025-05-20",
      status: "Verificado",
      hash: "0x9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k",
      dojo: "Sakura Karate Dojo"
    },
    {
      id: "3",
      belt: "Cinturón Verde",
      issueDate: "2025-11-15",
      status: "Verificado",
      hash: "0xa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      dojo: "Sakura Karate Dojo"
    }
  ]

  const handleLogin = (email, password, role) => {
    setIsLoggedIn(true)
    setUserRole(role)
    setCurrentView(role === "asociacion" ? "dojos" : "dashboard")
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserRole(null)
    setCurrentView("dashboard")
    setSelectedStudentId(null)
  }

  const handleAddStudent = studentData => {
    const newStudent = {
      ...studentData,
      id: Date.now().toString(),
      dojo: "Sakura Karate Dojo",
      examHistory:
        studentData.currentBelt === "Cinturón Blanco"
          ? []
          : studentData.examHistory || []
    }
    setStudents([...students, newStudent])
  }

  const handleRegisterExam = examData => {
    const newExam = {
      id: Date.now().toString(),
      ...examData,
      status: "Aprobado"
    }
    setExams([...exams, newExam])

    // Update student's current belt and exam history
    setStudents(
      students.map(student => {
        if (student.id === examData.studentId) {
          return {
            ...student,
            currentBelt: examData.belt,
            lastExam: examData.date,
            examHistory: [
              ...student.examHistory,
              {
                date: examData.date,
                belt: examData.belt,
                status: "Aprobado"
              }
            ]
          }
        }
        return student
      })
    )
  }

  const handleViewStudentDetail = studentId => {
    setSelectedStudentId(studentId)
    setCurrentView("student-detail")
  }

  const handleRegisterExamFromDetail = studentId => {
    setSelectedStudentId(studentId)
    setCurrentView("registrar-examen")
  }

  const handleAddSensei = senseiData => {
    const newSensei = {
      ...senseiData,
      id: Date.now().toString(),
      isInCharge: false
    }
    setSenseis([...senseis, newSensei])
  }

  const handleDeleteSensei = senseiId => {
    setSenseis(senseis.filter(s => s.id !== senseiId))
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

  const selectedStudent = selectedStudentId
    ? students.find(s => s.id === selectedStudentId)
    : null

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
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
        userName={
          userRole === "sensei"
            ? senseiData.name
            : userRole === "alumno"
            ? currentStudentData.name
            : "Asociacion"
        }
        userRank={userRole === "sensei" ? senseiData.rank : undefined}
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
            {currentView === "dashboard" && (
              <SenseiDashboard students={students} exams={exams} />
            )}

            {currentView === "alumnos" && (
              <SenseiStudentList
                students={students}
                onViewDetail={handleViewStudentDetail}
                onAddStudent={handleAddStudent}
              />
            )}

            {currentView === "student-detail" && selectedStudent && (
              <SenseiStudentDetail
                student={selectedStudent}
                onBack={() => setCurrentView("alumnos")}
                onRegisterExam={handleRegisterExamFromDetail}
              />
            )}

            {currentView === "registrar-examen" && (
              <SenseiExamForm
                students={students}
                selectedStudentId={selectedStudentId || undefined}
                onRegisterExam={handleRegisterExam}
              />
            )}

            {currentView === "certificados" && (
              <div className="p-8">
                <h2 className="text-[#1a1a1a] mb-4">Certificados</h2>
                <p className="text-gray-600">
                  Vista de certificados del sensei en desarrollo
                </p>
              </div>
            )}
          </>
        )}
        {userRole === "alumno" && (
          <>
            {currentView === "dashboard" && (
              <StudentDashboard student={currentStudentData} />
            )}

            {currentView === "certificados" && (
              <StudentCertificates certificates={certificates} />
            )}

            {currentView === "perfil" && (
              <StudentProfile student={currentStudentData} />
            )}
          </>
        )}
        {userRole === "asociacion" && (
          <>
            {currentView === "dojos" && <AdminDojoList />}

            {currentView === "crear-dojo" && (
              <AdminCreateDojo onCreateDojo={createDojo} />
            )}

            {currentView === "senseis" && (
              <AdminSenseiList
                senseis={senseis}
                onAddSensei={handleAddSensei}
                onDeleteSensei={handleDeleteSensei}
              />
            )}
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
