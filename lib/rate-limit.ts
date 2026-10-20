// Best-effort per-IP limiter. It lives in process memory, so on serverless it is
// per-instance; put a gateway limit (e.g. Vercel Firewall) in front for hard caps.
const WINDOW_MS = 60_000
const buckets = new Map<string, Map<string, number[]>>()

export class RateLimitError extends Error {
  status = 429
}

export function rateLimit(req: Request, bucket: string, maxPerMinute: number) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local"
  const now = Date.now()
  let hits = buckets.get(bucket)
  if (!hits) buckets.set(bucket, (hits = new Map()))

  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= maxPerMinute) {
    throw new RateLimitError("Too many requests. Wait a minute and try again.")
  }
  recent.push(now)
  hits.set(ip, recent)

  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key)
    }
  }
}
