import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardSensei from "./pages/DashboardSensei";
import DashboardAlumno from "./pages/DashboardAlumno";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/sensei" element={<DashboardSensei />} />
        <Route path="/alumno" element={<DashboardAlumno />} />
      </Routes>
    </Router>
  );
}

export default App;
