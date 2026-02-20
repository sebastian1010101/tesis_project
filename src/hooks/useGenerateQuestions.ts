import { useCallback, useState } from "react";

import { supabaseClient } from "../services/supabaseClient";

type Status = "idle" | "loading" | "success" | "error";

export function useGenerateQuestions(projectId: string) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (input: {
      topic?: string;
      numQuestions?: number;
      language?: string;
      model?: string;
    }) => {
      if (!projectId) throw new Error("projectId requerido");
      setStatus("loading");
      setError(null);

      const model = input.model ?? "gpt-4o-mini";

      const { data, error } = await supabaseClient.functions.invoke(
        "generate-research-questions",
        {
          body: {
            projectId,
            ...input,
            model,
          },
        },
      );

      if (error) {
        const errAny = error as unknown as Record<string, unknown>;
        const ownProps = Object.getOwnPropertyNames(error as unknown as object);
        const serialized = (() => {
          try {
            return JSON.stringify(error, ownProps);
          } catch {
            try {
              return JSON.stringify(errAny);
            } catch {
              return "[unserializable error]";
            }
          }
        })();
        setStatus("error");
        setError(`${error.message} | raw: ${serialized}`);
        throw error;
      }

      setStatus("success");
      return data as unknown;
    },
    [projectId],
  );

  return {
    status,
    error,
    generate,
  };
}
