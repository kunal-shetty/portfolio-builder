// Server-only Gemini client. Never import this from a client component:
// it reads GEMINI_API_KEY, which must stay on the server.

import { rateLimit, RateLimitError } from "./rate-limit"

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"

export class AIError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
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
  /** OpenAPI-style schema; when set, the model is forced to return matching JSON. */
  schema?: Record<string, unknown>
}

function getModel() {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash"
}

/** Gemini's canonical schema enum is uppercase ("OBJECT", "STRING", ...). */
function toGeminiSchema(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(toGeminiSchema)
  if (!node || typeof node !== "object") return node
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node)) {
    out[key] = key === "type" && typeof value === "string" ? value.toUpperCase() : toGeminiSchema(value)
  }
  return out
}

export function isAIConfigured() {
  return Boolean(process.env.GEMINI_API_KEY)
}

async function callGemini({ system, messages, temperature = 0.7, maxOutputTokens = 1024, schema }: GenerateOptions) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new AIError("AI is not configured. Set GEMINI_API_KEY on the server.", 503)
  }

  const model = getModel()
  const generationConfig: Record<string, unknown> = { temperature, maxOutputTokens }
  if (schema) {
    generationConfig.responseMimeType = "application/json"
    generationConfig.responseSchema = toGeminiSchema(schema)
  }
  // 2.5 Flash "thinks" by default, which is slow and eats the output budget.
  // These tasks are short rewrites, so skip it.
  if (model.startsWith("gemini-2.5-flash")) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  let res: Response
  try {
    res = await fetch(`${GEMINI_ENDPOINT}/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig,
      }),
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
    console.error("Gemini error", res.status, payload?.error?.message)
    if (res.status === 429) throw new AIError("The AI is busy right now. Wait a moment and try again.", 429)
    throw new AIError("The AI request failed. Try again.", 502)
  }

  const candidate = payload?.candidates?.[0]
  const text: string | undefined = candidate?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("")
  if (!text) {
    if (candidate?.finishReason === "SAFETY" || payload?.promptFeedback?.blockReason) {
      throw new AIError("The AI declined to answer that. Try rephrasing.", 422)
    }
    throw new AIError("The AI returned an empty response. Try again.", 502)
  }
  return text
}

export async function generateText(options: Omit<GenerateOptions, "schema">) {
  return (await callGemini(options)).trim()
}

export async function generateJSON<T>(options: GenerateOptions & { schema: Record<string, unknown> }): Promise<T> {
  const text = await callGemini(options)
  try {
    return JSON.parse(text) as T
  } catch {
    // Occasionally the model wraps JSON in a code fence despite the mime type.
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0]) as T
      } catch {}
    }
    throw new AIError("The AI returned malformed data. Try again.", 502)
  }
}

export function checkRateLimit(req: Request) {
  try {
    rateLimit(req, "ai", Number(process.env.AI_RATE_LIMIT_PER_MINUTE || 20))
  } catch (err) {
    if (err instanceof RateLimitError) throw new AIError("Too many AI requests. Wait a minute and try again.", 429)
    throw err
  }
}

/** Trims and caps untrusted strings before they go into a prompt. */
export function clip(value: unknown, max = 4000): string {
  if (typeof value !== "string") return ""
  return value.trim().slice(0, max)
}
