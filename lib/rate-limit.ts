// Per-IP rate limiting with several windows at once (e.g. 10/minute and 100/day).
//
// With UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN set, counts are shared
// across every server instance (needed for real limits on serverless). Without
// them, counts live in process memory, which is per instance and resets on deploy.

export interface Limit {
  /** Shown to the user, e.g. "minute" -> "Try again in 40 seconds." */
  name: string
  max: number
  windowMs: number
}

export const MINUTE = 60_000
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

export class RateLimitError extends Error {
  status = 429
  /** Seconds until the blocking window frees up. */
  retryAfter: number
  constructor(message: string, retryAfter: number) {
    super(message)
    this.retryAfter = retryAfter
  }
}

export function clientIp(req: Request) {
  const h = req.headers
  return (
    h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-nf-client-connection-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  )
}

function describeWait(seconds: number) {
  if (seconds < 90) return `${seconds} second${seconds === 1 ? "" : "s"}`
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 90) return `${minutes} minutes`
  return `${Math.ceil(minutes / 60)} hours`
}

function limitError(limit: Limit, retryAfter: number, what: string) {
  const wait = describeWait(retryAfter)
  const message =
    limit.windowMs >= DAY
      ? `You've reached today's limit of ${limit.max} ${what}. Try again in ${wait}.`
      : `Too many ${what}. Try again in ${wait}.`
  return new RateLimitError(message, retryAfter)
}

// ---------- In-memory (sliding window) ----------

const hits = new Map<string, number[]>()

function memoryLimit(key: string, limits: Limit[], what: string) {
  const now = Date.now()
  const longest = Math.max(...limits.map((l) => l.windowMs))
  const recent = (hits.get(key) || []).filter((t) => now - t < longest)

  for (const limit of limits) {
    const inWindow = recent.filter((t) => now - t < limit.windowMs)
    if (inWindow.length >= limit.max) {
      hits.set(key, recent)
      const retryAfter = Math.max(1, Math.ceil((inWindow[0] + limit.windowMs - now) / 1000))
      throw limitError(limit, retryAfter, what)
    }
  }
  recent.push(now)
  hits.set(key, recent)

  if (hits.size > 10_000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= longest)) hits.delete(k)
    }
  }
}

// ---------- Upstash Redis (fixed window, shared across instances) ----------

async function redisLimit(key: string, limits: Limit[], what: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL!.replace(/\/$/, "")
  const now = Date.now()
  const keys = limits.map((l) => `rl:${key}:${l.name}:${Math.floor(now / l.windowMs)}`)
  const commands = limits.flatMap((l, i) => [
    ["INCR", keys[i]],
    ["PEXPIRE", keys[i], String(l.windowMs), "NX"],
  ])

  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
    signal: AbortSignal.timeout(3000),
  })
  if (!res.ok) throw new Error(`Upstash responded ${res.status}`)
  const results: { result?: number; error?: string }[] = await res.json()

  limits.forEach((limit, i) => {
    const count = Number(results[i * 2]?.result)
    if (count > limit.max) {
      const windowEnd = (Math.floor(now / limit.windowMs) + 1) * limit.windowMs
      throw limitError(limit, Math.max(1, Math.ceil((windowEnd - now) / 1000)), what)
    }
  })
}

/**
 * Throws RateLimitError when the caller is over any of the limits.
 * `id` defaults to the client IP; pass a fixed id (e.g. "global") for an app-wide cap.
 */
export async function rateLimit(
  req: Request,
  bucket: string,
  limits: Limit[],
  opts: { what?: string; id?: string } = {},
) {
  const active = limits.filter((l) => l.max > 0)
  if (!active.length) return
  const key = `${bucket}:${opts.id ?? clientIp(req)}`
  const what = opts.what ?? "requests"

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      return await redisLimit(key, active, what)
    } catch (err) {
      if (err instanceof RateLimitError) throw err
      // Redis unreachable: keep limiting locally rather than failing open or closed.
      console.error("Rate limit store unavailable, using memory", err)
    }
  }
  memoryLimit(key, active, what)
}

/** Reads a positive integer from the environment, falling back to `fallback`. 0 disables a limit. */
export function envLimit(name: string, fallback: number) {
  const raw = process.env[name]
  const value = raw ? Number(raw) : NaN
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback
}
