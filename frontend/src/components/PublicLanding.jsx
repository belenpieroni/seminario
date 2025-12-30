import { useEffect, useRef, useState } from "react"
import { Award, LogIn, TrendingUp, Calendar, Trophy } from "lucide-react"
import { useNavigate } from "react-router-dom"
import bgAsociacion from "../assets/bg-asociacion.jpg"
import bgStudent from "../assets/bg-student.jpg"
import bgSensei from "../assets/bg-sensei.jpg"
import { getDojos } from "../queries/dojoQueries" // ajustar ruta si hace falta
import { supabase } from "../supabaseClient" // para traer teléfono si no viene en getDojos

export default function PublicLanding() {
  const navigate = useNavigate()

  // datos simulados / placeholders
  const [news, setNews] = useState([
    { id: 1, date: "10/02/2025", title: "Seminario Nacional 2025", description: "Evento en Buenos Aires con maestros invitados." },
    { id: 2, date: "05/01/2025", title: "Nuevo reglamento de graduaciones", description: "Actualización oficial de la Asociación." },
  ])

  const [tournaments, setTournaments] = useState([
    { id: 1, name: "Torneo Apertura", dojo: "Dojo Makoto", points: 120 },
    { id: 2, name: "Copa Argentina", dojo: "Dojo SakuraDo", points: 115 },
    { id: 3, name: "Torneo Clausura", dojo: "Dojo Tora", points: 100 },
  ])

  const [dojoRankings, setDojoRankings] = useState([
    { rank: 1, name: "Dojo Makoto", points: 120, students: 50 },
    { rank: 2, name: "Dojo SakuraDo", points: 115, students: 40 },
    { rank: 3, name: "Dojo Tora", points: 100, students: 30 },
  ])

  const [studentRankings, setStudentRankings] = useState([
    { rank: 1, name: "Juan Pérez", dojo: "Dojo Makoto", belt: "Cinturón Negro", points: 200 },
    { rank: 2, name: "María Gómez", dojo: "Dojo SakuraDo", belt: "Cinturón Marrón", points: 180 },
  ])

  const getMedalColor = rank =>
    rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : rank === 3 ? "text-orange-400" : ""

  const getBeltColor = belt =>
    belt.includes("Negro") ? "bg-black text-white" :
    belt.includes("Marrón") ? "bg-yellow-800 text-white" :
    "bg-gray-200 text-gray-700"

  // Carrusel
  const slides = [
    { img: bgAsociacion, title: "Asociación Argentina de Karate", subtitle: "Regulación, eventos y normativa nacional." },
    { img: bgStudent, title: "Formación y Seguimiento", subtitle: "Herramientas para el seguimiento de alumnos y progreso." },
    { img: bgSensei, title: "Capacitación de Senseis", subtitle: "Cursos, seminarios y recursos para instructores." },
  ]
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(id)
  }, [paused])

  // Secciones refs para scroll
  const newsRef = useRef(null)
  const tournamentsRef = useRef(null)
  const statsRef = useRef(null)
  const dojosRef = useRef(null)

  const scrollToRef = ref => {
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Dojos reales
  const [dojos, setDojos] = useState([])
  const [loadingDojos, setLoadingDojos] = useState(true)

  useEffect(() => {
    const fetchDojos = async () => {
      setLoadingDojos(true)
      try {
        const enriched = await getDojos()

        const withPhones = await Promise.all(
          enriched.map(async d => {
            if (d.phone) return d
            const { data } = await supabase
              .from("dojo")
              .select("phone")
              .eq("id", d.id)
              .single()
            return { ...d, phone: data?.phone || "—" }
          })
        )

        setDojos(withPhones)
      } catch (err) {
        console.error("Error cargando dojos:", err)
        setDojos([])
      } finally {
        setLoadingDojos(false)
      }
    }

    fetchDojos()
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#1a1a1a]">
      {/* Header */}
      <header className="bg-[#1a1a1a] text-white py-5 shadow-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl tracking-[0.3em] font-light uppercase">
              DOJO <span className="text-[#c41e3a]">PORTAL</span>
            </h1>

            {/* Navegación principal */}
            <nav className="hidden lg:flex gap-4 text-sm tracking-wide uppercase">
              <button onClick={() => scrollToRef(null)} className="px-3 py-2 hover:text-[#c41e3a] transition-colors">Institucional</button>
              <button onClick={() => scrollToRef(newsRef)} className="px-3 py-2 hover:text-[#c41e3a] transition-colors">Noticias</button>
              <button onClick={() => scrollToRef(tournamentsRef)} className="px-3 py-2 hover:text-[#c41e3a] transition-colors">Torneos y estadísticas</button>
              <button onClick={() => scrollToRef(dojosRef)} className="px-3 py-2 hover:text-[#c41e3a] transition-colors">Dojos</button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/verify")}
              className="flex items-center gap-2 px-5 py-2 bg-[#c41e3a] text-white hover:bg-[#a01830] transition-colors tracking-wide uppercase text-sm"
            >
              <Award className="w-4 h-4" />
              Verificar Certificado
            </button>

            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-5 py-2 border-2 border-white text-white hover:bg-white hover:text-[#1a1a1a] transition-colors tracking-wide uppercase text-sm"
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Carrusel */}
      <section
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative h-[520px]">
          {slides.map((s, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
              aria-hidden={i !== current}
            >
              <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/45 flex items-center">
                <div className="container mx-auto px-6">
                  <div className="max-w-2xl text-white">
                    <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-3">{s.title}</h2>
                    <p className="text-lg opacity-90">{s.subtitle}</p>
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => scrollToRef(newsRef)}
                        className="px-5 py-2 bg-white text-[#1a1a1a] tracking-wide uppercase text-sm"
                      >
                        Ver noticias
                      </button>
                      <button
                        onClick={() => navigate("/institucional")}
                        className="px-5 py-2 border border-white text-white tracking-wide uppercase text-sm hover:bg-white hover:text-[#1a1a1a] transition-colors"
                      >
                        Más información
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-3 h-3 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Noticias */}
      <section ref={newsRef} className="container mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-8 h-8 text-[#c41e3a]" />
          <h2 className="text-xl tracking-wide uppercase text-[#1a1a1a]">Noticias Recientes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item) => (
            <article key={item.id} className="bg-white shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="text-sm text-gray-500 mb-2">{item.date}</div>
              <h3 className="text-[#1a1a1a] font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-700">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Torneos y puntajes de dojos */}
      <section ref={tournamentsRef} className="container mx-auto px-6 mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-[#c41e3a]" />
            <h2 className="text-xl tracking-wide uppercase text-[#1a1a1a]">Torneos y Puntajes</h2>
          </div>
          <div className="text-sm text-gray-600">Actualizado: 30/12/2025</div>
        </div>

        <div className="bg-white shadow-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#1a1a1a] text-white uppercase tracking-wide text-sm">
              <tr>
                <th className="px-6 py-4 text-left">Torneo</th>
                <th className="px-6 py-4 text-left">Dojo</th>
                <th className="px-6 py-4 text-left">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t) => (
                <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">{t.name}</td>
                  <td className="px-6 py-4">{t.dojo}</td>
                  <td className="px-6 py-4 text-[#c41e3a] font-semibold">{t.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Rankings / Estadísticas */}
      <section ref={statsRef} className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ranking de Dojos */}
        <div className="bg-white shadow-lg border border-gray-200">
          <div className="bg-[#c41e3a] text-white px-6 py-4 grid grid-cols-4 uppercase tracking-wide text-sm">
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
                  <span className="text-gray-500">#{d.rank}</span>
                )}
                <span className="font-medium">{d.name}</span>
              </div>
              <div className="text-center text-[#c41e3a] font-semibold">{d.points}</div>
              <div className="text-center">{d.students}</div>
            </div>
          ))}
        </div>

        {/* Ranking de Alumnos */}
        <div className="bg-white shadow-lg border border-gray-200">
          <div className="bg-[#c41e3a] text-white px-6 py-4 grid grid-cols-3 uppercase tracking-wide text-sm">
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
                  <div className="text-[#1a1a1a] font-medium">{s.name}</div>
                  <div className="text-sm text-gray-500">{s.dojo}</div>
                </div>
              </div>

              <div className="flex justify-center">
                <span className={`px-3 py-1 text-sm rounded ${getBeltColor(s.belt)}`}>
                  {s.belt.replace("Cinturón ", "")}
                </span>
              </div>

              <div className="text-center text-[#c41e3a] font-semibold">{s.points}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Dojos (listado real) */}
      <section ref={dojosRef} className="container mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl tracking-wide uppercase text-[#1a1a1a]">Dojos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingDojos ? (
            <div className="col-span-full text-gray-500">Cargando dojos…</div>
          ) : dojos.length === 0 ? (
            <div className="col-span-full text-gray-500">No se encontraron dojos activos.</div>
          ) : (
            dojos.map(d => (
              <div key={d.id} className="bg-white shadow-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-[#1a1a1a]">{d.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Sensei a cargo: <span className="text-[#1a1a1a] font-semibold">{d.senseiInCharge}</span></p>
                    <p className="text-sm text-gray-500 mt-1">Teléfono: <span className="text-[#1a1a1a] font-semibold">{d.phone || "—"}</span></p>
                  </div>
                  <div className="text-right">
                    <button
                      className="px-4 py-2 bg-[#c41e3a] text-white tracking-wide uppercase text-xs"
                    >
                      Ver
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-8 mt-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white mb-4 uppercase tracking-wide">Dojo Portal</h3>
              <p className="text-gray-400">
                Sistema integral de gestión para dojos de karate en Argentina.
              </p>
            </div>
            <div>
              <h4 className="text-white mb-4 uppercase tracking-wide">Contacto</h4>
              <p className="text-gray-400">info@dojoportal.com</p>
              <p className="text-gray-400">+54 11 1234-5678</p>
            </div>
            <div>
              <h4 className="text-white mb-4 uppercase tracking-wide">Certificación Blockchain</h4>
              <p className="text-gray-400">
                Todos los certificados están verificados mediante tecnología
                blockchain para garantizar su autenticidad.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Dojo Portal. Proyecto de Seminario Integrador.</p>
            <p className="mt-2">Desarrollado por Pieroni M. Belén y Balduzzi Ivo</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
