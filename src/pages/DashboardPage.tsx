import { Link } from "react-router-dom";
import { useState } from "react";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
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
    <div className="container">
      <div className="stack">
        <div className="stack" style={{ gap: 6 }}>
          <h1>Dashboard</h1>
          <p>Tus proyectos</p>
        </div>

        <Card>
          <form className="row" onSubmit={handleCreate}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <Input
                placeholder="Tema de tesis (ej: Impacto de IA en educación superior)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={creating || !topic.trim()}>
              {creating ? "Creando..." : "Crear"}
            </Button>
          </form>
        </Card>

        {error ? <p className="error">{error}</p> : null}

        {loading ? (
          <p>Cargando proyectos...</p>
        ) : (
          <Card>
            {projects.length === 0 ? (
              <p>No tienes proyectos todavía.</p>
            ) : (
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {projects.map((p) => (
                  <li key={p.id} style={{ marginTop: 6 }}>
                    <Link to={`/projects/${p.id}`}>{p.title ?? p.topic}</Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        <div className="row">
          <Link className="ui-btn ui-btn--ghost" to="/">
            Landing
          </Link>
        </div>
      </div>
    </div>
  );
}
