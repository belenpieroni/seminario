import { useState, useEffect } from "react"
import { supabase } from "../../supabaseClient"
import { Combobox } from "@headlessui/react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { getDojos } from "../../queries/dojoQueries"
import { BackButton } from "../common/BackButton"

export default function CreateExamForm({ senseiId, dojoId, onExamCreated, onBack }) {
    const [examDate, setExamDate] = useState("")
    const [locationDojo, setLocationDojo] = useState(null)
    const [observations, setObservations] = useState("")
    const [dojos, setDojos] = useState([])
    const [dojo, setDojoId] = useState("")
    const [sensei, setSenseiId] = useState("")
    const [query, setQuery] = useState("") 
    const [loading, setLoading] = useState(false)
    

    useEffect(() => {
    const fetchDojos = async () => {
        setLoading(true)

        // Obtener usuario logueado
        const { data: userData } = await supabase.auth.getUser()
        const user = userData?.user
        if (!user) {
        setLoading(false)
        return
        }

        // Obtener dojo_id del sensei logueado
        const { data: sensei } = await supabase
        .from("sensei")
        .select("id, dojo_id")  
        .eq("user_id", user.id)
        .single()

        if (!sensei?.dojo_id || !sensei?.id) {
        setLoading(false)
        return
        }

        setSenseiId(sensei.id)     
        setDojoId(sensei.dojo_id) 


        const dojoIdStr = String(sensei.dojo_id)

        const activeDojos = await getDojos()

        const sorted = [
        ...activeDojos.filter(d => d.id === dojoIdStr),
        ...activeDojos.filter(d => d.id !== dojoIdStr),
        ]

        setDojos(sorted)

        const myDojo = sorted.find(d => d.id === dojoIdStr)
        setLocationDojo(myDojo || null)

        setLoading(false)
    }

    fetchDojos()
    }, [])

    const filteredDojos =
        query === ""
        ? dojos
        : dojos.filter(d =>
            d.name.toLowerCase().includes(query.toLowerCase())
            )

    const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
        sensei_id: sensei,                
        dojo_id: dojo,                    
        location_dojo_id: locationDojo?.id, 
        exam_date: examDate,                
        observations,
    }

    console.log("Payload examen:", payload)

    const { data, error } = await supabase
        .from("exam")
        .insert([payload])
        .select()
        .single()

    if (error) {
        console.error("Error creando examen:", error.message, error.details)
    } else {
        if (onExamCreated) onExamCreated(data)
    }

    setLoading(false)
    }

    return (
    <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6 bg-white shadow-lg border border-gray-200"
    >
        <BackButton onBack={onBack} />

        {/* Fecha del examen */}
        <div>
        <label className="block mb-2 text-sm uppercase tracking-wide text-gray-600">
            Fecha del examen
        </label>
        <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
            required
        />
        </div>

        {/* Dojo */}
        <div className="relative">
        <label className="block mb-2 text-sm uppercase tracking-wide text-gray-600">
            Dojo
        </label>
        <Combobox value={locationDojo} onChange={setLocationDojo}>
        {({ open }) => (
            <div className="relative">
            <Combobox.Input
                className="w-full px-4 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none"
                displayValue={(dojo) => dojo?.name || ""}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar dojo..."
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
                    {dojo.name} — Sensei: {dojo.senseiInCharge}
                </Combobox.Option>
                ))}
            </Combobox.Options>
            </div>
        )}
        </Combobox>
        </div>

        {/* Observaciones */}
        <div>
        <label className="block mb-2 text-sm uppercase tracking-wide text-gray-600">
            Observaciones
        </label>
        <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 focus:border-[#c41e3a] focus:outline-none min-h-[120px]"
        />
        </div>

        {/* Botón */}
        <div className="flex justify-end">
        <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#c41e3a] text-white uppercase text-xs tracking-wide hover:bg-[#a01830] transition-colors disabled:opacity-50"
        >
            {loading ? "Creando..." : "Crear Examen"}
        </button>
        </div>
    </form>
    )
 }
