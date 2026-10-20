export interface Project {
  id: string
  title: string
  description: string
  image: string
  liveUrl: string
  githubUrl: string
  technologies: string[]
}

export interface Skill {
  id: string
  name: string
  level: number
  category: string
}

export type Layout = "grid" | "minimal" | "brutalist" | "neon" | "terminal"

export interface Theme {
  name: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  font: string
  layout: Layout
}

export interface PortfolioData {
  name: string
  title: string
  bio: string
  email: string
  location: string
  github: string
  linkedin: string
  website: string
  profilePicture: string
  projects: Project[]
  skills: Skill[]
  theme: Theme
  animations: boolean
  soundEffects: boolean
}

export const FONTS = ["Inter", "Poppins", "Space Grotesk", "Space Mono", "Roboto", "Playfair Display", "Orbitron", "JetBrains Mono"]

export const LAYOUTS: { id: Layout; label: string }[] = [
  { id: "grid", label: "Modern grid" },
  { id: "minimal", label: "Minimal" },
  { id: "brutalist", label: "Brutalist" },
  { id: "neon", label: "Neon (animated)" },
  { id: "terminal", label: "Terminal" },
]

export const THEMES: Theme[] = [
  { name: "Neon Cyber", primaryColor: "#8B5CF6", secondaryColor: "#EC4899", backgroundColor: "#0a0a0a", textColor: "#FFFFFF", font: "Orbitron", layout: "neon" },
  { name: "Minimal Clean", primaryColor: "#3B82F6", secondaryColor: "#10B981", backgroundColor: "#FFFFFF", textColor: "#1F2937", font: "Inter", layout: "minimal" },
  { name: "Brutalist Bold", primaryColor: "#EF4444", secondaryColor: "#F59E0B", backgroundColor: "#FEF3C7", textColor: "#1F2937", font: "Space Mono", layout: "brutalist" },
  { name: "Ocean Blue", primaryColor: "#0EA5E9", secondaryColor: "#06B6D4", backgroundColor: "#0F172A", textColor: "#F1F5F9", font: "Inter", layout: "grid" },
  { name: "Forest Green", primaryColor: "#22C55E", secondaryColor: "#84CC16", backgroundColor: "#0F1F14", textColor: "#ECFDF5", font: "Poppins", layout: "minimal" },
  { name: "Sunset Gradient", primaryColor: "#F97316", secondaryColor: "#EF4444", backgroundColor: "#1C1917", textColor: "#FEF3C7", font: "Poppins", layout: "grid" },
  { name: "Glassmorphism Pro", primaryColor: "#6366F1", secondaryColor: "#A5B4FC", backgroundColor: "#0F172A", textColor: "#F8FAFC", font: "Inter", layout: "grid" },
  { name: "Monochrome Grid", primaryColor: "#000000", secondaryColor: "#737373", backgroundColor: "#FFFFFF", textColor: "#000000", font: "Space Grotesk", layout: "minimal" },
  { name: "Aurora Flow", primaryColor: "#22D3EE", secondaryColor: "#A855F7", backgroundColor: "#020617", textColor: "#E5E7EB", font: "Space Grotesk", layout: "neon" },
  { name: "Terminal Hacker", primaryColor: "#22C55E", secondaryColor: "#16A34A", backgroundColor: "#020617", textColor: "#22C55E", font: "JetBrains Mono", layout: "terminal" },
  { name: "Luxury Black Gold", primaryColor: "#D4AF37", secondaryColor: "#A16207", backgroundColor: "#0B0B0F", textColor: "#FAFAFA", font: "Playfair Display", layout: "minimal" },
  { name: "Retro Pixel", primaryColor: "#FACC15", secondaryColor: "#22C55E", backgroundColor: "#1E293B", textColor: "#F8FAFC", font: "Space Mono", layout: "brutalist" },
  { name: "Pastel Soft", primaryColor: "#F472B6", secondaryColor: "#A78BFA", backgroundColor: "#FFF7ED", textColor: "#374151", font: "Poppins", layout: "grid" },
  { name: "Startup Pitch", primaryColor: "#2563EB", secondaryColor: "#22C55E", backgroundColor: "#F8FAFC", textColor: "#0F172A", font: "Inter", layout: "grid" },
]

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

export const emptyPortfolio = (): PortfolioData => ({
  name: "",
  title: "",
  bio: "",
  email: "",
  location: "",
  github: "",
  linkedin: "",
  website: "",
  profilePicture: "",
  projects: [],
  skills: [],
  theme: THEMES[0],
  animations: true,
  soundEffects: false,
})

export const demoPortfolio = (): PortfolioData => ({
  ...emptyPortfolio(),
  name: "Alex Cipher",
  title: "Full Stack Developer",
  bio: "I build fast, accessible web products end to end, from database schema to pixel-perfect UI. Lately I've been focused on real-time dashboards and developer tooling.",
  email: "alex@example.com",
  location: "Remote",
  github: "https://github.com/",
  linkedin: "https://www.linkedin.com/",
  projects: [
    { id: newId(), title: "Neural Network Dashboard", description: "Real-time model training visualizer with WebGL graphs, used by a 40-person ML team to spot divergence early.", image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=500&fit=crop", liveUrl: "", githubUrl: "", technologies: ["React", "Three.js", "WebSockets"] },
    { id: newId(), title: "Blockchain Explorer", description: "Open-source explorer with live transaction tracking and address analytics.", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=500&fit=crop", liveUrl: "", githubUrl: "", technologies: ["Next.js", "GraphQL", "PostgreSQL"] },
    { id: newId(), title: "AI Code Assistant", description: "VS Code extension that explains and refactors selected code, with 5k+ installs.", image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=500&fit=crop", liveUrl: "", githubUrl: "", technologies: ["TypeScript", "Python", "FastAPI"] },
  ],
  skills: [
    { id: newId(), name: "React & Next.js", level: 95, category: "Frontend" },
    { id: newId(), name: "TypeScript", level: 92, category: "Frontend" },
    { id: newId(), name: "Node.js", level: 90, category: "Backend" },
    { id: newId(), name: "PostgreSQL", level: 82, category: "Backend" },
    { id: newId(), name: "Docker & Kubernetes", level: 80, category: "DevOps" },
    { id: newId(), name: "AWS", level: 78, category: "DevOps" },
  ],
})

const str = (v: unknown) => (typeof v === "string" ? v : "")
const isHex = (v: unknown) => typeof v === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)

export function normalizeTheme(raw: any): Theme {
  const base = THEMES.find((t) => t.name === raw?.name) || THEMES[0]
  if (!raw || typeof raw !== "object") return base
  return {
    name: str(raw.name) || base.name,
    primaryColor: isHex(raw.primaryColor) ? raw.primaryColor : base.primaryColor,
    secondaryColor: isHex(raw.secondaryColor) ? raw.secondaryColor : base.secondaryColor,
    backgroundColor: isHex(raw.backgroundColor) ? raw.backgroundColor : base.backgroundColor,
    textColor: isHex(raw.textColor) ? raw.textColor : base.textColor,
    font: FONTS.includes(raw.font) ? raw.font : base.font,
    layout: LAYOUTS.some((l) => l.id === raw.layout) ? raw.layout : base.layout,
  }
}

/** Coerces old saves, imported JSON and AI output into valid PortfolioData. */
export function normalizePortfolio(raw: any): PortfolioData {
  const base = emptyPortfolio()
  if (!raw || typeof raw !== "object") return base
  return {
    name: str(raw.name),
    title: str(raw.title),
    bio: str(raw.bio),
    email: str(raw.email),
    location: str(raw.location),
    github: str(raw.github),
    linkedin: str(raw.linkedin),
    website: str(raw.website),
    profilePicture: str(raw.profilePicture),
    projects: Array.isArray(raw.projects)
      ? raw.projects.map((p: any) => ({
          id: str(p?.id) || newId(),
          title: str(p?.title),
          description: str(p?.description),
          // Old saves used a relative placeholder that breaks once deployed.
          image: str(p?.image).startsWith("/placeholder") ? "" : str(p?.image),
          liveUrl: str(p?.liveUrl),
          githubUrl: str(p?.githubUrl),
          technologies: Array.isArray(p?.technologies) ? p.technologies.filter((t: unknown) => typeof t === "string" && t.trim()) : [],
        }))
      : [],
    skills: Array.isArray(raw.skills)
      ? raw.skills.map((s: any) => ({
          id: str(s?.id) || newId(),
          name: str(s?.name),
          level: Math.max(0, Math.min(100, Number(s?.level) || 0)),
          category: str(s?.category) || "Other",
        }))
      : [],
    theme: normalizeTheme(raw.theme),
    animations: raw.animations !== false,
    soundEffects: Boolean(raw.soundEffects),
  }
}

// ---------- Local persistence (no server, no database) ----------

const DATA_KEY = "portfolio-data"
const SITE_KEY = "portfolio-netlify-site"

export function loadPortfolio(): PortfolioData {
  try {
    return normalizePortfolio(JSON.parse(localStorage.getItem(DATA_KEY) || "null"))
  } catch {
    return emptyPortfolio()
  }
}

export function savePortfolio(data: PortfolioData): boolean {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export interface SavedSite {
  siteId: string
  url: string
}

export function loadSite(): SavedSite | null {
  try {
    const raw = JSON.parse(localStorage.getItem(SITE_KEY) || "null")
    return raw?.siteId && raw?.url ? raw : null
  } catch {
    return null
  }
}

export function saveSite(site: SavedSite | null) {
  try {
    if (site) localStorage.setItem(SITE_KEY, JSON.stringify(site))
    else localStorage.removeItem(SITE_KEY)
  } catch {}
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "portfolio"

/** Plain-text summary used as AI context. */
export function portfolioToText(d: PortfolioData): string {
  const lines = [`Name: ${d.name}`, `Title: ${d.title}`]
  if (d.location) lines.push(`Location: ${d.location}`)
  if (d.bio) lines.push(`Bio: ${d.bio}`)
  if (d.projects.length) {
    lines.push("Projects:")
    for (const p of d.projects) lines.push(`- ${p.title} [${p.technologies.join(", ")}]: ${p.description}`)
  }
  if (d.skills.length) lines.push(`Skills: ${d.skills.map((s) => `${s.name} (${s.category})`).join(", ")}`)
  lines.push(`Theme: ${d.theme.name}`)
  return lines.join("\n")
}

export function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Please choose an image file."))
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext("2d")
      URL.revokeObjectURL(url)
      if (!ctx) return reject(new Error("Could not process the image."))
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL("image/jpeg", 0.82))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Could not read that image."))
    }
    img.src = url
  })
}
