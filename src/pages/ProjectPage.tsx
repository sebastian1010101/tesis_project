import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { supabaseClient } from "../services/supabaseClient";
import type { Project } from "../hooks/useProjects";
import { useQuestions } from "../hooks/useQuestions";
import { useGenerateQuestions } from "../hooks/useGenerateQuestions";

export default function ProjectPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {
    questions,
    loading: questionsLoading,
    error: questionsError,
    createQuestion,
    refresh: refreshQuestions,
  } = useQuestions(projectId ?? "");

  const [newQuestion, setNewQuestion] = useState("");
  const [creatingQuestion, setCreatingQuestion] = useState(false);

  const {
    status: generateStatus,
    error: generateError,
    generate,
  } = useGenerateQuestions(projectId ?? "");

  async function handleGenerateQuestions() {
    if (!projectId) return;
    if (!project?.topic) return;
    await generate({ topic: project.topic, numQuestions: 8, language: "es" });
    await refreshQuestions();
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!projectId) return;
      setLoading(true);
      setError(null);

      const { data, error } = await supabaseClient
        .from("projects")
        .select("id,user_id,topic,title,status,created_at,updated_at")
        .eq("id", projectId)
        .single();

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setProject(null);
        setLoading(false);
        return;
      }

      setProject(data as Project);
      setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setCreatingQuestion(true);
    try {
      await createQuestion({ question: newQuestion.trim() });
      setNewQuestion("");
    } finally {
      setCreatingQuestion(false);
    }
  }

  return (
    <div className="container">
      <div className="stack">
        <div className="stack" style={{ gap: 6 }}>
          <h1>Mi Proyecto</h1>
          <p>
            <span className="muted">projectId:</span> {projectId}
          </p>
        </div>

        {loading ? <p>Cargando proyecto...</p> : null}
        {error ? <p className="error">{error}</p> : null}

        {project ? (
          <Card>
            <div className="stack" style={{ gap: 6 }}>
              <p style={{ margin: 0 }}>
                <span className="muted">Tema:</span> {project.topic}
              </p>
              {project.title ? (
                <p style={{ margin: 0 }}>
                  <span className="muted">Título:</span> {project.title}
                </p>
              ) : null}
            </div>
          </Card>
        ) : null}

        <p>Aquí vive el flujo: tema → generar preguntas → investigas.</p>

        <Card>
          <div className="stack">
            <h2>Preguntas de investigación</h2>

            <div className="row">
              <Button
                type="button"
                onClick={handleGenerateQuestions}
                disabled={
                  generateStatus === "loading" || !project || !project.topic
                }
              >
                {generateStatus === "loading"
                  ? "Generando..."
                  : "Generar con IA"}
              </Button>
              {generateError ? <p className="error">{generateError}</p> : null}
            </div>

            <form className="row" onSubmit={handleCreateQuestion}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <Input
                  placeholder="Escribe una pregunta..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                disabled={creatingQuestion || !newQuestion.trim()}
              >
                {creatingQuestion ? "Agregando..." : "Agregar"}
              </Button>
            </form>

            {questionsError ? <p className="error">{questionsError}</p> : null}
            {questionsLoading ? <p>Cargando preguntas...</p> : null}

            {!questionsLoading ? (
              questions.length === 0 ? (
                <p>Aún no hay preguntas.</p>
              ) : (
                <ol style={{ margin: 0, paddingLeft: 18 }}>
                  {questions.map((q) => (
                    <li key={q.id} style={{ marginTop: 10 }}>
                      <div>{q.question}</div>
                    </li>
                  ))}
                </ol>
              )
            ) : null}
          </div>
        </Card>

        <div className="row">
          <Link className="ui-btn ui-btn--secondary" to="/dashboard">
            Volver a Dashboard
          </Link>
          <Link className="ui-btn ui-btn--ghost" to="/">
            Landing
          </Link>
        </div>
      </div>
    </div>
  );
}
