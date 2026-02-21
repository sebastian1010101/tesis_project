import { Link } from "react-router-dom";

import Card from "../components/ui/Card";

export default function LandingPage() {
  return (
    <div className="container">
      <Card>
        <div className="stack">
          <h1>Tesis.ai</h1>
          <p>
            Estructura tu tesis: define un tema, genera preguntas de
            investigación y desarrolla tus respuestas.
          </p>

          <div className="row">
            <Link className="ui-btn ui-btn--primary" to="/login">
              Login
            </Link>
            <Link className="ui-btn ui-btn--secondary" to="/dashboard">
              Dashboard
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
