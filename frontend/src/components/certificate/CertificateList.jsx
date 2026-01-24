import { useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"
import CertificateCard from "./CertificateCard"
import { getCertificatesByDojo, getAllValidatedCertificates, getValidatedCertificatesByDojo } from "../../queries/certificateQueries"
import { Combobox } from "@headlessui/react"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function CertificateList({ dojoId }) {
  const [certificates, setCertificates] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showGlobal, setShowGlobal] = useState(false)
  const [locationDojo, setLocationDojo] = useState(null)
  const [query, setQuery] = useState("")
  const [dojos, setDojos] = useState([])

  // cargar todos los dojos para el combobox
  useEffect(() => {
    const fetchDojos = async () => {
      const { data, error } = await supabase
        .from("dojo")
        .select("id, name, head_sensei:head_sensei_id(full_name)")
        .order("name")

      if (error) {
        console.error("Error cargando dojos:", error)
      } else {
        setDojos(data || [])
      }
    }
    fetchDojos()
  }, [])

  // cargar certificados según vista
  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true)
      let data = []

      if (showGlobal) {
        if (locationDojo) {
          data = await getValidatedCertificatesByDojo(locationDojo.id)
        } else {
          data = await getAllValidatedCertificates()
        }
      } else {
        data = await getCertificatesByDojo(dojoId)
      }

      setCertificates(data || [])
      setLoading(false)
    }

    fetchCertificates()
  }, [showGlobal, locationDojo, dojoId])

  // filtro de búsqueda por alumno, fecha o grado
  const filtered = certificates.filter((cert) => {
    const studentName = cert.student?.full_name?.toLowerCase() || ""
    const examDate = new Date(cert.exam?.exam_date).toLocaleDateString("es-AR")
    const belt = cert.belt?.toLowerCase() || ""

    return (
      studentName.includes(search.toLowerCase()) ||
      examDate.includes(search) ||
      belt.includes(search.toLowerCase())
    )
  })

  const filteredDojos = dojos.filter((dojo) =>
    dojo.name.toLowerCase().includes(query.toLowerCase())
  )

  const handleDownload = async (pdfUrl) => {
    try {
      const { data, error } = await supabase.storage
        .from("certificados")
        .download(pdfUrl)

      if (error) throw error

      const blobUrl = URL.createObjectURL(data)
      window.open(blobUrl, "_blank")
    } catch (err) {
      console.error("Error descargando certificado:", err)
      alert("No se pudo descargar el certificado.")
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 border-b border-gray-300 pb-4">
        <h2 className="text-2xl font-light uppercase tracking-wide text-[#1a1a1a]">
          Certificados
        </h2>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setShowGlobal(!showGlobal)}
          className="flex items-center gap-2 bg-[#c41e3a] text-white px-4 py-2 uppercase text-xs tracking-wide hover:bg-[#a01830] transition-colors"
        >
          {showGlobal ? "Ver solo mi dojo" : "Vista global"}
        </button>

        {showGlobal && (
          <div className="relative w-64">
            <Combobox value={locationDojo} onChange={setLocationDojo}>
            {({ open }) => (
                <div className="relative w-64">
                <Combobox.Input
                    className="w-full px-4 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
                    displayValue={(dojo) => dojo?.name || ""}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por dojo..."
                />

                {/* Botón con flecha */}
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    {open ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                </Combobox.Button>

                <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 shadow-lg max-h-60 overflow-auto">
                    {filteredDojos.length === 0 && (
                    <div className="p-3 text-gray-500 italic">No hay resultados</div>
                    )}
                    {filteredDojos.map((dojo) => (
                    <Combobox.Option
                        key={dojo.id}
                        value={dojo}
                        className={({ active }) =>
                        `cursor-pointer px-4 py-2 ${
                            active ? "bg-[#c41e3a] text-white" : "text-[#1a1a1a]"
                        }`
                        }
                    >
                        {dojo.name} — Sensei: {dojo.head_sensei?.full_name}
                    </Combobox.Option>
                    ))}
                </Combobox.Options>
                </div>
            )}
            </Combobox>
          </div>
        )}
      </div>

      <input
        type="text"
        placeholder="Buscar por alumno, fecha o grado..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded px-4 py-2 mb-6"
      />

      {loading ? (
        <p className="text-gray-600">Cargando certificados...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-600 italic">
          {showGlobal
            ? "No se encontraron certificados validados."
            : "Todavía no hay certificados de tus alumnos."}
        </p>
      ) : (
        filtered.map((cert) => (
          <CertificateCard
            key={cert.id}
            certificate={cert}
            onDownload={handleDownload}
            mode="no-admin"
          />
        ))
      )}
    </div>
  )
}
