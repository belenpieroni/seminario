# Dojo Portal

## Funcionalidades por roles

Dojo Portal es una plataforma web que permite:

### Asociación Argentina de Karate
- Registrar y gestionar dojos asociados con su sensei a cargo.  
- Validar certificados de graduación (utilizando tecnología blockchain).  

### Senseis a cargo
- Registrar y gestionar senseis ayudantes en su dojo.  
- Registrar y gestionar alumnos en su dojo.  
- Registrar exámenes y resultados.  
- Enviar notificaciones a los integrantes de su dojo.  
- Ver los certificados validados por la Asociación.  

### Senseis ayudantes
- Ver alumnos del dojo.  
- Ver exámenes y resultados de los alumnos.  
- Enviar notificaciones a los integrantes de su dojo.  
- Ver los certificados validados por la Asociación.  

### Alumnos
- Ver su progreso.  
- Leer notificaciones.  
- Inscribirse a exámenes.  
- Ver sus certificados validados por la Asociación.  

---

## Contexto del proyecto

Este proyecto se desarrolla en el marco del **Seminario Integrador** de la carrera **Ingeniería en Sistemas de Información** en la **Universidad Tecnológica Nacional – Facultad Regional La Plata (UTN FRLP)**.  
Forma parte de los requisitos para la obtención del **título intermedio de Analista de Sistemas**.

- **Año de cursada:** 2025  
- **Finalización prevista:** Febrero 2026  
- **Profesores:** Sergio Antonini y Romina Istvan  

El trabajo integra los conocimientos obtenidos por la materia (y los tres años de carrera realizados), aplicados a un caso real de gestión de dojos.

## Objetivos Institucionales
- Automatización: Reducir el uso de papel y elevar el excel manual que tenía la Asociación.
- Innovación: Incorporar blockchain para garantizar que cada certificado emitido sea verificable y confiable. Incorporar tecnologías modernas para tener PDF dinámicos.

## Integrantes del grupo
- Balduzzi, Ivo
- Pieroni, María Belén

---

## Tecnologías principales

- **React 18** – Frontend
- **Supabase** – Base de datos, autenticación y almacenamiento
- **pdf-lib** – Generación de certificados PDF personalizados
- **Chart.js + react-chartjs-2** – Visualización de progreso del alumno
- **TailwindCSS** – Estilos
- **Lucide React** – Iconos
- **Blockchain** – Verificación pública y descentralizada de certificados

---

## Dependencias

```json
"dependencies": {
  "@supabase/supabase-js": "^2.88.0",
  "chart.js": "^4.5.1",
  "pdf-lib": "^1.17.1",
  "react": "^18.2.0",
  "react-chartjs-2": "^5.3.1",
  "react-dom": "^18.2.0",
  "react-router-dom": "^7.11.0",
  "lucide-react": "^0.545.0",
  "dayjs": "^1.11.19"
},
"devDependencies": {
  "tailwindcss": "3.4",
  "postcss": "^8.5.6",
  "autoprefixer": "^10.4.21"
}
```

