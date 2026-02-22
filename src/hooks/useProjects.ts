import { useCallback, useEffect, useState } from "react";

import { supabaseClient } from "../services/supabaseClient";

export type Project = {
  id: string;
  user_id: string;
  topic: string;
  title: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabaseClient
      .from("projects")
      .select("id,user_id,topic,title,status,created_at,updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setProjects([]);
      setLoading(false);
      return;
    }

    setProjects((data ?? []) as Project[]);
    setLoading(false);
  }, []);

  const createProject = useCallback(
    async (input: { topic: string; title?: string }) => {
      setError(null);
      const { data, error } = await supabaseClient
        .from("projects")
        .insert({ topic: input.topic, title: input.title ?? null })
        .select("id,user_id,topic,title,status,created_at,updated_at")
        .single();

      if (error) {
        setError(error.message);
        throw error;
      }

      const created = data as Project;
      setProjects((prev) => [created, ...prev]);
      return created;
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
    projects,
    loading,
    error,
    refresh,
    createProject,
  };
}
