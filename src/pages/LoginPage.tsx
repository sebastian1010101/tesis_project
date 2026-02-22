import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
export default function LoginPage() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from
    ?.pathname;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      navigate(from ?? "/dashboard", { replace: true });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "No se pudo iniciar sesión";
      setError(message);
    }
  }
  if (loading) {
    return <p className="container">Cargando...</p>;
  }
  if (user) {
    return (
      <div className="container">
        <Card>
          <div className="stack">
            <h2>Bienvenido {user.email}! ya estas logeado</h2>
            <div className="row">
              <Button type="button" variant="danger" onClick={signOut}>
                Cerrar sesion
              </Button>
              <Link className="ui-btn ui-btn--primary" to="/dashboard">
                Ir a Dashboard
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  return (
    <div className="container">
      <Card>
        <div className="stack">
          <h1>{mode === "login" ? "Login" : "Registro"}</h1>
          {error ? <p className="error">{error}</p> : null}

          <form className="stack" onSubmit={handleSubmit}>
            <div className="stack" style={{ gap: 6 }}>
              <p style={{ margin: 0 }}>Email</p>
              <Input
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="stack" style={{ gap: 6 }}>
              <p style={{ margin: 0 }}>Contraseña</p>
              <Input
                placeholder="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="row">
              <Button type="submit">
                {mode === "login" ? "Entrar" : "Crear cuenta"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setError(null);
                  setMode((m) => (m === "login" ? "register" : "login"));
                }}
              >
                {mode === "login" ? "Registrate aqui" : "Iniciar sesion aqui"}
              </Button>
            </div>
          </form>

          <div className="row">
            <Link className="ui-btn ui-btn--ghost" to="/">
              Volver
            </Link>
            <Link className="ui-btn ui-btn--secondary" to="/dashboard">
              Ir a Dashboard
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
