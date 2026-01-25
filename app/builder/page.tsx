"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, Download, Globe, Plus, Trash2, Edit3, Save, ExternalLink, Copy, Upload, User, Menu, X, MessageCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import PortfolioPreview from "./components/PortfolioPreview"
import { NetlifyDeployDialog } from "@/components/NetlifyDeployDialog"

interface PortfolioData {
  name: string
  title: string
  bio: string
  email: string
  github: string
  linkedin: string
  profilePicture: string
  projects: Project[]
  skills: Skill[]
  theme: Theme
  animations: boolean
  soundEffects: boolean
}

interface Project {
  id: string
  title: string
  description: string
  image: string
  liveUrl: string
  githubUrl: string
  technologies: string[]
}

interface Skill {
  id: string
  name: string
  level: number
  category: string
}

interface Theme {
  name: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  font: string
  layout: string
}

const defaultThemes: Theme[] = [
  {
    name: "Neon Cyber",
    primaryColor: "#8B5CF6",
    secondaryColor: "#EC4899",
    backgroundColor: "#0a0a0a",
    textColor: "#FFFFFF",
    font: "Inter",
    layout: "grid",
  },
  {
    name: "Minimal Clean",
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
    backgroundColor: "#FFFFFF",
    textColor: "#1F2937",
    font: "Inter",
    layout: "minimal",
  },
  {
    name: "Brutalist",
    primaryColor: "#EF4444",
    secondaryColor: "#F59E0B",
    backgroundColor: "#FEF3C7",
    textColor: "#1F2937",
    font: "Space Mono",
    layout: "brutalist",
  },
  {
    name: "Ocean Blue",
    primaryColor: "#0EA5E9",
    secondaryColor: "#06B6D4",
    backgroundColor: "#0F172A",
    textColor: "#F1F5F9",
    font: "Inter",
    layout: "grid",
  },
  {
    name: "Forest Green",
    primaryColor: "#22C55E",
    secondaryColor: "#84CC16",
    backgroundColor: "#0F1F14",
    textColor: "#ECFDF5",
    font: "Inter",
    layout: "minimal",
  },
]

export default function BuilderPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    name: "",
    title: "",
    bio: "",
    email: "",
    github: "",
    linkedin: "",
    profilePicture: "",
    projects: [],
    skills: [],
    theme: defaultThemes[0],
    animations: true,
    soundEffects: false,
  })

  const [activeTab, setActiveTab] = useState("basic")
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentUrl, setDeploymentUrl] = useState("")
  const [generatedPortfolioUrl, setGeneratedPortfolioUrl] = useState("")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showNetlifyDialog, setShowNetlifyDialog] = useState(false)
  const [siteId, setSiteId] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: string, content: string }[]>([
    { role: "assistant", content: "Hi! I'm here to help you build your portfolio. Ask me anything about customization, templates, or deployment!" }
  ])
  const [chatInput, setChatInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem("portfolio-data")
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setPortfolioData(parsed)
      } catch (error) {
        console.error("Failed to load saved data:", error)
      }
    }
    const savedSiteId = localStorage.getItem("portfolio-site-id")
    if (savedSiteId) setSiteId(savedSiteId)
    const savedUrl = localStorage.getItem("portfolio-url")
    if (savedUrl) setDeploymentUrl(savedUrl)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowMobileMenu(false)
    if (showMobileMenu) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [showMobileMenu])

  const updatePortfolioData = (field: keyof PortfolioData, value: any) => {
    setPortfolioData((prev) => {
      const updated = { ...prev, [field]: value }
      localStorage.setItem("portfolio-data", JSON.stringify(updated))
      return updated
    })
  }

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please select an image smaller than 5MB.", variant: "destructive" })
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        updatePortfolioData("profilePicture", e.target?.result as string)
        toast({ title: "Profile Picture Updated", description: "Your profile picture has been uploaded." })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProfilePicture = () => {
    updatePortfolioData("profilePicture", "")
    toast({ title: "Profile Picture Removed" })
  }

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: "New Project",
      description: "Project description",
      image: "/placeholder.svg?height=300&width=400",
      liveUrl: "",
      githubUrl: "",
      technologies: [],
    }
    updatePortfolioData("projects", [...portfolioData.projects, newProject])
    toast({ title: "Project Added" })
  }

  const updateProject = (projectId: string, updatedProject: Partial<Project>) => {
    const updatedProjects = portfolioData.projects.map((p) =>
      p.id === projectId ? { ...p, ...updatedProject } : p
    )
    updatePortfolioData("projects", updatedProjects)
  }

  const deleteProject = (projectId: string) => {
    updatePortfolioData("projects", portfolioData.projects.filter((p) => p.id !== projectId))
    toast({ title: "Project Deleted", variant: "destructive" })
  }

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: "New Skill",
      level: 50,
      category: "Frontend",
    }
    updatePortfolioData("skills", [...portfolioData.skills, newSkill])
    toast({ title: "Skill Added" })
  }

  const updateSkill = (skillId: string, updatedSkill: Partial<Skill>) => {
    const updatedSkills = portfolioData.skills.map((s) =>
      s.id === skillId ? { ...s, ...updatedSkill } : s
    )
    updatePortfolioData("skills", updatedSkills)
  }

  const deleteSkill = (skillId: string) => {
    updatePortfolioData("skills", portfolioData.skills.filter((s) => s.id !== skillId))
    toast({ title: "Skill Deleted", variant: "destructive" })
  }

  const savePortfolio = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem("portfolio-data", JSON.stringify(portfolioData))
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({ title: "Portfolio Saved!" })
    } catch {
      toast({ title: "Save Failed", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const generatePortfolioHTML = (data: PortfolioData) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name || "Portfolio"} - ${data.title || "Developer"}</title>
    <meta name="description" content="${data.bio || "Professional portfolio"}">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=${data.theme.font.replace(" ", "+")}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: '${data.theme.font}', sans-serif; 
            background-color: ${data.theme.backgroundColor};
            color: ${data.theme.textColor};
            margin: 0;
            padding: 0;
        }
        .gradient-bg { background: linear-gradient(135deg, ${data.theme.primaryColor}15, ${data.theme.secondaryColor}15); }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
            border: none;
        }
        .btn-primary {
            background: ${data.theme.primaryColor};
            color: ${data.theme.backgroundColor};
        }
        .btn-primary:hover {
            opacity: 0.9;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px ${data.theme.primaryColor}40;
        }
        .btn-outline {
            background: transparent;
            color: ${data.theme.primaryColor};
            border: 2px solid ${data.theme.primaryColor};
        }
        .btn-outline:hover {
            background: ${data.theme.primaryColor};
            color: ${data.theme.backgroundColor};
        }
        .card {
            background: ${data.theme.primaryColor}08;
            border: 1px solid ${data.theme.primaryColor}20;
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            border-color: ${data.theme.primaryColor}40;
        }
        .tag {
            display: inline-block;
            background: ${data.theme.primaryColor};
            color: ${data.theme.backgroundColor};
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            margin: 2px;
        }
        .avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: linear-gradient(45deg, ${data.theme.primaryColor}, ${data.theme.secondaryColor});
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            font-weight: bold;
            color: white;
            margin: 0 auto 24px;
            overflow: hidden;
            border: 4px solid ${data.theme.primaryColor}30;
        }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .skill-bar {
            height: 8px;
            background: ${data.theme.textColor}20;
            border-radius: 4px;
            overflow: hidden;
        }
        .skill-fill {
            height: 100%;
            background: ${data.theme.primaryColor};
            border-radius: 4px;
            transition: width 1s ease;
        }
        section { padding: 60px 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        @media (max-width: 768px) {
            section { padding: 40px 16px; }
            .avatar { width: 100px; height: 100px; font-size: 36px; }
            h1 { font-size: 2rem !important; }
            h2 { font-size: 1.5rem !important; }
        }
    </style>
</head>
<body>
    <!-- Hero Section -->
    <section class="gradient-bg" style="min-height: 80vh; display: flex; align-items: center;">
        <div class="container" style="text-align: center;">
            <div class="avatar">
                ${data.profilePicture
        ? `<img src="${data.profilePicture}" alt="${data.name}" />`
        : data.name ? data.name.charAt(0).toUpperCase() : "?"}
            </div>
            <h1 style="font-size: 3rem; font-weight: 800; margin-bottom: 16px;">${data.name || "Your Name"}</h1>
            <h2 style="font-size: 1.5rem; color: ${data.theme.primaryColor}; margin-bottom: 24px;">${data.title || "Your Title"}</h2>
            <p style="max-width: 600px; margin: 0 auto 32px; opacity: 0.8; line-height: 1.6;">${data.bio || "Your bio will appear here..."}</p>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 16px;">
                ${data.email ? `<a href="mailto:${data.email}" class="btn btn-primary">Contact Me</a>` : ""}
                ${data.github ? `<a href="${data.github}" target="_blank" class="btn btn-outline">GitHub</a>` : ""}
                ${data.linkedin ? `<a href="${data.linkedin}" target="_blank" class="btn btn-outline">LinkedIn</a>` : ""}
            </div>
        </div>
    </section>

    ${data.projects.length > 0 ? `
    <!-- Projects Section -->
    <section>
        <div class="container">
            <h2 style="font-size: 2rem; font-weight: 800; text-align: center; margin-bottom: 48px; color: ${data.theme.primaryColor};">Projects</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
                ${data.projects.map(project => `
                <div class="card">
                    <img src="${project.image}" alt="${project.title}" style="width: 100%; height: 200px; object-fit: cover;">
                    <div style="padding: 24px;">
                        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 12px;">${project.title}</h3>
                        <p style="opacity: 0.8; margin-bottom: 16px; line-height: 1.5;">${project.description}</p>
                        <div style="margin-bottom: 16px;">
                            ${project.technologies.map(tech => `<span class="tag">${tech}</span>`).join("")}
                        </div>
                        <div style="display: flex; gap: 12px;">
                            ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" class="btn btn-primary" style="flex: 1; padding: 10px;">Live Demo</a>` : ""}
                            ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="btn btn-outline" style="flex: 1; padding: 10px;">Code</a>` : ""}
                        </div>
                    </div>
                </div>
                `).join("")}
            </div>
        </div>
    </section>
    ` : ""}

    ${data.skills.length > 0 ? `
    <!-- Skills Section -->
    <section style="background: ${data.theme.primaryColor}08;">
        <div class="container">
            <h2 style="font-size: 2rem; font-weight: 800; text-align: center; margin-bottom: 48px; color: ${data.theme.primaryColor};">Skills</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; max-width: 800px; margin: 0 auto;">
                ${data.skills.map(skill => `
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-weight: 600;">${skill.name}</span>
                        <span style="opacity: 0.7;">${skill.level}%</span>
                    </div>
                    <div class="skill-bar">
                        <div class="skill-fill" style="width: ${skill.level}%;"></div>
                    </div>
                </div>
                `).join("")}
            </div>
        </div>
    </section>
    ` : ""}

    <!-- Contact Section -->
    <section>
        <div class="container" style="text-align: center;">
            <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 24px; color: ${data.theme.primaryColor};">Get In Touch</h2>
            <p style="opacity: 0.8; margin-bottom: 32px;">Let's work together on your next project!</p>
            ${data.email ? `<a href="mailto:${data.email}" class="btn btn-primary" style="font-size: 1.1rem; padding: 16px 32px;">Contact Me</a>` : ""}
        </div>
    </section>
</body>
</html>`
  }

  const exportPortfolio = async () => {
    setIsExporting(true)
    try {
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()
      zip.file("index.html", generatePortfolioHTML(portfolioData))
      zip.file("README.md", `# ${portfolioData.name || "Portfolio"}\n\nBuilt with Portfolio Builder`)
      const zipBlob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${portfolioData.name?.toLowerCase().replace(/\s+/g, "-") || "portfolio"}.zip`
      a.click()
      URL.revokeObjectURL(url)
      toast({ title: "Export Successful!", description: "Your portfolio has been exported." })
    } catch {
      toast({ title: "Export Failed", variant: "destructive" })
    } finally {
      setIsExporting(false)
    }
  }

  const generateAndViewPortfolio = async () => {
    setIsDeploying(true)
    try {
      const htmlBlob = new Blob([generatePortfolioHTML(portfolioData)], { type: "text/html" })
      const htmlUrl = URL.createObjectURL(htmlBlob)
      setGeneratedPortfolioUrl(htmlUrl)
      const slug = portfolioData.name?.toLowerCase().replace(/\s+/g, "-") || "portfolio"
      setDeploymentUrl(`https://${slug}-${Date.now()}.vercel.app`)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast({ title: "Portfolio Generated!" })
      window.open(htmlUrl, "_blank")
    } catch {
      toast({ title: "Generation Failed", variant: "destructive" })
    } finally {
      setIsDeploying(false)
    }
  }

  const viewGeneratedPortfolio = () => {
    if (generatedPortfolioUrl) {
      window.open(generatedPortfolioUrl, "_blank")
    } else {
      const htmlBlob = new Blob([generatePortfolioHTML(portfolioData)], { type: "text/html" })
      window.open(URL.createObjectURL(htmlBlob), "_blank")
    }
  }

  const generatePortfolioFiles = (data: PortfolioData) => {
    return {
      "index.html": generatePortfolioHTML(data),
      "package.json": `{
  "name": "${data.name?.toLowerCase().replace(/\s+/g, "-") || "portfolio"}",
  "version": "1.0.0",
  "description": "Portfolio website for ${data.name || "Developer"}"
}`,
      "README.md": `# ${data.name || "Portfolio"} Website\n\nBuilt with Portfolio Builder`
    }
  }

  const handleDeploySuccess = (url: string, id: string) => {
    setDeploymentUrl(url)
    setSiteId(id)
    localStorage.setItem("portfolio-site-id", id)
    localStorage.setItem("portfolio-url", url)
    setShowNetlifyDialog(false)
    toast({ title: "Deployment Successful!", description: `Your portfolio is live at ${url}` })
  }

  const handleChatSend = () => {
    if (!chatInput.trim()) return
    const userMessage = chatInput.trim()
    setChatInput("")
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsTyping(true)

    setTimeout(() => {
      const responses: Record<string, string> = {
        "theme": "You can change themes in the 'Theme' tab. We have Neon Cyber, Minimal Clean, Brutalist, Ocean Blue, and Forest Green!",
        "project": "Go to the 'Projects' tab and click 'Add Project'. Fill in the title, description, and links.",
        "skill": "Navigate to 'Skills' tab and click 'Add Skill'. Set the name and proficiency level.",
        "export": "Click the menu button and select 'Export ZIP' to download your portfolio files.",
        "deploy": "Click 'View Live Site' to generate and preview your portfolio. Then export and upload to Netlify or Vercel.",
        "color": "In the Theme tab, you can change primary color, secondary color, and background color.",
        "font": "You can change fonts in the Theme tab. Choose from Inter, Space Mono, and more.",
        "picture": "Upload your profile picture in the 'Basic Info' tab by clicking 'Upload Photo'.",
        "default": "I can help with themes, projects, skills, deployment, and more. What would you like to know?"
      }

      const lowerMessage = userMessage.toLowerCase()
      let response = responses.default
      for (const [key, value] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) { response = value; break }
      }
      setChatMessages(prev => [...prev, { role: "assistant", content: response }])
      setIsTyping(false)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <NetlifyDeployDialog
        open={showNetlifyDialog}
        onOpenChange={setShowNetlifyDialog}
        files={generatePortfolioFiles(portfolioData)}
        existingSiteId={siteId}
        onDeploySuccess={handleDeploySuccess}
      />

      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">Portfolio Builder</h1>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-xs px-3"
              >
                <Eye className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{isPreviewMode ? "Edit" : "Preview"}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={savePortfolio}
                disabled={isSaving}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-xs px-3"
              >
                {isSaving ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Save className="w-4 h-4 mr-1" />
                )}
                <span className="hidden sm:inline">Save</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => setShowNetlifyDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs px-3"
              >
                <Globe className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{deploymentUrl ? "Update Site" : "Deploy"}</span>
              </Button>

              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setShowMobileMenu(!showMobileMenu) }}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-xs px-3"
                >
                  <Menu className="w-4 h-4" />
                </Button>

                <AnimatePresence>
                  {showMobileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        <Button
                          size="sm"
                          onClick={() => { exportPortfolio(); setShowMobileMenu(false) }}
                          disabled={isExporting}
                          className="w-full justify-start bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {isExporting ? "Exporting..." : "Export ZIP"}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => { generateAndViewPortfolio(); setShowMobileMenu(false) }}
                          disabled={isDeploying}
                          className="w-full justify-start bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          {isDeploying ? "Generating..." : "View Live Site"}
                        </Button>
                        {generatedPortfolioUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { viewGeneratedPortfolio(); setShowMobileMenu(false) }}
                            className="w-full justify-start text-white border-white/30 hover:bg-white/10"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Site
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Deploy Success Modal */}
      <AnimatePresence>
        {deploymentUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setDeploymentUrl("")}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 border border-gray-700 p-6 rounded-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-green-400 mb-4">Portfolio Generated!</h3>
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg mb-4">
                <p className="text-sm text-gray-300 mb-2">Your portfolio preview URL:</p>
                <p className="text-green-400 font-mono text-sm break-all">{deploymentUrl}</p>
              </div>
              <div className="flex gap-2 mb-4">
                <Button onClick={viewGeneratedPortfolio} className="flex-1 bg-green-600 hover:bg-green-700">
                  <ExternalLink className="w-4 h-4 mr-2" />View
                </Button>
                <Button onClick={() => navigator.clipboard.writeText(deploymentUrl)} variant="outline" className="border-gray-600">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 mb-4">To deploy permanently, export ZIP and upload to Netlify, Vercel, or GitHub Pages.</p>
              <Button onClick={() => setDeploymentUrl("")} variant="ghost" className="w-full text-gray-400">Close</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {isPreviewMode ? (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PortfolioPreview data={portfolioData} />
            </motion.div>
          ) : (
            <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Editor Panel */}
              <Card className="bg-black/30 backdrop-blur-md border-white/10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <Edit3 className="w-5 h-5" />
                    Portfolio Editor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-5 bg-white/10 mb-6">
                      {["basic", "projects", "skills", "theme", "settings"].map((tab) => (
                        <TabsTrigger key={tab} value={tab} className="text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                      {/* Profile Picture */}
                      <div className="space-y-3">
                        <Label className="text-white">Profile Picture</Label>
                        <div className="flex items-center gap-4">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold overflow-hidden border-2 border-purple-500/50"
                            style={{ background: portfolioData.profilePicture ? "transparent" : `linear-gradient(45deg, ${portfolioData.theme.primaryColor}, ${portfolioData.theme.secondaryColor})` }}
                          >
                            {portfolioData.profilePicture ? (
                              <img src={portfolioData.profilePicture || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
                            ) : portfolioData.name ? portfolioData.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => fileInputRef.current?.click()} size="sm" className="bg-purple-600 hover:bg-purple-700">
                              <Upload className="w-4 h-4 mr-1" />Upload
                            </Button>
                            {portfolioData.profilePicture && (
                              <Button onClick={removeProfilePicture} size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/20 bg-transparent">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Full Name</Label>
                          <Input value={portfolioData.name} onChange={(e) => updatePortfolioData("name", e.target.value)} placeholder="John Doe" className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
                        </div>
                        <div>
                          <Label className="text-white">Professional Title</Label>
                          <Input value={portfolioData.title} onChange={(e) => updatePortfolioData("title", e.target.value)} placeholder="Full Stack Developer" className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
                        </div>
                      </div>

                      <div>
                        <Label className="text-white">Bio</Label>
                        <Textarea value={portfolioData.bio} onChange={(e) => updatePortfolioData("bio", e.target.value)} placeholder="Tell us about yourself..." rows={3} className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-white">Email</Label>
                          <Input value={portfolioData.email} onChange={(e) => updatePortfolioData("email", e.target.value)} placeholder="email@example.com" className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
                        </div>
                        <div>
                          <Label className="text-white">GitHub</Label>
                          <Input value={portfolioData.github} onChange={(e) => updatePortfolioData("github", e.target.value)} placeholder="https://github.com/..." className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
                        </div>
                        <div>
                          <Label className="text-white">LinkedIn</Label>
                          <Input value={portfolioData.linkedin} onChange={(e) => updatePortfolioData("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="projects" className="space-y-4">
                      <Button onClick={addProject} className="w-full bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />Add Project
                      </Button>
                      {portfolioData.projects.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No projects yet. Add your first project!</p>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {portfolioData.projects.map((project) => (
                            <div key={project.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                              <div className="flex justify-between items-start mb-3">
                                <Input value={project.title} onChange={(e) => updateProject(project.id, { title: e.target.value })} className="bg-white/10 border-white/20 text-white font-semibold" />
                                <Button onClick={() => deleteProject(project.id)} size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/20 ml-2">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <Textarea value={project.description} onChange={(e) => updateProject(project.id, { description: e.target.value })} placeholder="Project description" rows={2} className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 mb-3" />
                              <div className="grid grid-cols-2 gap-2">
                                <Input value={project.liveUrl} onChange={(e) => updateProject(project.id, { liveUrl: e.target.value })} placeholder="Live URL" className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
                                <Input value={project.githubUrl} onChange={(e) => updateProject(project.id, { githubUrl: e.target.value })} placeholder="GitHub URL" className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
                              </div>
                              <Input value={project.technologies.join(", ")} onChange={(e) => updateProject(project.id, { technologies: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })} placeholder="Technologies (comma separated)" className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 mt-2" />
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="skills" className="space-y-4">
                      <Button onClick={addSkill} className="w-full bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />Add Skill
                      </Button>
                      {portfolioData.skills.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No skills yet. Add your first skill!</p>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {portfolioData.skills.map((skill) => (
                            <div key={skill.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                              <div className="flex items-center gap-2 mb-2">
                                <Input value={skill.name} onChange={(e) => updateSkill(skill.id, { name: e.target.value })} className="bg-white/10 border-white/20 text-white flex-1" />
                                <Button onClick={() => deleteSkill(skill.id)} size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/20">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-3">
                                <input type="range" min="0" max="100" value={skill.level} onChange={(e) => updateSkill(skill.id, { level: Number.parseInt(e.target.value) })} className="flex-1 accent-purple-500" />
                                <span className="text-white text-sm w-12">{skill.level}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="theme" className="space-y-4">
                      <div>
                        <Label className="text-white">Theme Preset</Label>
                        <Select value={portfolioData.theme.name} onValueChange={(name) => {
                          const theme = defaultThemes.find(t => t.name === name)
                          if (theme) updatePortfolioData("theme", theme)
                        }}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {defaultThemes.map((theme) => (
                              <SelectItem key={theme.name} value={theme.name}>{theme.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Primary Color</Label>
                          <div className="flex gap-2">
                            <input type="color" value={portfolioData.theme.primaryColor} onChange={(e) => updatePortfolioData("theme", { ...portfolioData.theme, primaryColor: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                            <Input value={portfolioData.theme.primaryColor} onChange={(e) => updatePortfolioData("theme", { ...portfolioData.theme, primaryColor: e.target.value })} className="bg-white/10 border-white/20 text-white flex-1" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-white">Secondary Color</Label>
                          <div className="flex gap-2">
                            <input type="color" value={portfolioData.theme.secondaryColor} onChange={(e) => updatePortfolioData("theme", { ...portfolioData.theme, secondaryColor: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                            <Input value={portfolioData.theme.secondaryColor} onChange={(e) => updatePortfolioData("theme", { ...portfolioData.theme, secondaryColor: e.target.value })} className="bg-white/10 border-white/20 text-white flex-1" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Background Color</Label>
                          <div className="flex gap-2">
                            <input type="color" value={portfolioData.theme.backgroundColor} onChange={(e) => updatePortfolioData("theme", { ...portfolioData.theme, backgroundColor: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                            <Input value={portfolioData.theme.backgroundColor} onChange={(e) => updatePortfolioData("theme", { ...portfolioData.theme, backgroundColor: e.target.value })} className="bg-white/10 border-white/20 text-white flex-1" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-white">Text Color</Label>
                          <div className="flex gap-2">
                            <input type="color" value={portfolioData.theme.textColor} onChange={(e) => updatePortfolioData("theme", { ...portfolioData.theme, textColor: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                            <Input value={portfolioData.theme.textColor} onChange={(e) => updatePortfolioData("theme", { ...portfolioData.theme, textColor: e.target.value })} className="bg-white/10 border-white/20 text-white flex-1" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-white">Font Family</Label>
                        <Select value={portfolioData.theme.font} onValueChange={(font) => updatePortfolioData("theme", { ...portfolioData.theme, font })}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Inter", "Space Mono", "Roboto", "Poppins", "Playfair Display"].map((font) => (
                              <SelectItem key={font} value={font}>{font}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <Label className="text-white">Enable Animations</Label>
                          <p className="text-xs text-gray-400">Show animated effects</p>
                        </div>
                        <Switch checked={portfolioData.animations} onCheckedChange={(checked) => updatePortfolioData("animations", checked)} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <Label className="text-white">Sound Effects</Label>
                          <p className="text-xs text-gray-400">Play sounds on interactions</p>
                        </div>
                        <Switch checked={portfolioData.soundEffects} onCheckedChange={(checked) => updatePortfolioData("soundEffects", checked)} />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Live Preview Panel */}
              <Card className="bg-black/30 backdrop-blur-md border-white/10 hidden lg:block">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <Eye className="w-5 h-5" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-white/10 h-[600px]">
                    <PortfolioPreview data={portfolioData} isCompact />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chatbot */}
      <div className="fixed bottom-4 right-4 z-50">
        {!isChatOpen ? (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsChatOpen(true)}
            className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg"
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-80 h-96 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-white" />
                <span className="font-semibold text-white text-sm">Build Assistant</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-2 rounded-lg text-sm ${msg.role === "user" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-200"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 p-2 rounded-lg">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleChatSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                />
                <button onClick={handleChatSend} className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
