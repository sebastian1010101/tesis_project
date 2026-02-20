import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>Tesis Assistant (MVP)</h1>
      <p style={{ marginTop: 8 }}>
        Estructura tu tesis: define un tema, genera preguntas de investigación y
        desarrolla respuestas.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <Link to="/login">Ir a Login</Link>
        <Link to="/dashboard">Ir a Dashboard</Link>
        <Link to="/projects/demo">Ir a Proyecto (demo)</Link>
      </div>
    </div>
  );
}
