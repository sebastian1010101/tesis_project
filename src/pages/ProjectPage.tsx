import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { supabaseClient } from "../services/supabaseClient";
import type { Project } from "../hooks/useProjects";
import { useQuestions } from "../hooks/useQuestions";
import { useAnswers } from "../hooks/useAnswers";
import AnswerEditor from "../components/thesis/AnswerEditor";
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

  const {
    answersByQuestionId,
    loading: answersLoading,
    error: answersError,
    upsertAnswer,
  } = useAnswers(projectId ?? "");

  const [newQuestion, setNewQuestion] = useState("");
  const [creatingQuestion, setCreatingQuestion] = useState(false);

  const {
    status: generateStatus,
    error: generateError,
    generate,
  } = useGenerateQuestions(projectId ?? "");

  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [savingAnswerIds, setSavingAnswerIds] = useState<
    Record<string, boolean>
  >({});

  async function handleSaveAnswer(questionId: string) {
    const current =
      draftAnswers[questionId] ?? answersByQuestionId[questionId]?.answer ?? "";
    setSavingAnswerIds((prev) => ({ ...prev, [questionId]: true }));
    try {
      await upsertAnswer({ questionId, answer: current });
    } finally {
      setSavingAnswerIds((prev) => ({ ...prev, [questionId]: false }));
    }
  }

  async function handleGenerateQuestions() {
    if (!projectId) return;
    if (!project?.topic) return;
    await generate({ topic: project.topic, numQuestions: 8, language: "es" });
    await refreshQuestions();

    setDraftAnswers({});
    setSavingAnswerIds({});
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
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>Proyecto</h1>
      <p style={{ marginTop: 8 }}>
        <strong>projectId:</strong> {projectId}
      </p>

      {loading ? <p>Cargando proyecto...</p> : null}
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      {project ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ margin: 0 }}>
            <strong>Tema:</strong> {project.topic}
          </p>
          {project.title ? (
            <p style={{ marginTop: 8 }}>
              <strong>Título:</strong> {project.title}
            </p>
          ) : null}
        </div>
      ) : null}

      <p style={{ marginTop: 8 }}>
        Aquí vive el flujo: tema → generar preguntas → responder.
      </p>

      <div style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0 }}>Preguntas de investigación</h2>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            type="button"
            onClick={handleGenerateQuestions}
            disabled={
              generateStatus === "loading" || !project || !project.topic
            }
          >
            {generateStatus === "loading" ? "Generando..." : "Generar con IA"}
          </button>
          {generateError ? (
            <p style={{ color: "crimson", margin: 0 }}>{generateError}</p>
          ) : null}
        </div>

        <form
          onSubmit={handleCreateQuestion}
          style={{ display: "flex", gap: 8, marginTop: 12 }}
        >
          <input
            placeholder="Escribe una pregunta..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            disabled={creatingQuestion || !newQuestion.trim()}
          >
            {creatingQuestion ? "Agregando..." : "Agregar"}
          </button>
        </form>

        {questionsError ? (
          <p style={{ color: "crimson" }}>{questionsError}</p>
        ) : null}
        {questionsLoading ? <p>Cargando preguntas...</p> : null}

        {!questionsLoading ? (
          questions.length === 0 ? (
            <p style={{ marginTop: 12 }}>Aún no hay preguntas.</p>
          ) : (
            <ol style={{ marginTop: 12 }}>
              {questions.map((q) => (
                <li key={q.id} style={{ marginTop: 12 }}>
                  <div>{q.question}</div>

                  <div style={{ marginTop: 8 }}>
                    {answersError ? (
                      <p style={{ color: "crimson" }}>{answersError}</p>
                    ) : null}
                    {answersLoading ? <p>Cargando respuesta...</p> : null}
                    <AnswerEditor
                      value={
                        draftAnswers[q.id] ??
                        answersByQuestionId[q.id]?.answer ??
                        ""
                      }
                      onChange={(value) =>
                        setDraftAnswers((prev) => ({ ...prev, [q.id]: value }))
                      }
                      onSave={() => handleSaveAnswer(q.id)}
                      saving={savingAnswerIds[q.id]}
                    />
                  </div>
                </li>
              ))}
            </ol>
          )
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <Link to="/dashboard">Volver a Dashboard</Link>
        <Link to="/">Landing</Link>
      </div>
    </div>
  );
}
