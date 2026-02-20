import { Link } from "react-router-dom";
import { useState } from "react";

import { useProjects } from "../hooks/useProjects";

export default function DashboardPage() {
  const { projects, loading, error, createProject } = useProjects();
  const [topic, setTopic] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setCreating(true);
    try {
      await createProject({ topic: topic.trim() });
      setTopic("");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>Dashboard</h1>
      <p style={{ marginTop: 8 }}>Tus proyectos</p>

      <form
        onSubmit={handleCreate}
        style={{ display: "flex", gap: 8, marginTop: 12 }}
      >
        <input
          placeholder="Tema de tesis (ej: Impacto de IA en educación superior)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={creating || !topic.trim()}>
          {creating ? "Creando..." : "Crear"}
        </button>
      </form>

      {error ? (
        <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>
      ) : null}

      {loading ? (
        <p style={{ marginTop: 12 }}>Cargando proyectos...</p>
      ) : (
        <div style={{ marginTop: 16 }}>
          {projects.length === 0 ? (
            <p>No tienes proyectos todavía.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {projects.map((p) => (
                <li key={p.id}>
                  <Link to={`/projects/${p.id}`}>{p.title ?? p.topic}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <Link to="/">Landing</Link>
      </div>
    </div>
  );
}
