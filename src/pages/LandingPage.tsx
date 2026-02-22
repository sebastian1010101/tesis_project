import { Link } from "react-router-dom";

import Card from "../components/ui/Card";

export default function LandingPage() {
  return (
    <div className="container">
      <Card>
        <div className="stack stack--center">
          <h1>TesisFlow</h1>
          <p>
            Estructura tu tesis {">"} define un tema {">"} genera preguntas de
            investigación {">"} desarrolla tus respuestas.
          </p>

          <div className="row row--center">
            <Link className="ui-btn ui-btn--primary" to="/login">
              Login
            </Link>
            <Link className="ui-btn ui-btn--primary" to="/dashboard">
              Dashboard
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
