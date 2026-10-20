export async function callAI<T = any>(task: string, input: Record<string, unknown>): Promise<T> {
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
  if (!res.ok) throw new Error(data?.error || "AI request failed.")
  return data as T
}
