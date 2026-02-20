export type ResearchQuestion = {
  id: string;
  projectId: string;
  position: number;
  question: string;
  rationale?: string | null;
  keywords?: string[] | null;
};

export type ResearchQuestionsPayload = {
  questions: Array<{
    position: number;
    question: string;
    rationale?: string;
    keywords?: string[];
  }>;
};

export function isResearchQuestionsPayload(value: unknown): value is ResearchQuestionsPayload {
  if (typeof value !== "object" || value === null) return false;
  const v = value as { questions?: unknown };
  if (!Array.isArray(v.questions)) return false;
  return v.questions.every((q) => {
    if (typeof q !== "object" || q === null) return false;
    const qq = q as { position?: unknown; question?: unknown };
    return typeof qq.position === "number" && typeof qq.question === "string";
  });
}
