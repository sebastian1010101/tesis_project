import { useCallback, useEffect, useState } from "react";

import { supabaseClient } from "../services/supabaseClient";

export type ResearchQuestionRow = {
  id: string;
  project_id: string;
  position: number;
  question: string;
  rationale: string | null;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
};

export function useQuestions(projectId: string) {
  const [questions, setQuestions] = useState<ResearchQuestionRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabaseClient
      .from("research_questions")
      .select(
        "id,project_id,position,question,rationale,status,source,created_at,updated_at",
      )
      .eq("project_id", projectId)
      .order("position", { ascending: true });

    if (error) {
      setError(error.message);
      setQuestions([]);
      setLoading(false);
      return;
    }

    setQuestions((data ?? []) as ResearchQuestionRow[]);
    setLoading(false);
  }, [projectId]);

  const createQuestion = useCallback(
    async (input: {
      question: string;
      rationale?: string;
      position?: number;
    }) => {
      if (!projectId) throw new Error("projectId requerido");
      setError(null);

      const nextPosition =
        typeof input.position === "number"
          ? input.position
          : (questions[questions.length - 1]?.position ?? 0) + 1;

      const { data, error } = await supabaseClient
        .from("research_questions")
        .insert({
          project_id: projectId,
          position: nextPosition,
          question: input.question,
          rationale: input.rationale ?? null,
          source: "user",
        })
        .select(
          "id,project_id,position,question,rationale,status,source,created_at,updated_at",
        )
        .single();

      if (error) {
        setError(error.message);
        throw error;
      }

      const created = data as ResearchQuestionRow;
      setQuestions((prev) =>
        [...prev, created].sort((a, b) => a.position - b.position),
      );
      return created;
    },
    [projectId, questions],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    questions,
    loading,
    error,
    refresh,
    createQuestion,
  };
}
