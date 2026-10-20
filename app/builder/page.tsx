"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import JSZip from "jszip"
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Download,
  Edit3,
  Eye,
  ExternalLink,
  FileInput,
  FileJson,
  Globe,
  ImagePlus,
  Loader2,
  MoreVertical,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  User,
  Wand2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { NetlifyDeployDialog } from "@/components/NetlifyDeployDialog"
import SitePreview from "@/components/SitePreview"
import AssistantChat from "@/components/AssistantChat"
import { callAI } from "@/lib/ai-client"
import { generateSiteFiles, generateSiteHTML } from "@/lib/generateSite"
import {
  FONTS,
  LAYOUTS,
  THEMES,
  demoPortfolio,
  emptyPortfolio,
  loadPortfolio,
  loadSite,
  newId,
  normalizePortfolio,
  normalizeTheme,
  portfolioToText,
  resizeImage,
  savePortfolio,
  saveSite,
  slugify,
  type PortfolioData,
  type Project,
  type SavedSite,
  type Skill,
  type Theme,
} from "@/lib/portfolio"

const field = "bg-white/10 border-white/20 text-white placeholder:text-gray-500"
const aiBtn = "h-8 gap-1.5 border-purple-400/50 bg-purple-500/10 text-purple-200 hover:bg-purple-500/25 hover:text-white"

export default function BuilderPage() {
  const { toast } = useToast()
  const avatarInput = useRef<HTMLInputElement>(null)
  const restoreInput = useRef<HTMLInputElement>(null)
  const projectImageInput = useRef<HTMLInputElement>(null)
  const imageTarget = useRef<string | null>(null)

  const [data, setData] = useState<PortfolioData>(emptyPortfolio)
  const [hydrated, setHydrated] = useState(false)
  const saveWarned = useRef(false)
  const [site, setSite] = useState<SavedSite | null>(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [mobilePreview, setMobilePreview] = useState(false)
  const [showDeploy, setShowDeploy] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState("")
  const [themePrompt, setThemePrompt] = useState("")
  const [aiBusy, setAiBusy] = useState<string | null>(null)
  const [suggested, setSuggested] = useState<Omit<Skill, "id">[]>([])
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setData(loadPortfolio())
    setSite(loadSite())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (!savePortfolio(data) && !saveWarned.current) {
      saveWarned.current = true
      toast({
        title: "Couldn't save in this browser",
        description: "Storage is full (often large images). Use smaller images or download a backup.",
        variant: "destructive",
      })
    }
  }, [data, hydrated, toast])

  const html = useMemo(() => generateSiteHTML(data), [data])
  const context = useMemo(() => portfolioToText(data), [data])

  // ---------- updates ----------

  const update = <K extends keyof PortfolioData>(key: K, value: PortfolioData[K]) => setData((d) => ({ ...d, [key]: value }))
  const updateTheme = (patch: Partial<Theme>) => setData((d) => ({ ...d, theme: { ...d.theme, ...patch } }))
  const updateProject = (id: string, patch: Partial<Project>) =>
    setData((d) => ({ ...d, projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
  const updateSkill = (id: string, patch: Partial<Skill>) =>
    setData((d) => ({ ...d, skills: d.skills.map((s) => (s.id === id ? { ...s, ...patch } : s)) }))
  const move = (key: "projects" | "skills", index: number, dir: -1 | 1) =>
    setData((d) => {
      const list = [...d[key]] as any[]
      const j = index + dir
      if (j < 0 || j >= list.length) return d
      ;[list[index], list[j]] = [list[j], list[index]]
      return { ...d, [key]: list }
    })

  const addProject = () =>
    setData((d) => ({
      ...d,
      projects: [...d.projects, { id: newId(), title: "", description: "", image: "", liveUrl: "", githubUrl: "", technologies: [] }],
    }))
  const addSkill = (skill?: Omit<Skill, "id">) =>
    setData((d) => ({ ...d, skills: [...d.skills, { id: newId(), name: "", level: 70, category: "Frontend", ...skill }] }))

  const onImage = async (file: File | undefined, target: "avatar" | string) => {
    if (!file) return
    try {
      const url = await resizeImage(file, target === "avatar" ? 400 : 900)
      if (target === "avatar") update("profilePicture", url)
      else updateProject(target, { image: url })
    } catch (err) {
      toast({ title: "Image not added", description: (err as Error).message, variant: "destructive" })
    }
  }

  // ---------- AI ----------

  const runAI = async (key: string, fn: () => Promise<void>) => {
    if (aiBusy) return
    setAiBusy(key)
    try {
      await fn()
    } catch (err) {
      toast({ title: "AI couldn't finish", description: (err as Error).message, variant: "destructive" })
    } finally {
      setAiBusy(null)
    }
  }

  const aiBio = () =>
    runAI("bio", async () => {
      if (!data.title.trim() && !data.projects.length) throw new Error("Add your title or a project first so AI has something to go on.")
      const { bio } = await callAI<{ bio: string }>("bio", { portfolio: context })
      update("bio", bio)
    })

  const aiProject = (p: Project) =>
    runAI(`project-${p.id}`, async () => {
      if (!p.title.trim()) throw new Error("Give the project a title first.")
      const res = await callAI<{ description: string; technologies: string[] }>("projectDescription", { ...p })
      updateProject(p.id, { description: res.description, technologies: res.technologies?.length ? res.technologies : p.technologies })
    })

  const aiSkills = () =>
    runAI("skills", async () => {
      const { skills } = await callAI<{ skills: Omit<Skill, "id">[] }>("suggestSkills", { portfolio: context })
      const have = new Set(data.skills.map((s) => s.name.toLowerCase()))
      setSuggested(skills.filter((s) => !have.has(s.name.toLowerCase())))
    })

  const aiTheme = () =>
    runAI("theme", async () => {
      const theme = await callAI("theme", { prompt: themePrompt })
      update("theme", normalizeTheme(theme))
      toast({ title: "Theme generated", description: "Tweak the colors below if you like." })
    })

  const aiImport = () =>
    runAI("import", async () => {
      const raw = await callAI<any>("importResume", { text: importText })
      const imported = normalizePortfolio({ ...raw, theme: data.theme })
      setData((d) => ({
        ...imported,
        profilePicture: d.profilePicture,
        theme: d.theme,
        animations: d.animations,
        soundEffects: d.soundEffects,
      }))
      setShowImport(false)
      setImportText("")
      toast({ title: "Imported", description: "Check each tab and add project images and links." })
    })

  // ---------- export / deploy ----------

  const fileBase = slugify(data.name || "portfolio")

  const downloadZip = async () => {
    setExporting(true)
    try {
      const zip = new JSZip()
      for (const [name, content] of Object.entries(generateSiteFiles(data))) zip.file(`${fileBase}/${name}`, content)
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" })
      downloadBlob(blob, `${fileBase}-site.zip`)
      toast({ title: "Downloaded", description: "Unzip and open index.html, or drag the folder onto app.netlify.com/drop." })
    } catch (err) {
      toast({ title: "Export failed", description: String(err), variant: "destructive" })
    } finally {
      setExporting(false)
    }
  }

  const openFullPreview = () => {
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }))
    window.open(url, "_blank", "noopener")
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  const downloadBackup = () =>
    downloadBlob(new Blob([JSON.stringify({ version: 1, data }, null, 2)], { type: "application/json" }), `${fileBase}-backup.json`)

  const restoreBackup = async (file?: File) => {
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text())
      setData(normalizePortfolio(parsed.data ?? parsed))
      toast({ title: "Backup restored" })
    } catch {
      toast({ title: "Not a valid backup file", variant: "destructive" })
    }
  }

  const loadDemo = () => {
    if (hasContent(data) && !window.confirm("Replace your current content with demo content?")) return
    setData((d) => ({ ...demoPortfolio(), theme: d.theme }))
  }

  const reset = () => {
    if (!window.confirm("Clear everything and start over? Download a backup first if you want to keep it.")) return
    setData(emptyPortfolio())
  }

  const onDeployed = (s: SavedSite) => {
    setSite(s)
    saveSite(s)
  }

  // ---------- UI ----------

  const aiButton = (key: string, label: string, onClick: () => void) => (
    <Button type="button" size="sm" variant="outline" onClick={onClick} disabled={!!aiBusy} className={aiBtn}>
      {aiBusy === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {label}
    </Button>
  )

  const rowControls = (key: "projects" | "skills", index: number, length: number, onDelete: () => void) => (
    <div className="flex shrink-0 items-center">
      <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:bg-white/10 hover:text-white" disabled={index === 0} onClick={() => move(key, index, -1)} aria-label="Move up">
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:bg-white/10 hover:text-white" disabled={index === length - 1} onClick={() => move(key, index, 1)} aria-label="Move down">
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-500/20 hover:text-red-300" onClick={onDelete} aria-label="Delete">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  const editor = (
    <Card className="border-white/20 bg-black/40 shadow-2xl shadow-purple-900/10 backdrop-blur-xl">
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <Edit3 className="h-5 w-5 text-purple-400" /> Portfolio Editor
            </CardTitle>
            <p className="mt-1 text-sm text-gray-400">Changes save automatically in this browser.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowImport(true)} className={aiBtn}>
            <FileInput className="h-3.5 w-3.5" /> Import resume
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid w-full grid-cols-5 border border-white/10 bg-white/5 p-1">
            {["basic", "projects", "skills", "theme", "settings"].map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="text-xs capitalize text-gray-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* BASIC */}
          <TabsContent value="basic" className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-purple-500/50 text-xl font-bold text-white"
                style={{ background: data.profilePicture ? "transparent" : `linear-gradient(45deg, ${data.theme.primaryColor}, ${data.theme.secondaryColor})` }}
              >
                {data.profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.profilePicture} alt="" className="h-full w-full object-cover" />
                ) : data.name ? (
                  data.name.charAt(0).toUpperCase()
                ) : (
                  <User className="h-6 w-6" />
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => avatarInput.current?.click()} size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Upload className="mr-1 h-4 w-4" /> {data.profilePicture ? "Change photo" : "Upload photo"}
                </Button>
                {data.profilePicture && (
                  <Button onClick={() => update("profilePicture", "")} size="sm" variant="outline" className="border-red-500/60 bg-transparent text-red-400 hover:bg-red-500/20" aria-label="Remove photo">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <input
                ref={avatarInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  onImage(e.target.files?.[0], "avatar")
                  e.target.value = ""
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-white">Full name</Label>
                <Input value={data.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Doe" className={field} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white">Professional title</Label>
                <Input value={data.title} onChange={(e) => update("title", e.target.value)} placeholder="Full Stack Developer" className={field} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-white">Bio</Label>
                {aiButton("bio", data.bio ? "AI rewrite" : "AI write", aiBio)}
              </div>
              <Textarea value={data.bio} onChange={(e) => update("bio", e.target.value)} placeholder="What you build, for whom, and what makes your work distinctive." rows={4} className={field} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(
                [
                  ["email", "Email", "you@example.com"],
                  ["location", "Location", "Berlin, Germany / Remote"],
                  ["github", "GitHub", "https://github.com/you"],
                  ["linkedin", "LinkedIn", "https://linkedin.com/in/you"],
                  ["website", "Other link (blog, Dribbble…)", "https://…"],
                ] as const
              ).map(([key, label, ph]) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-white">{label}</Label>
                  <Input value={data[key]} onChange={(e) => update(key, e.target.value)} placeholder={ph} className={field} type={key === "email" ? "email" : "text"} />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* PROJECTS */}
          <TabsContent value="projects" className="space-y-4">
            <Button onClick={addProject} className="w-full bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" /> Add project
            </Button>
            {data.projects.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No projects yet. Add your best 3–6.</p>
            ) : (
              <div className="space-y-4">
                {data.projects.map((p, i) => (
                  <div key={p.id} className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2">
                      <Input value={p.title} onChange={(e) => updateProject(p.id, { title: e.target.value })} placeholder="Project title" className={`${field} font-semibold`} />
                      {rowControls("projects", i, data.projects.length, () => setData((d) => ({ ...d, projects: d.projects.filter((x) => x.id !== p.id) })))}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-300">Description</Label>
                        {aiButton(`project-${p.id}`, p.description ? "AI polish" : "AI write", () => aiProject(p))}
                      </div>
                      <Textarea value={p.description} onChange={(e) => updateProject(p.id, { description: e.target.value })} placeholder="What it does, who it's for, and the result." rows={3} className={field} />
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Input value={p.liveUrl} onChange={(e) => updateProject(p.id, { liveUrl: e.target.value })} placeholder="Live URL" className={field} />
                      <Input value={p.githubUrl} onChange={(e) => updateProject(p.id, { githubUrl: e.target.value })} placeholder="Source code URL" className={field} />
                    </div>
                    <TechInput value={p.technologies} onChange={(technologies) => updateProject(p.id, { technologies })} />
                    <div className="flex items-center gap-2">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt="" className="h-12 w-20 shrink-0 rounded object-cover" />
                      ) : (
                        <div className="h-12 w-20 shrink-0 rounded" style={{ background: `linear-gradient(135deg, ${data.theme.primaryColor}, ${data.theme.secondaryColor})` }} />
                      )}
                      <Input
                        value={p.image.startsWith("data:") ? "Uploaded image" : p.image}
                        readOnly={p.image.startsWith("data:")}
                        onChange={(e) => updateProject(p.id, { image: e.target.value })}
                        placeholder="Image URL (or upload)"
                        className={field}
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="shrink-0 border-white/20 bg-transparent text-white hover:bg-white/10"
                        onClick={() => {
                          imageTarget.current = p.id
                          projectImageInput.current?.click()
                        }}
                        aria-label="Upload image"
                      >
                        <ImagePlus className="h-4 w-4" />
                      </Button>
                      {p.image && (
                        <Button size="icon" variant="ghost" className="shrink-0 text-gray-400 hover:bg-white/10" onClick={() => updateProject(p.id, { image: "" })} aria-label="Remove image">
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <input
              ref={projectImageInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (imageTarget.current) onImage(e.target.files?.[0], imageTarget.current)
                e.target.value = ""
              }}
            />
          </TabsContent>

          {/* SKILLS */}
          <TabsContent value="skills" className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={() => addSkill()} className="flex-1 bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" /> Add skill
              </Button>
              <Button variant="outline" onClick={aiSkills} disabled={!!aiBusy} className={`${aiBtn} h-9`}>
                {aiBusy === "skills" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Suggest
              </Button>
            </div>

            {suggested.length > 0 && (
              <div className="rounded-lg border border-purple-400/30 bg-purple-500/10 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs text-purple-200">Click to add the ones you actually have.</p>
                  <button onClick={() => setSuggested([])} className="text-purple-200 hover:text-white" aria-label="Dismiss">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggested.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => {
                        addSkill(s)
                        setSuggested((list) => list.filter((x) => x.name !== s.name))
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-purple-400/40 px-2.5 py-1 text-xs text-white hover:bg-purple-500/30"
                    >
                      <Plus className="h-3 w-3" /> {s.name} <span className="text-purple-300">· {s.category}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {data.skills.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No skills yet.</p>
            ) : (
              <div className="space-y-3">
                {data.skills.map((s, i) => (
                  <div key={s.id} className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-2">
                      <Input value={s.name} onChange={(e) => updateSkill(s.id, { name: e.target.value })} placeholder="Skill" className={`${field} flex-1`} />
                      <Input value={s.category} onChange={(e) => updateSkill(s.id, { category: e.target.value })} placeholder="Category" list="skill-categories" className={`${field} w-32`} />
                      {rowControls("skills", i, data.skills.length, () => setData((d) => ({ ...d, skills: d.skills.filter((x) => x.id !== s.id) })))}
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={s.level}
                        onChange={(e) => updateSkill(s.id, { level: Number(e.target.value) })}
                        className="flex-1 accent-purple-500"
                        aria-label={`${s.name || "Skill"} level`}
                      />
                      <span className="w-10 text-right text-sm text-white">{s.level}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <datalist id="skill-categories">
              {["Frontend", "Backend", "Mobile", "DevOps", "Data", "AI / ML", "Design", "Tools", "Languages", "Soft skills"].map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </TabsContent>

          {/* THEME */}
          <TabsContent value="theme" className="space-y-5">
            <div className="space-y-2 rounded-lg border border-purple-400/30 bg-purple-500/10 p-3">
              <Label className="flex items-center gap-1.5 text-white">
                <Wand2 className="h-4 w-4 text-purple-300" /> Generate a theme with AI
              </Label>
              <div className="flex gap-2">
                <Input
                  value={themePrompt}
                  onChange={(e) => setThemePrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && themePrompt.trim() && aiTheme()}
                  placeholder="e.g. calm dark navy with warm orange accents, editorial"
                  className={field}
                  maxLength={300}
                />
                <Button onClick={aiTheme} disabled={!!aiBusy || !themePrompt.trim()} className="shrink-0 bg-gradient-to-r from-purple-600 to-pink-600">
                  {aiBusy === "theme" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-white">Presets</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {THEMES.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => update("theme", t)}
                    className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs text-white transition-colors ${
                      data.theme.name === t.name ? "border-purple-400 bg-purple-500/20" : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <span className="flex h-6 w-10 shrink-0 overflow-hidden rounded border border-white/20">
                      <span className="flex-1" style={{ background: t.backgroundColor }} />
                      <span className="flex-1" style={{ background: t.primaryColor }} />
                      <span className="flex-1" style={{ background: t.secondaryColor }} />
                    </span>
                    <span className="truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  ["primaryColor", "Primary"],
                  ["secondaryColor", "Secondary"],
                  ["backgroundColor", "Background"],
                  ["textColor", "Text"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-white">{label}</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={/^#[0-9a-f]{6}$/i.test(data.theme[key]) ? data.theme[key] : "#000000"}
                      onChange={(e) => updateTheme({ [key]: e.target.value, name: "Custom" })}
                      className="h-10 w-12 shrink-0 cursor-pointer rounded"
                    />
                    <Input value={data.theme[key]} onChange={(e) => updateTheme({ [key]: e.target.value, name: "Custom" })} className={field} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white">Layout</Label>
                <Select value={data.theme.layout} onValueChange={(layout) => updateTheme({ layout: layout as Theme["layout"] })}>
                  <SelectTrigger className={field}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYOUTS.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white">Font</Label>
                <Select value={data.theme.font} onValueChange={(font) => updateTheme({ font })}>
                  <SelectTrigger className={field}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings" className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
              <div>
                <Label className="text-white">Animations</Label>
                <p className="text-xs text-gray-400">Scroll reveals and background effects (respects reduced-motion settings).</p>
              </div>
              <Switch checked={data.animations} onCheckedChange={(v) => update("animations", v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
              <div>
                <Label className="text-white">Sound effects</Label>
                <p className="text-xs text-gray-400">Soft hover sounds after the visitor first clicks.</p>
              </div>
              <Switch checked={data.soundEffects} onCheckedChange={(v) => update("soundEffects", v)} />
            </div>
            {site && (
              <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
                <div className="min-w-0">
                  <Label className="text-white">Linked Netlify site</Label>
                  <a href={site.url} target="_blank" rel="noreferrer" className="block truncate text-xs text-purple-300 hover:underline">
                    {site.url}
                  </a>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    setSite(null)
                    saveSite(null)
                  }}
                >
                  Unlink
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <NetlifyDeployDialog
        open={showDeploy}
        onOpenChange={setShowDeploy}
        getFiles={() => generateSiteFiles(data)}
        site={site}
        onDeployed={onDeployed}
        onForgetSite={() => {
          setSite(null)
          saveSite(null)
        }}
      />

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="border-gray-800 bg-gray-900 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileInput className="h-5 w-5 text-purple-400" /> Import from your resume
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Paste your resume or LinkedIn profile text. AI fills in your title, bio, projects and skills. Your theme and photo stay as they are.
            </DialogDescription>
          </DialogHeader>
          <Textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={10} placeholder="Paste text here…" className={field} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowImport(false)} className="text-gray-400 hover:bg-white/10 hover:text-white">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (hasContent(data) && !window.confirm("This replaces your current content. Continue?")) return
                aiImport()
              }}
              disabled={!!aiBusy || importText.trim().length < 40}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {aiBusy === "import" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Import with AI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <input
        ref={restoreInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          restoreBackup(e.target.files?.[0])
          e.target.value = ""
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/20 bg-black/40 shadow-lg shadow-purple-900/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10" aria-label="Home">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="truncate bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-base font-bold text-transparent sm:text-lg">Portfolio Builder</h1>
            <span className="hidden items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1 text-xs text-purple-300 md:inline-flex">
              <Sparkles className="h-3 w-3" /> {data.theme.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="outline" size="sm" onClick={() => setMobilePreview((v) => !v)} className="border-white/20 bg-white/5 text-white hover:bg-white/10 lg:hidden">
              {mobilePreview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={openFullPreview} className="hidden border-white/20 bg-white/5 text-white hover:bg-white/10 sm:inline-flex">
              <ExternalLink className="mr-1 h-4 w-4" /> Open
            </Button>
            <Button variant="outline" size="sm" onClick={downloadZip} disabled={exporting} className="border-white/20 bg-white/5 text-white hover:bg-white/10">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin sm:mr-1" /> : <Download className="h-4 w-4 sm:mr-1" />}
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button size="sm" onClick={() => setShowDeploy(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-pink-700">
              <Globe className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">{site ? "Update site" : "Deploy"}</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-white/20 bg-white/5 px-2 text-white hover:bg-white/10" aria-label="More">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {site && (
                  <DropdownMenuItem asChild>
                    <a href={site.url} target="_blank" rel="noreferrer">
                      <Globe className="mr-2 h-4 w-4" /> Visit live site
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={openFullPreview}>
                  <ExternalLink className="mr-2 h-4 w-4" /> Open full preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowImport(true)}>
                  <FileInput className="mr-2 h-4 w-4" /> Import from resume (AI)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={loadDemo}>
                  <Sparkles className="mr-2 h-4 w-4" /> Load demo content
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={downloadBackup}>
                  <FileJson className="mr-2 h-4 w-4" /> Download backup (.json)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => restoreInput.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" /> Restore backup
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={reset} className="text-red-600 focus:text-red-600">
                  <RotateCcw className="mr-2 h-4 w-4" /> Start over
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-2">
        <div className={mobilePreview ? "hidden lg:block" : ""}>{editor}</div>
        <Card className={`border-white/20 bg-black/40 shadow-2xl shadow-purple-900/10 backdrop-blur-xl lg:sticky lg:top-24 lg:h-fit ${mobilePreview ? "" : "hidden lg:block"}`}>
          <CardHeader className="border-b border-white/10 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <Eye className="h-5 w-5 text-green-400" /> Live Preview
            </CardTitle>
            <p className="mt-1 text-sm text-gray-400">Exactly what gets downloaded and deployed.</p>
          </CardHeader>
          <CardContent className="pt-4">
            <SitePreview html={html} height={620} />
          </CardContent>
        </Card>
      </main>

      <AssistantChat context={context} />
    </div>
  )
}

/** Comma/Enter separated tag input for project technologies. */
function TechInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("")
  const commit = () => {
    const parts = draft.split(",").map((t) => t.trim()).filter(Boolean)
    if (parts.length) onChange(Array.from(new Set([...value, ...parts])))
    setDraft("")
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-2 py-1.5">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-purple-500/30 px-2 py-0.5 text-xs text-white">
          {t}
          <button onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="hover:text-red-300">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            commit()
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={commit}
        placeholder={value.length ? "Add more…" : "Technologies (press Enter after each)"}
        className="min-w-[8rem] flex-1 bg-transparent py-0.5 text-sm text-white outline-none placeholder:text-gray-500"
      />
    </div>
  )
}

function hasContent(d: PortfolioData) {
  return Boolean(d.name || d.bio || d.projects.length || d.skills.length)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
