import { DojoInfo } from "../components/DojoInfo";
import { Notifications } from "../components/Notifications";
import { Certificados } from "../components/Certificados";
import { Header } from "../components/Header";

const alumno = {
  nombre: "Cosme",
  apellido: "Fulanito",
  cinturon: "Cinturón Verde",
  inscripcion: "Febrero 2022",
};

export default function DashboardAlumno() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f8f8" }}>
      <Header nombre={alumno.nombre} apellido={alumno.apellido} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2 lg:col-span-2">
            <DojoInfo />
          </div>

          <div className="p-6 border rounded-lg bg-white" style={{ borderColor: '#e5e5e5' }}>
            <div className="space-y-4">
              <h2 className="tracking-wide leading-relaxed" style={{ color: '#111111' }}>
                Perfil de Alumno
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="leading-relaxed" style={{ color: '#666666', fontSize: '0.875rem' }}>
                    Cinturón Actual
                  </p>
                  <p className="mt-1 tracking-wide leading-relaxed" style={{ color: '#c41e3a' }}>
                    {alumno.cinturon}
                  </p>
                </div>
                <div>
                  <p className="leading-relaxed" style={{ color: '#666666', fontSize: '0.875rem' }}>
                    Inscripción
                  </p>
                  <p className="mt-1 leading-relaxed" style={{ color: '#111111' }}>
                    {alumno.inscripcion}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-2">
            <Notifications />
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <Certificados />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t" style={{ borderColor: '#e5e5e5' }}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="tracking-wide leading-relaxed" style={{ color: '#666666', fontSize: '0.875rem' }}>
            © Secure Dojo Portal
          </p>
        </div>
      </footer>
    </div>
  );
}
