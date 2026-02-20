import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
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
    } catch (error: any) {
      setError(error?.message ?? "No se pudo iniciar sesión");
    }
  }
  if (loading) {
    return <p>Cargando...</p>;
  }
  if (user) {
    return (
      <div>
        <h2>Bienvenido{user.email}</h2>
        <button onClick={signOut}>Cerrar sesion</button>
        <div style={{ marginTop: 12 }}>
          <Link to="/dashboard">Ir a Dashboard</Link>
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>{mode === "login" ? "Login" : "Registro"}</h1>
      <p style={{ marginTop: 8 }}>
        Autenticación con Supabase (pendiente en Paso 2).
      </p>
      {error ? <p style={{ marginTop: 8, color: "crimson" }}>{error}</p> : null}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">
          {mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>

      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setMode((m) => (m === "login" ? "register" : "login"));
          }}
        >
          {mode === "login" ? "No tengo cuenta" : "Ya tengo cuenta"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <Link to="/">Volver</Link>
        <Link to="/dashboard">Ir a Dashboard</Link>
      </div>
    </div>
  );
}
