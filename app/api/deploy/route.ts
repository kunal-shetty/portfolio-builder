import { NextResponse } from "next/server"
import { DAY, MINUTE, rateLimit, RateLimitError } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const maxDuration = 60

const MAX_ZIP_BYTES = 8 * 1024 * 1024
const NETLIFY_API = "https://api.netlify.com/api/v1"

// Proxies the upload because Netlify's API doesn't allow browser CORS.
// The user's token is forwarded once and never stored or logged.
export async function POST(req: Request) {
  try {
    await rateLimit(
      req,
      "deploy",
      [
        { name: "minute", max: 6, windowMs: MINUTE },
        { name: "day", max: 60, windowMs: DAY },
      ],
      { what: "deploys" },
    )
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json({ message: err.message }, { status: 429, headers: { "Retry-After": String(err.retryAfter) } })
    }
    throw err
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ message: "Invalid upload." }, { status: 400 })
  }

  const token = String(form.get("token") || "").trim()
  const siteId = String(form.get("siteId") || "").trim()
  const file = form.get("file")

  if (!token || !(file instanceof Blob)) {
    return NextResponse.json({ message: "Missing token or site files." }, { status: 400 })
  }
  if (siteId && !/^[a-z0-9-]{8,64}$/i.test(siteId)) {
    return NextResponse.json({ message: "Invalid site ID." }, { status: 400 })
  }
  if (file.size > MAX_ZIP_BYTES) {
    return NextResponse.json({ message: "Site is too large. Use smaller images." }, { status: 413 })
  }

  const url = siteId ? `${NETLIFY_API}/sites/${siteId}/deploys` : `${NETLIFY_API}/sites`
  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/zip" },
      body: Buffer.from(await file.arrayBuffer()),
    })
  } catch {
    return NextResponse.json({ message: "Could not reach Netlify. Try again." }, { status: 502 })
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) return NextResponse.json({ message: "Netlify rejected the token. Check it and try again." }, { status: 401 })
    if (res.status === 404 && siteId) {
      return NextResponse.json({ message: "That Netlify site no longer exists.", siteMissing: true }, { status: 404 })
    }
    return NextResponse.json({ message: data?.message || `Netlify error (${res.status}).` }, { status: res.status })
  }

  // New-site responses are site objects; redeploys are deploy objects. Normalise both.
  const resultSiteId = data.site_id || data.id
  const siteUrl = data.ssl_url || data.url || (data.subdomain ? `https://${data.subdomain}.netlify.app` : "")
  if (!resultSiteId || !siteUrl) {
    return NextResponse.json({ message: "Deployed, but Netlify didn't return a URL. Check your Netlify dashboard." }, { status: 502 })
  }
  return NextResponse.json({ siteId: resultSiteId, url: siteUrl, adminUrl: data.admin_url || "" })
}
