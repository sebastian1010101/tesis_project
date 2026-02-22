import { useCallback, useEffect, useMemo, useState } from "react";

import { supabaseClient } from "../services/supabaseClient";

export type QuestionAnswerRow = {
  id: string;
  question_id: string;
  user_id: string;
  answer: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export function useAnswers(projectId: string) {
  const [answers, setAnswers] = useState<QuestionAnswerRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const answersByQuestionId = useMemo(() => {
    const map: Record<string, QuestionAnswerRow> = {};
    for (const a of answers) map[a.question_id] = a;
    return map;
  }, [answers]);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    const { data: questions, error: questionsError } = await supabaseClient
      .from("research_questions")
      .select("id")
      .eq("project_id", projectId);

    if (questionsError) {
      setError(questionsError.message);
      setAnswers([]);
      setLoading(false);
      return;
    }

    const questionIds = (questions ?? []).map((q) => q.id as string);
    if (questionIds.length === 0) {
      setAnswers([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabaseClient
      .from("question_answers")
      .select("id,question_id,user_id,answer,status,created_at,updated_at")
      .in("question_id", questionIds);

    if (error) {
      setError(error.message);
      setAnswers([]);
      setLoading(false);
      return;
    }

    setAnswers((data ?? []) as QuestionAnswerRow[]);
    setLoading(false);
  }, [projectId]);

  const upsertAnswer = useCallback(
    async (input: { questionId: string; answer: string }) => {
      setError(null);
      const { data, error } = await supabaseClient
        .from("question_answers")
        .upsert(
          {
            question_id: input.questionId,
            answer: input.answer,
            status: "saved",
          },
          { onConflict: "question_id,user_id" },
        )
        .select("id,question_id,user_id,answer,status,created_at,updated_at")
        .single();

      if (error) {
        setError(error.message);
        throw error;
      }

      const updated = data as QuestionAnswerRow;
      setAnswers((prev) => {
        const without = prev.filter(
          (a) => a.question_id !== updated.question_id,
        );
        return [...without, updated];
      });
      return updated;
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      await refresh();
    })();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return {
    answers,
    answersByQuestionId,
    loading,
    error,
    refresh,
    upsertAnswer,
  };
}
