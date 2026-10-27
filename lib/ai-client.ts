// After a 429, refuse further calls locally until the server's cooldown ends,
// so spamming the buttons doesn't keep hitting the API.
let blockedUntil = 0

function describeWait(seconds: number) {
  if (seconds < 90) return `${seconds} second${seconds === 1 ? "" : "s"}`
  if (seconds < 90 * 60) return `${Math.ceil(seconds / 60)} minutes`
  return `${Math.ceil(seconds / 3600)} hours`
}

export async function callAI<T = any>(task: string, input: Record<string, unknown>): Promise<T> {
  const wait = Math.ceil((blockedUntil - Date.now()) / 1000)
  if (wait > 0) throw new Error(`AI is paused to prevent spam. Try again in ${describeWait(wait)}.`)

  let res: Response
  try {
    res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, input }),
    })
  } catch {
    throw new Error("You appear to be offline.")
  }
  const data = await res.json().catch(() => null)
  if (res.status === 429) {
    const retryAfter = Number(data?.retryAfter || res.headers.get("Retry-After")) || 0
    blockedUntil = Date.now() + retryAfter * 1000
  }
  if (!res.ok) throw new Error(data?.error || "AI request failed.")
  return data as T
}
