import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Checkbox } from "../components/Checkbox";
import { ImageWithFallback } from "../components/ImageWithFallback";

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulación temporal de login sin backend
    // REEMPLAZAR ESTO CON LA LLAMADA AL BACKEND
    if (usuario === "mail@sensei.com" && contraseña === "1234") {
      navigate("/sensei");
    } else if (usuario === "mail@alumno.com" && contraseña === "1234") {
      navigate("/alumno");
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white text-black">
      {/* Lado izquierdo - Imagen con overlay zen */}
      <div className="w-full lg:w-1/2 relative">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1609850280339-b85f1fd5d351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHplbiUyMG1pbmltYWx8ZW58MXx8fHwxNzYwMDYyOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Bushido Spirit"
          className="w-full h-64 lg:h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center text-white">
          {/* Círculo Enso */}
          <div className="relative mb-4">
            <svg
              className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 opacity-90"
              viewBox="0 0 120 120"
              fill="none"
            >
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#c41e3a"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="2 4"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base sm:text-2xl md:text-4xl font-light tracking-widest">
                道
              </span>
            </div>
          </div>

          <h1 className="text-base sm:text-2xl md:text-3xl lg:text-5xl font-light tracking-[0.1em] mb-2 sm:mb-3 md:mb-4">
            DOJO PORTAL
          </h1>
          <div className="w-12 sm:w-16 md:w-24 h-0.5 bg-red-700 mb-2 sm:mb-3 md:mb-4"></div>
          <p className="text-[9px] sm:text-xs md:text-sm lg:text-base text-white/90 tracking-wider font-light">
            武道の精神
          </p>
          <p className="text-[7px] sm:text-[9px] md:text-xs lg:text-sm text-white/70 tracking-widest mt-1">
            BUSHIDO SPIRIT
          </p>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Form container */}
        <div className="w-full max-w-md relative z-10">
          {/* Card */}
          <div className="bg-white/95 backdrop-blur-md border border-gray-300 shadow-xl rounded-lg p-6">
            <div className="w-8 sm:w-8 md:w-10 h-0.5 bg-red-700 mb-2 sm:mb-3 md:mb-4 mx-auto"></div>
            <h2 className="font-sans text-center tracking-widest text-muted-foreground text-gray-500 mb-10">
                LOGIN
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Usuario */}
              <div>
                <label htmlFor="usuario" className="block mb-1 font-medium text-gray-700 tracking-wide">
                  Usuario
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="usuario"
                    type="text"
                    placeholder="Email o nombre de usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {/* Contraseña con ojo */}
              <div>
                <label htmlFor="contraseña" className="block mb-1 font-medium text-gray-700 tracking-wide">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="contraseña"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Recuérdame */}
              <div className="flex items-center space-x-2 mb-6">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember" className="text-gray-500 select-none cursor-pointer tracking-wide">
                  Recuérdame
                </label>
              </div>

              {/* Botón */}
              <Button type="submit" className="w-full h-12">INGRESAR</Button>
            </form>
          </div>

          {/* Contraseña olvidada */}
          <div className="mt-8 text-center">
            <button
              type="button"
              className="text-red-700 hover:underline tracking-wide text-sm"
              onClick={() => console.log("Recuperar contraseña")}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
