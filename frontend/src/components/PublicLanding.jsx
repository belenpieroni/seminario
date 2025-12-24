import { Award, LogIn, TrendingUp, Calendar, Trophy } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function PublicLanding() {
    const navigate = useNavigate()

    // Datos simulados
    const news = [
        { id: 1, date: "10/02/2025", title: "Seminario Nacional 2025", description: "Evento en Buenos Aires con maestros invitados." },
        { id: 2, date: "05/01/2025", title: "Nuevo reglamento de graduaciones", description: "Actualización oficial de la Asociación." },
    ]

    const tournaments = [
        { id: 1, name: "Torneo Apertura", date: "15/03/2025", location: "La Plata", status: "inscripción abierta" },
        { id: 2, name: "Copa Argentina", date: "20/06/2025", location: "CABA", status: "próximamente" },
    ]

    const dojoRankings = [
        { rank: 1, name: "Dojo Central", points: 120, students: 50 },
        { rank: 2, name: "Dojo La Plata", points: 115, students: 40 },
    ]

    const studentRankings = [
        { rank: 1, name: "Juan Pérez", dojo: "Dojo Central", belt: "Cinturón Negro", points: 200 },
        { rank: 2, name: "María Gómez", dojo: "Dojo La Plata", belt: "Cinturón Marrón", points: 180 },
    ]

    // Helpers para estilos
    const getStatusColor = status =>
        status.includes("abierta") ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"

    const getMedalColor = rank =>
        rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : rank === 3 ? "text-orange-400" : ""

    const getBeltColor = belt =>
        belt.includes("Negro") ? "bg-black text-white" :
        belt.includes("Marrón") ? "bg-yellow-800 text-white" :
        "bg-gray-200 text-gray-700"

    return (
    <div className="min-h-screen bg-[#f8f8f8]">
        {/* Header */}
        <header className="bg-[#1a1a1a] text-white py-6 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
            <h1 className="text-2xl tracking-[0.3em] font-light uppercase">
              DOJO <span className="text-[#c41e3a]">PORTAL</span>
            </h1>
            </div>
            <div className="flex items-center gap-4">
            <button
                onClick={() => navigate("/verify")}
                className="flex items-center gap-2 px-6 py-3 bg-[#c41e3a] text-white hover:bg-[#a01830] transition-colors"
            >
                <Award className="w-5 h-5" />
                Verificar Certificado
            </button>
            <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-6 py-3 border-2 border-white text-white hover:bg-white hover:text-[#1a1a1a] transition-colors"
            >
                <LogIn className="w-5 h-5" />
                Iniciar Sesión
            </button>
            </div>
        </div>
        </header>

        {/* Hero */}
        <section className="bg-gradient-to-r from-[#c41e3a] to-[#a01830] text-white py-16 text-center">
        <h2 className="text-3xl mb-4">Sistema de Gestión de Dojos de Karate</h2>
        <p className="text-xl max-w-3xl mx-auto opacity-90">
            Plataforma integral para la gestión de dojos, seguimiento de estudiantes, certificación blockchain y rankings nacionales.
        </p>
        </section>

        {/* Noticias */}
        <section className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-[#c41e3a]" />
            <h2 className="text-[#1a1a1a]">Noticias Recientes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map((item) => (
            <div key={item.id} className="bg-white shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-sm text-gray-500 mb-2">{item.date}</div>
                <h3 className="text-[#1a1a1a] mb-3">{item.title}</h3>
                <p className="text-gray-700">{item.description}</p>
            </div>
            ))}
        </div>
        </section>

        {/* Torneos */}
        <section className="container mx-auto px-4 mb-12">
        <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-8 h-8 text-[#c41e3a]" />
            <h2 className="text-[#1a1a1a]">Próximos Torneos</h2>
        </div>
        <div className="bg-white shadow-md overflow-hidden">
            <table className="w-full">
            <thead className="bg-[#1a1a1a] text-white">
                <tr>
                <th className="px-6 py-4 text-left">Torneo</th>
                <th className="px-6 py-4 text-left">Fecha</th>
                <th className="px-6 py-4 text-left">Ubicación</th>
                <th className="px-6 py-4 text-left">Estado</th>
                </tr>
            </thead>
            <tbody>
                {tournaments.map((t) => (
                <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">{t.name}</td>
                    <td className="px-6 py-4">{t.date}</td>
                    <td className="px-6 py-4">{t.location}</td>
                    <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-sm rounded ${getStatusColor(t.status)}`}>
                        {t.status}
                    </span>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </section>

        {/* Rankings */}
        <section className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ranking de Dojos */}
        <div className="bg-white shadow-md">
            <div className="bg-[#c41e3a] text-white px-6 py-4 grid grid-cols-4">
            <div className="col-span-2">Dojo</div>
            <div className="text-center">Puntos</div>
            <div className="text-center">Alumnos</div>
            </div>
            {dojoRankings.map((d) => (
            <div key={d.rank} className="px-6 py-4 border-b hover:bg-gray-50 grid grid-cols-4 items-center">
                <div className="col-span-2 flex items-center gap-3">
                {d.rank <= 3 ? (
                    <Trophy className={`w-6 h-6 ${getMedalColor(d.rank)}`} />
                ) : (
                    <span>#{d.rank}</span>
                )}
                <span>{d.name}</span>
                </div>
                <div className="text-center text-[#c41e3a]">{d.points}</div>
                <div className="text-center">{d.students}</div>
            </div>
            ))}
        </div>

        {/* Ranking de Alumnos */}
        <div className="bg-white shadow-md">
            <div className="bg-[#c41e3a] text-white px-6 py-4 grid grid-cols-3">
            <div>Alumno</div>
            <div className="text-center">Cinturón</div>
            <div className="text-center">Puntos</div>
            </div>
            {studentRankings.map((s) => (
            <div
                key={`${s.rank}-${s.name}`}
                className="px-6 py-4 border-b hover:bg-gray-50 grid grid-cols-3 items-center"
            >
                <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8">
                    {s.rank <= 3 ? (
                    <Trophy className={`w-5 h-5 ${getMedalColor(s.rank)}`} />
                    ) : (
                    <span className="text-gray-500 text-sm">#{s.rank}</span>
                    )}
                </div>
                <div>
                    <div className="text-[#1a1a1a]">{s.name}</div>
                    <div className="text-sm text-gray-500">{s.dojo}</div>
                </div>
                </div>
                <div className="flex justify-center">
                <span className={`px-3 py-1 text-sm rounded ${getBeltColor(s.belt)}`}>
                    {s.belt.replace("Cinturón ", "")}
                </span>
                </div>
                <div className="text-center text-[#c41e3a]">{s.points}</div>
            </div>
            ))}
        </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#1a1a1a] text-white py-8 mt-16">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
                <h3 className="text-white mb-4">Dojo Portal</h3>
                <p className="text-gray-400">
                Sistema integral de gestión para dojos de karate en Argentina.
                </p>
            </div>
            <div>
                <h4 className="text-white mb-4">Contacto</h4>
                <p className="text-gray-400">info@dojoportal.com</p>
                <p className="text-gray-400">+54 11 1234-5678</p>
            </div>
            <div>
                <h4 className="text-white mb-4">Certificación Blockchain</h4>
                <p className="text-gray-400">
                Todos los certificados están verificados mediante tecnología
                blockchain para garantizar su autenticidad.
                </p>
            </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Dojo Portal. Todos los derechos reservados.</p>
            </div>
        </div>
        </footer>
    </div>
    )
}
