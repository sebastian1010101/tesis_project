import { Link, useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingProject, setDeletingProject] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [topicDraft, setTopicDraft] = useState("");
  const [updatingProject, setUpdatingProject] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

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

  async function handleUpdateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId) return;

    const nextTopic = topicDraft.trim();

    if (!nextTopic) {
      setUpdateError("El tema es requerido.");
      return;
    }

    setUpdatingProject(true);
    setUpdateError(null);
    try {
      const { data, error } = await supabaseClient
        .from("projects")
        .update({
          topic: nextTopic,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId)
        .select("id,user_id,topic,title,status,created_at,updated_at")
        .single();

      if (error) throw error;

      setProject(data as Project);
      setTopicDraft((data as Project).topic ?? "");
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo actualizar.";
      setUpdateError(message);
    } finally {
      setUpdatingProject(false);
    }
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
      setTopicDraft((data as Project).topic ?? "");
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

  async function handleDeleteProject() {
    if (!projectId) return;

    const ok = window.confirm(
      "¿Seguro que quieres eliminar este proyecto? Esta acción no se puede deshacer.",
    );
    if (!ok) return;

    setDeletingProject(true);
    setDeleteError(null);
    try {
      const { error: questionsDeleteError } = await supabaseClient
        .from("research_questions")
        .delete()
        .eq("project_id", projectId);

      if (questionsDeleteError) throw questionsDeleteError;

      const { error: projectDeleteError } = await supabaseClient
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (projectDeleteError) throw projectDeleteError;

      navigate("/dashboard");
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo eliminar.";
      setDeleteError(message);
    } finally {
      setDeletingProject(false);
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
            <div className="stack">
              <div className="stack" style={{ gap: 6 }}>
                <p
                  style={{
                    margin: 0,
                    textAlign: "center",
                    textTransform: "uppercase",
                  }}
                >
                  <span className="muted stack"></span> {project.topic}
                </p>
                {project.title ? (
                  <p style={{ margin: 0 }}>
                    <span className="muted">Título:</span> {project.title}
                  </p>
                ) : null}
              </div>

              <hr />

              <form className="stack" onSubmit={handleUpdateProject}>
                <div className="stack" style={{ gap: 6 }}>
                  <p style={{ margin: 0 }}>Tema</p>
                  <Input
                    placeholder="Tema del proyecto"
                    value={topicDraft}
                    onChange={(e) => setTopicDraft(e.target.value)}
                  />
                </div>

                <div className="row">
                  <Button
                    type="submit"
                    variant="success"
                    disabled={
                      updatingProject ||
                      !projectId ||
                      !topicDraft.trim() ||
                      project.topic === topicDraft.trim()
                    }
                  >
                    {updatingProject ? "Actualizando..." : "Actualizar"}
                  </Button>
                  {updateError ? <p className="error">{updateError}</p> : null}
                </div>
              </form>
            </div>
          </Card>
        ) : null}

        <p style={{ textAlign: "center" }}>
          Describe tu tema → Genera preguntas → Investigas.
        </p>

        <Card>
          <div className="stack">
            <h2 style={{ textAlign: "center" }}>Preguntas de investigación</h2>

            <div className="row" style={{ justifyContent: "center" }}>
              <Button
                type="button"
                onClick={handleGenerateQuestions}
                disabled={
                  generateStatus === "loading" || !project || !project.topic
                }
              >
                {generateStatus === "loading"
                  ? "Generando..."
                  : "Generar preguntas con IA"}
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
                <ol
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {questions.map((q) => (
                    <li key={q.id} style={{ marginTop: 0 }}>
                      <div
                        style={{
                          position: "relative",
                          padding: "12px 14px",
                          borderRadius: 18,
                          border: "1px solid rgba(0,0,0,0.08)",
                          background: "rgba(99,102,241,0.10)",
                          boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                          lineHeight: 1.45,
                          maxWidth: "92%",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 14,
                            bottom: -6,
                            width: 12,
                            height: 12,
                            background: "rgba(99,102,241,0.10)",
                            borderLeft: "1px solid rgba(0,0,0,0.08)",
                            borderBottom: "1px solid rgba(0,0,0,0.08)",
                            transform: "rotate(45deg)",
                          }}
                        />
                        {q.question}
                      </div>
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
          <Button
            type="button"
            variant="danger"
            onClick={handleDeleteProject}
            disabled={deletingProject || !projectId}
          >
            {deletingProject ? "Eliminando..." : "Remover proyecto"}
          </Button>
        </div>

        {deleteError ? <p className="error">{deleteError}</p> : null}
      </div>
    </div>
  );
}
