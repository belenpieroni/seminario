import { useState } from "react"
import { Search, CheckCircle, XCircle, KeyRound } from "lucide-react"
import fondo from "../assets/fondo.jpg"

export function VerifyCertificate({ onBack }) {
  const [hash, setHash] = useState("")
  const [verificationResult, setVerificationResult] = useState(null)

  const handleVerify = e => {
    e.preventDefault()
    const isValid = hash.length > 10
    setVerificationResult(isValid ? "valid" : "invalid")
  }
  const closeModal = () => setVerificationResult(null)

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative w-full max-w-md px-4">
        <div className="backdrop-blur-md bg-white/80 shadow-2xl p-8">

          {/* VOLVER */}
          <button
            onClick={onBack}
            className="text-sm text-[#c41e3a] mb-6 hover:underline"
          >
            ← Volver
          </button>

          {/* TÍTULO */}
          <div className="text-center mb-10">
            <h1 className="text-2xl tracking-[0.3em] font-light text-[#1a1a1a]">
              VERIFICACIÓN
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              Validación pública de certificados
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">

            {/* HASH */}
            <div className="relative">
              <KeyRound className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

              <input
                id="hash"
                type="text"
                value={hash}
                onChange={e => {
                  setHash(e.target.value)
                  setVerificationResult(null)
                }}
                placeholder=" "
                required
                className="
                  peer w-full
                  bg-transparent
                  border-0 border-b-2 border-[#c41e3a]
                  pl-8 pb-2 pt-4
                  text-[#1a1a1a]
                  focus:outline-none
                  focus:border-[#a01830]
                "
              />

              <label
                htmlFor="hash"
                className="
                  absolute left-8
                  text-gray-500 
                  transition-all
                  peer-placeholder-shown:top-4
                  peer-placeholder-shown:text-sm
                  peer-focus:-top-1
                  peer-focus:text-xs
                  peer-focus:text-[#c41e3a]
                  -top-1 text-xs
                "
              >
                Código del certificado
              </label>
            </div>

            {/* BOTÓN */}
            <button
              type="submit"
              className="
                w-full flex items-center justify-center gap-2
                bg-[#c41e3a] text-white py-3
                hover:bg-[#a01830] transition-colors
              "
            >
              <Search className="w-5 h-5" />
              Verificar
            </button>
          </form>

          {/* RESULTADO */}
          {verificationResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                
                {/* OVERLAY */}
                <div
                className="absolute inset-0 bg-black/60"
                onClick={closeModal}
                />

                {/* MODAL */}
                <div className="relative w-full max-w-lg mx-4 backdrop-blur-md bg-white/90 shadow-2xl p-6 animate-fade-in">

                {/* CERRAR */}
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black"
                >
                    ✕
                </button>

                {verificationResult === "valid" ? (
                    <>
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <h2 className="text-lg font-medium text-green-800">
                        Certificado válido
                        </h2>
                    </div>

                    <div className="space-y-2 text-sm text-gray-700">
                        <p><strong>Alumno:</strong> Juan Pérez</p>
                        <p><strong>Disciplina:</strong> Karate</p>
                        <p><strong>Graduación:</strong> Cinturón Verde</p>
                        <p><strong>Fecha de emisión:</strong> 15/11/2025</p>
                        <p><strong>Dojo:</strong> Dojo Central</p>
                        <p><strong>Sensei:</strong> Carlos Gómez</p>
                        <p><strong>Asociación:</strong> Asociación Argentina de Karate</p>
                    </div>

                    <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                        Hash: 0xA94F3C9D…<br />
                        Verificado el {new Date().toLocaleDateString()}
                    </div>

                    <div className="mt-6 text-center text-green-700 font-semibold text-sm">
                        ✔ Verificado por la Asociación Argentina de Karate
                    </div>
                    </>
                ) : (
                    <>
                    <div className="flex items-center gap-3 mb-3">
                        <XCircle className="w-6 h-6 text-red-600" />
                        <h2 className="text-lg font-medium text-red-800">
                        Certificado inválido
                        </h2>
                    </div>

                    <p className="text-sm text-red-700">
                        El código ingresado no corresponde a ningún certificado registrado.
                    </p>
                    </>
                )}
                </div>
            </div>
            )}
        </div>

        {/* FOOTER */}
        <footer className="mt-10 text-center text-xs text-gray-300">
          © 2025 Asociación Argentina de Karate
        </footer>
      </div>
    </div>
  )
}
