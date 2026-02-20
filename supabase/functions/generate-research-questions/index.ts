import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type GenerateBody = {
  projectId: string;
  topic?: string;
  numQuestions?: number;
  language?: string;
  model?: string;
};

function getEnv(key: string): string | undefined {
  const deno = (
    globalThis as unknown as {
      Deno?: { env?: { get?: (k: string) => string | undefined } };
    }
  ).Deno;
  return deno?.env?.get?.(key);
}

type LlmQuestion = {
  position: number;
  question: string;
  rationale?: string;
  keywords?: string[];
};

type LlmPayload = {
  questions: LlmQuestion[];
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

function isLlmPayload(value: unknown): value is LlmPayload {
  if (typeof value !== "object" || value === null) return false;
  const v = value as { questions?: unknown };
  if (!Array.isArray(v.questions)) return false;
  return v.questions.every((q) => {
    if (typeof q !== "object" || q === null) return false;
    const qq = q as { position?: unknown; question?: unknown };
    return typeof qq.position === "number" && typeof qq.question === "string";
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = getEnv("SUPABASE_URL");
  const supabaseAnonKey = getEnv("SUPABASE_ANON_KEY");
  const openaiKey = getEnv("OPENAI_API_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse({ error: "Missing Supabase env" }, 500);
  }
  if (!openaiKey) {
    return jsonResponse({ error: "Missing OPENAI_API_KEY" }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  const jwt = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!jwt) {
    return jsonResponse({ error: "Missing Authorization Bearer token" }, 401);
  }

  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!body.projectId) {
    return jsonResponse({ error: "projectId is required" }, 400);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id,topic")
    .eq("id", body.projectId)
    .single();

  if (projectError) {
    return jsonResponse({ error: projectError.message }, 400);
  }

  const topic = (body.topic ?? project.topic ?? "").trim();
  if (!topic) {
    return jsonResponse({ error: "Topic is empty" }, 400);
  }

  const numQuestions =
    typeof body.numQuestions === "number" &&
    body.numQuestions >= 1 &&
    body.numQuestions <= 15
      ? body.numQuestions
      : 8;
  const language = (body.language ?? "es").trim() || "es";
  const model = (body.model ?? "gpt-4o-mini").trim() || "gpt-4o-mini";

  const systemPrompt =
    'Eres un asistente académico experto en metodología de la investigación. Analiza el tema y genera preguntas de investigación estratégicas, rigurosas y viables para una tesis universitaria. Cada pregunta debe ser clara, investigable y con un alcance realista. Responde únicamente con JSON válido (sin markdown) con el esquema: {"questions":[{"position":number,"question":string,"rationale":string,"keywords":string[]}]}.';

  const userPrompt =
    `Tema: ${topic}\n` +
    `Idioma: ${language}\n` +
    `Genera ${numQuestions} preguntas. Incluye una breve justificación (rationale) y 3-8 keywords por pregunta. No agregues texto fuera del JSON.`;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!openaiRes.ok) {
    const text = await openaiRes.text();
    return jsonResponse({ error: "OpenAI request failed", detail: text }, 502);
  }

  const openaiJson = await openaiRes.json();
  const content: string | undefined =
    openaiJson?.choices?.[0]?.message?.content;
  if (!content) {
    return jsonResponse({ error: "OpenAI returned empty content" }, 502);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return jsonResponse(
      { error: "Failed to parse JSON from model", raw: content },
      502,
    );
  }

  if (!isLlmPayload(parsed)) {
    return jsonResponse(
      { error: "Invalid JSON schema from model", raw: parsed },
      502,
    );
  }

  const questions = parsed.questions
    .slice(0, numQuestions)
    .map((q, idx) => ({
      position: idx + 1,
      question: q.question.trim(),
      rationale: (q.rationale ?? "").trim() || null,
      keywords: Array.isArray(q.keywords) ? q.keywords : null,
    }))
    .filter((q) => q.question.length > 0);

  if (questions.length === 0) {
    return jsonResponse({ error: "Model returned no usable questions" }, 502);
  }

  const { error: deleteError } = await supabase
    .from("research_questions")
    .delete()
    .eq("project_id", body.projectId);

  if (deleteError) {
    return jsonResponse({ error: deleteError.message }, 400);
  }

  const { data: inserted, error: insertError } = await supabase
    .from("research_questions")
    .insert(
      questions.map((q) => ({
        project_id: body.projectId,
        position: q.position,
        question: q.question,
        rationale: q.rationale,
        source: "ai",
        status: "draft",
      })),
    )
    .select(
      "id,project_id,position,question,rationale,status,source,created_at,updated_at",
    )
    .order("position", { ascending: true });

  if (insertError) {
    return jsonResponse({ error: insertError.message }, 400);
  }

  return jsonResponse({ questions: inserted ?? [] });
});
