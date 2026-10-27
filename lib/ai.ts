// Server-only Groq client. Never import this from a client component:
// it reads GROQ_API_KEY, which must stay on the server.

import { DAY, MINUTE, RateLimitError, envLimit, rateLimit } from "./rate-limit"

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
const DEFAULT_MODEL = "openai/gpt-oss-120b"

export class AIError extends Error {
  status: number
  /** Seconds the client should wait before retrying (rate limits). */
  retryAfter?: number
  constructor(message: string, status = 500, retryAfter?: number) {
    super(message)
    this.status = status
    this.retryAfter = retryAfter
  }
}

export interface AIMessage {
  role: "user" | "assistant"
  content: string
}

interface GenerateOptions {
  system: string
  messages: AIMessage[]
  temperature?: number
  maxOutputTokens?: number
  /** JSON schema; when set, the model is asked to return matching JSON. */
  schema?: Record<string, unknown>
}

function getModel() {
  return process.env.GROQ_MODEL || DEFAULT_MODEL
}

// GPT-OSS reasons before answering, and those tokens count against the output limit.
const isReasoningModel = (model: string) => model.startsWith("openai/gpt-oss")
// Models that accept response_format json_schema; others get json_object plus the schema in the prompt.
const supportsJsonSchema = (model: string) => /^(openai\/gpt-oss|qwen\/|meta-models\/)/.test(model)

export function isAIConfigured() {
  return Boolean(process.env.GROQ_API_KEY)
}

async function callGroq({ system, messages, temperature = 0.7, maxOutputTokens = 1024, schema }: GenerateOptions) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new AIError("AI is not configured. Set GROQ_API_KEY on the server.", 503)
  }

  const model = getModel()
  const reasoning = isReasoningModel(model)
  const body: Record<string, unknown> = {
    model,
    messages: [
      {
        role: "system",
        content:
          schema && !supportsJsonSchema(model)
            ? `${system}\n\nRespond with a single JSON object matching this JSON schema:\n${JSON.stringify(schema)}`
            : system,
      },
      ...messages,
    ],
    temperature,
    // Leave room for the hidden reasoning on top of the visible answer.
    max_completion_tokens: reasoning ? maxOutputTokens + 1024 : maxOutputTokens,
  }
  if (reasoning) {
    body.reasoning_effort = "low"
    body.include_reasoning = false
  }
  if (schema) {
    body.response_format = supportsJsonSchema(model)
      ? { type: "json_schema", json_schema: { name: "result", schema } }
      : { type: "json_object" }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  let res: Response
  try {
    res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (err) {
    if ((err as Error).name === "AbortError") throw new AIError("The AI took too long to respond. Try again.", 504)
    throw new AIError("Could not reach the AI service.", 502)
  } finally {
    clearTimeout(timeout)
  }

  const payload = await res.json().catch(() => null)
  if (!res.ok) {
    console.error("Groq error", res.status, payload?.error?.message)
    if (res.status === 429) throw new AIError("The AI is busy right now. Wait a moment and try again.", 429)
    if (res.status === 401) throw new AIError("AI is misconfigured on the server.", 503)
    throw new AIError("The AI request failed. Try again.", 502)
  }

  const choice = payload?.choices?.[0]
  const text: string | undefined = choice?.message?.content
  if (!text?.trim()) {
    if (choice?.finish_reason === "content_filter") throw new AIError("The AI declined to answer that. Try rephrasing.", 422)
    throw new AIError("The AI returned an empty response. Try again.", 502)
  }
  return text
}

export async function generateText(options: Omit<GenerateOptions, "schema">) {
  return (await callGroq(options)).trim()
}

export async function generateJSON<T>(options: GenerateOptions & { schema: Record<string, unknown> }): Promise<T> {
  const text = await callGroq(options)
  try {
    return JSON.parse(text) as T
  } catch {
    // Occasionally the model wraps JSON in a code fence.
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0]) as T
      } catch {}
    }
    throw new AIError("The AI returned malformed data. Try again.", 502)
  }
}

/**
 * Stops one visitor from spamming generations (burst + daily cap per IP), and caps the
 * whole app per minute so a crowd of IPs can't drain the Groq quota.
 */
export async function checkRateLimit(req: Request) {
  try {
    await rateLimit(
      req,
      "ai",
      [
        { name: "minute", max: envLimit("AI_RATE_LIMIT_PER_MINUTE", 8), windowMs: MINUTE },
        { name: "day", max: envLimit("AI_RATE_LIMIT_PER_DAY", 100), windowMs: DAY },
      ],
      { what: "AI requests" },
    )
    await rateLimit(req, "ai", [{ name: "minute", max: envLimit("AI_GLOBAL_RATE_LIMIT_PER_MINUTE", 60), windowMs: MINUTE }], {
      what: "AI requests from everyone right now",
      id: "global",
    })
  } catch (err) {
    if (err instanceof RateLimitError) throw new AIError(err.message, 429, err.retryAfter)
    throw err
  }
}

/** Trims and caps untrusted strings before they go into a prompt. */
export function clip(value: unknown, max = 4000): string {
  if (typeof value !== "string") return ""
  return value.trim().slice(0, max)
}
