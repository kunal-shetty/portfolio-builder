"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, Download, Globe, Plus, Trash2, Edit3, Save, ExternalLink, Copy, Upload, User, Menu, Rocket } from "lucide-react"
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
import ProjectEditor from "./components/ProjectEditor"
import ThemeCustomizer from "./components/ThemeCustomizer"
import SoundEffects from "./components/SoundEffects"
import { NetlifyDeployDialog } from "@/components/NetlifyDeployDialog"
import PortfolioChatbot from "@/components/PortfolioChatbot"
import ChatbotConfig from "./components/ChatbotConfig"

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
  chatbot: {
    enabled: boolean
    apiKey: string
    systemPrompt: string
  }
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
    backgroundColor: "#000000",
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
    name: "Glassmorphism",
    primaryColor: "#6366f1",
    secondaryColor: "#a855f7",
    backgroundColor: "#0f172a",
    textColor: "#f8fafc",
    font: "Outfit",
    layout: "glass",
  },
  {
    name: "Nature",
    primaryColor: "#10b981",
    secondaryColor: "#3b82f6",
    backgroundColor: "#f0fdf4",
    textColor: "#064e3b",
    font: "DM Sans",
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
    soundEffects: true,
    chatbot: {
      enabled: false,
      apiKey: "",
      systemPrompt: "You are a helpful portfolio assistant.",
    },
  })

  const [activeTab, setActiveTab] = useState("basic")
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentUrl, setDeploymentUrl] = useState("")
  const [customUrl, setCustomUrl] = useState("")
  const [showDeployDialog, setShowDeployDialog] = useState(false)
  const [showNetlifyDialog, setShowNetlifyDialog] = useState(false)
  const [generatedPortfolioUrl, setGeneratedPortfolioUrl] = useState("")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [siteId, setSiteId] = useState("")

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
    const savedPreviewUrl = localStorage.getItem('portfolio-preview-url')
    if (savedPreviewUrl) setGeneratedPortfolioUrl(savedPreviewUrl)
  }, [])

  const updatePortfolioData = (field: keyof PortfolioData, value: any) => {
    setPortfolioData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      }
      // Auto-save to localStorage
      try {
        localStorage.setItem("portfolio-data", JSON.stringify(updated))
      } catch (error) {
        console.error("Failed to save to localStorage:", error)
      }
      return updated
    })
  }

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        updatePortfolioData("profilePicture", result)
        toast({
          title: "Profile Picture Updated",
          description: "Your profile picture has been uploaded successfully.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProfilePicture = () => {
    updatePortfolioData("profilePicture", "")
    toast({
      title: "Profile Picture Removed",
      description: "Your profile picture has been removed.",
    })
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

    const updatedProjects = [...portfolioData.projects, newProject]
    updatePortfolioData("projects", updatedProjects)

    toast({
      title: "Project Added",
      description: "New project has been added to your portfolio.",
    })
  }

  const updateProject = (projectId: string, updatedProject: Partial<Project>) => {
    const updatedProjects = portfolioData.projects.map((project) =>
      project.id === projectId ? { ...project, ...updatedProject } : project,
    )
    updatePortfolioData("projects", updatedProjects)
  }

  const deleteProject = (projectId: string) => {
    const updatedProjects = portfolioData.projects.filter((project) => project.id !== projectId)
    updatePortfolioData("projects", updatedProjects)

    toast({
      title: "Project Deleted",
      description: "Project has been removed from your portfolio.",
      variant: "destructive",
    })
  }

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: "New Skill",
      level: 50,
      category: "Frontend",
    }

    const updatedSkills = [...portfolioData.skills, newSkill]
    updatePortfolioData("skills", updatedSkills)

    toast({
      title: "Skill Added",
      description: "New skill has been added to your portfolio.",
    })
  }

  const updateSkill = (skillId: string, updatedSkill: Partial<Skill>) => {
    const updatedSkills = portfolioData.skills.map((skill) =>
      skill.id === skillId ? { ...skill, ...updatedSkill } : skill,
    )
    updatePortfolioData("skills", updatedSkills)
  }

  const deleteSkill = (skillId: string) => {
    const updatedSkills = portfolioData.skills.filter((skill) => skill.id !== skillId)
    updatePortfolioData("skills", updatedSkills)

    toast({
      title: "Skill Deleted",
      description: "Skill has been removed from your portfolio.",
      variant: "destructive",
    })
  }

  const savePortfolio = async () => {
    setIsSaving(true)
    try {
      // Save to localStorage
      localStorage.setItem("portfolio-data", JSON.stringify(portfolioData))
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Portfolio Saved",
        description: "Your portfolio has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save your portfolio. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const generatePortfolioFiles = (data: PortfolioData) => {
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name || "Portfolio"} - ${data.title || "Developer"}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=${data.theme.font.replace(" ", "+")}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style> 
    body {
        font-family: '${data.theme.font}', sans-serif;
        background-color: ${data.theme.backgroundColor};
        color: ${data.theme.textColor};
        overflow-x: hidden;
        scroll-behavior: smooth;
    }
    .glass {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .gradient-text {
        background: linear-gradient(to right, ${data.theme.primaryColor}, ${data.theme.secondaryColor});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    .project-card {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        background: ${data.theme.backgroundColor === '#000000' || data.theme.backgroundColor.includes('0,0,0') ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
        border: 1px solid ${data.theme.primaryColor}20;
        position: relative;
        overflow: hidden;
    }
    .project-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent, ${data.theme.primaryColor}10, transparent);
        transform: translate(-100%, -100%);
        transition: 0.5s;
    }
    .project-card:hover::before {
        transform: translate(100%, 100%);
    }
    .project-card:hover {
        transform: translateY(-10px) scale(1.02);
        box-shadow: 0 20px 40px -10px ${data.theme.primaryColor}30;
        border-color: ${data.theme.primaryColor}60;
    }
    .btn-primary {
        background: linear-gradient(45deg, ${data.theme.primaryColor}, ${data.theme.secondaryColor});
        color: white !important;
        padding: 14px 28px;
        border-radius: 50px;
        text-decoration: none;
        display: inline-block;
        transition: all 0.3s ease;
        border: none;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 14px;
        box-shadow: 0 4px 15px ${data.theme.primaryColor}40;
        position: relative;
        overflow: hidden;
        z-index: 1;
    }
    .btn-primary::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, ${data.theme.secondaryColor}, ${data.theme.primaryColor});
        opacity: 0;
        z-index: -1;
        transition: 0.3s;
    }
    .btn-primary:hover::after {
        opacity: 1;
    }
    .btn-primary:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px ${data.theme.primaryColor}60;
    }
    .btn-outline {
        background: transparent;
        color: ${data.theme.primaryColor} !important;
        border: 2px solid ${data.theme.primaryColor};
        padding: 12px 26px;
        border-radius: 50px;
        text-decoration: none;
        display: inline-block;
        transition: all 0.3s ease;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 14px;
    }
    .btn-outline:hover {
        background: ${data.theme.primaryColor} !important;
        color: ${data.theme.backgroundColor} !important;
        transform: translateY(-3px);
        box-shadow: 0 10px 25px ${data.theme.primaryColor}40;
    }
    .skill-track {
        background: ${data.theme.primaryColor}20;
        border-radius: 20px;
        overflow: hidden;
        height: 10px;
    }
    .skill-bar {
        background: linear-gradient(90deg, ${data.theme.primaryColor}, ${data.theme.secondaryColor});
        height: 100%;
        border-radius: 20px;
        width: 0; 
        transition: width 1.5s cubic-bezier(0.65, 0, 0.35, 1);
        position: relative;
    }
    .skill-bar::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.15) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.15) 75%,
            transparent 75%,
            transparent
        );
        background-size: 1rem 1rem;
        animation: stripe-animation 1s linear infinite;
    }
    @keyframes stripe-animation {
        0% { background-position: 0 0; }
        100% { background-position: 1rem 0; }
    }
    .avatar-container {
        position: relative;
        width: 150px;
        height: 150px;
        margin: 0 auto 30px;
    }
    .avatar-glow {
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        border-radius: 50%;
        background: linear-gradient(45deg, ${data.theme.primaryColor}, ${data.theme.secondaryColor});
        z-index: -1;
        filter: blur(20px);
        opacity: 0.5;
        animation: pulse 3s infinite;
    }
    .avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        overflow: hidden;
        border: 4px solid ${data.theme.backgroundColor};
        position: relative;
        z-index: 1;
        background: ${data.theme.backgroundColor};
    }
    @keyframes pulse {
        0% { opacity: 0.5; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
        100% { opacity: 0.5; transform: scale(1); }
    }
    .reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease;
    }
    .reveal.active {
        opacity: 1;
        transform: translateY(0);
    }
    #particles-js {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: -1;
        pointer-events: none;
    }
    /* Rest of utility classes ... */
    .section { padding: 100px 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .grid { display: grid; gap: 30px; }
    .grid-cols-1 { grid-template-columns: 1fr; }
    .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
    .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
    @media(max-width: 768px) { .grid-cols-3, .grid-cols-2 { grid-template-columns: 1fr; } }
    .text-center { text-align: center; }
    .font-bold { font-weight: bold; }
    .text-4xl { font-size: 2.5rem; }
    .text-6xl { font-size: 4rem; }
    .mb-4 { margin-bottom: 1rem; }
    .flex { display: flex; }
    .justify-center { justify-content: center; }
    .gap-4 { gap: 1rem; }
    
</style>
<!-- Particle JS -->
<script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
</head>
<body>
    <div id="particles-js"></div>
    <div class="min-h-screen" style="position: relative; z-index: 1;">
        <!-- Hero Section -->
        <section class="section text-center" style="min-height: 90vh; display: flex; align-items: center; justify-content: center;">
            <div class="container reveal active">
                <div class="avatar-container">
                    <div class="avatar-glow"></div>
                    <div class="avatar">
                    ${data.profilePicture
        ? `<img src="${data.profilePicture}" alt="${data.name || "Profile"}" />`
        : data.name
          ? data.name.charAt(0).toUpperCase()
          : "?"
      }
                    </div>
                </div>
                <h1 class="text-4xl md:text-6xl font-bold mb-4 gradient-text">${data.name || "Your Name"}</h1>
                <h2 class="text-xl md:text-2xl mb-6" style="color: ${data.theme.primaryColor}">${data.title || "Your Title"}</h2>
                <p class="text-lg max-w-2xl mx-auto mb-8 opacity-80">${data.bio || "Your bio will appear here..."}</p>
                <div class="flex flex-wrap justify-center gap-4">
                    ${data.email ? `<a href="mailto:${data.email}" class="btn-primary">Contact Me</a>` : ""}
                    ${data.github ? `<a href="${data.github}" target="_blank" class="btn-outline">GitHub</a>` : ""}
                    ${data.linkedin ? `<a href="${data.linkedin}" target="_blank" class="btn-outline">LinkedIn</a>` : ""}
                </div>
            </div>
        </section>

        <!-- Projects Section -->
        ${data.projects.length > 0
        ? `
        <section class="section">
            <div class="container reveal">
                <h2 class="text-3xl font-bold mb-12 text-center gradient-text">Projects</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    ${data.projects
          .map(
            (project) => `
                    <div class="project-card rounded-lg overflow-hidden shadow-lg">
                        <img src="${project.image}" alt="${project.title}" style="width: 100%; height: 200px; object-fit: cover;">
                        <div style="padding: 24px;">
                            <h3 class="text-xl font-bold mb-2" style="color: ${data.theme.primaryColor}">${project.title}</h3>
                            <p class="opacity-80 mb-4">${project.description}</p>
                            <div class="mb-4">
                                ${project.technologies.map((tech) => `<span class="tech-tag" style="background: ${data.theme.primaryColor}20; color: ${data.theme.primaryColor}; border: 1px solid ${data.theme.primaryColor}40; padding: 6px 12px; border-radius: 20px; font-size: 12px; display: inline-block; margin: 4px 2px; font-weight: 500;">${tech}</span>`).join("")}
                            </div>
                            <div class="flex gap-2">
                                ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" class="btn-primary flex-1 text-center">Live Demo</a>` : ""}
                                ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="btn-outline flex-1 text-center">Code</a>` : ""}
                            </div>
                        </div>
                    </div>
                    `,
          )
          .join("")}
                </div>
            </div>
        </section>
        `
        : ""
      }

        <!-- Skills Section -->
        ${data.skills.length > 0
        ? `
        <section class="section" style="background: rgba(255,255,255,0.02);">
            <div class="container reveal">
                <h2 class="text-3xl font-bold mb-12 text-center gradient-text">Skills</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    ${data.skills
          .map(
            (skill) => `
                    <div class="mb-6">
                        <div class="flex justify-between mb-2">
                             <h3 class="font-semibold">${skill.name}</h3>
                             <span class="text-sm opacity-70">${skill.level}%</span>
                        </div>
                        <div class="skill-track">
                            <div class="skill-bar" data-width="${skill.level}" style="width: 0%;"></div>
                        </div>
                    </div>
                    `,
          )
          .join("")}
                </div>
            </div>
        </section>
        `
        : ""
      }

        <!-- Contact Section -->
        <section class="section text-center">
            <div class="container reveal">
                <h2 class="text-3xl font-bold mb-8 gradient-text">Get In Touch</h2>
                <p class="text-lg mb-8 opacity-80">Let's work together on your next project!</p>
                ${data.email ? `<a href="mailto:${data.email}" class="btn-primary text-lg">Message Me</a>` : ""}
            </div>
        </section>
    </div>

    <script>
        // Reveal Animations
        function reveal() {
            var reveals = document.querySelectorAll(".reveal");
            for (var i = 0; i < reveals.length; i++) {
                var windowHeight = window.innerHeight;
                var elementTop = reveals[i].getBoundingClientRect().top;
                var elementVisible = 150;
                if (elementTop < windowHeight - elementVisible) {
                    reveals[i].classList.add("active");
                }
            }
        }
        window.addEventListener("scroll", reveal);

        // Particle Effect
        ${data.animations ? `
        particlesJS('particles-js', {
            "particles": {
                "number": { "value": 50, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "${data.theme.primaryColor}" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.3, "random": true },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "${data.theme.primaryColor}", "opacity": 0.2, "width": 1 },
                "move": { "enable": true, "speed": 2 }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" } },
                "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } } }
            },
            "retina_detect": true
        });` : ''}

        // Skill Bar Animation
        function animateSkills() {
             var skills = document.querySelectorAll(".skill-bar");
             skills.forEach(skill => {
                 var width = skill.getAttribute('data-width');
                 skill.style.width = width + '%';
             });
        }
        // Trigger skill animation when skills section is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSkills();
                }
            });
        });
        const skillSection = document.querySelector('.skill-track');
        if(skillSection) observer.observe(skillSection);
        
        // Initial animation
        window.setTimeout(() => {
            animateSkills();
        }, 500);
    </script>
    ${data.chatbot?.enabled && data.chatbot.apiKey ? `
    <!-- Gemini Chatbot -->
    <div id="chatbot-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
        <button id="chatbot-toggle" style="background: ${data.theme.primaryColor}; color: ${data.theme.backgroundColor}; border: none; border-radius: 50%; width: 60px; height: 60px; font-size: 24px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; transition: transform 0.3s;">
            💬
        </button>
        <div id="chatbot-window" style="display: none; position: absolute; bottom: 80px; right: 0; width: 350px; height: 500px; background: ${data.theme.backgroundColor}; border: 1px solid ${data.theme.primaryColor}40; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); flex-direction: column; overflow: hidden;">
            <div style="background: ${data.theme.primaryColor}; color: ${data.theme.backgroundColor}; padding: 12px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                <span>AI Assistant</span>
                <button id="chatbot-close" style="background: none; border: none; color: inherit; cursor: pointer;">✕</button>
            </div>
            <div id="chatbot-messages" style="flex: 1; padding: 12px; overflow-y: auto; background: rgba(0,0,0,0.02);">
                <div style="margin-bottom: 8px; text-align: left;">
                    <div style="display: inline-block; background: ${data.theme.primaryColor}20; padding: 8px 12px; border-radius: 12px 12px 12px 0;">Hello! ask me anything about ${data.name}.</div>
                </div>
            </div>
            <div style="padding: 12px; border-top: 1px solid ${data.theme.primaryColor}20; display: flex; gap: 8px;">
                <input type="text" id="chatbot-input" placeholder="Ask a question..." style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid ${data.theme.primaryColor}40; background: transparent; color: inherit;">
                <button id="chatbot-send" style="background: ${data.theme.primaryColor}; color: ${data.theme.backgroundColor}; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer;">Send</button>
            </div>
        </div>
    </div>
    <script>
        const chatToggle = document.getElementById('chatbot-toggle');
        const chatWindow = document.getElementById('chatbot-window');
        const chatClose = document.getElementById('chatbot-close');
        const chatInput = document.getElementById('chatbot-input');
        const chatSend = document.getElementById('chatbot-send');
        const chatMessages = document.getElementById('chatbot-messages');

        const API_KEY = "${data.chatbot.apiKey}";
        const SYSTEM_PROMPT = "${data.chatbot.systemPrompt}";

        chatToggle.onclick = () => {
            chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
        };

        chatClose.onclick = () => {
            chatWindow.style.display = 'none';
        };

        async function sendMessage() {
            const text = chatInput.value.trim();
            if(!text) return;
            
            // Add user message
            addMessage(text, 'user');
            chatInput.value = '';

            try {
                // Add loading
                const loadingId = addMessage('Thinking...', 'bot');

                const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${API_KEY}\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            { 
                                role: "user", 
                                parts: [{ text: \`\${SYSTEM_PROMPT}\n\nContext: Portfolio Owner is ${data.name}, Title: ${data.title}, Bio: ${data.bio}, Projects: ${data.projects.map(p => p.title).join(', ')}.\n\nUser Question: \${text}\` }] 
                            }
                        ]
                    })
                });

                const data = await response.json();
                const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";
                
                // Remove loading and add reply
                document.getElementById(loadingId).remove();
                addMessage(reply, 'bot');

            } catch (error) {
                console.error(error);
                addMessage("Error connecting to AI.", 'bot');
            }
        }

        function addMessage(text, sender) {
            const id = 'msg-' + Date.now();
            const div = document.createElement('div');
            div.id = id;
            div.style.marginBottom = '8px';
            div.style.textAlign = sender === 'user' ? 'right' : 'left';
            div.innerHTML = \`<div style="display: inline-block; background: \${sender === 'user' ? '${data.theme.primaryColor}' : '${data.theme.primaryColor}20'}; color: \${sender === 'user' ? '${data.theme.backgroundColor}' : 'inherit'}; padding: 8px 12px; border-radius: \${sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0'}; max-width: 80%;">\${text}</div>\`;
            chatMessages.appendChild(div);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return id;
        }

        chatSend.onclick = sendMessage;
        chatInput.onkeypress = (e) => {
            if(e.key === 'Enter') sendMessage();
        }
    </script>
    ` : ''}
</body>
</html>`

    return {
      "index.html": indexHtml,
      "package.json": `{
  "name": "${data.name?.toLowerCase().replace(/\s+/g, "-") || "portfolio"}",
  "version": "1.0.0",
  "description": "Portfolio website for ${data.name || "Developer"}",
  "main": "index.html"
}`,
      "README.md": `# ${data.name || "Portfolio"} Website\n\nBuilt with Portfolio Builder`,
    }
  }

  const exportPortfolio = async () => {
    setIsExporting(true)
    try {
      // Generate portfolio files
      const files = generatePortfolioFiles(portfolioData)

      // Create zip file using JSZip
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      // Add files to zip
      Object.entries(files).forEach(([filename, content]) => {
        zip.file(filename, content)
      })

      // Generate zip blob
      const zipBlob = await zip.generateAsync({ type: "blob" })

      // Download zip file
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${portfolioData.name?.toLowerCase().replace(/\s+/g, "-") || "portfolio"}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: "Your portfolio has been exported as a ZIP file.",
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export your portfolio. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const generateAndViewPortfolio = async () => {
    setIsDeploying(true)
    try {
      // Generate portfolio files
      const files = generatePortfolioFiles(portfolioData)

      // Revoke old URL if it exists to prevent memory leaks
      if (generatedPortfolioUrl && generatedPortfolioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(generatedPortfolioUrl)
      }

      // Create a blob URL for the generated HTML
      const htmlBlob = new Blob([files["index.html"]], { type: "text/html" })
      const htmlUrl = URL.createObjectURL(htmlBlob)

      // Store the URL for later use
      setGeneratedPortfolioUrl(htmlUrl)
      localStorage.setItem('portfolio-preview-url', htmlUrl)

      toast({
        title: "Portfolio Generated!",
        description: "Your portfolio is ready to view. Opening in new tab...",
      })

      // Auto-open the portfolio in a new tab
      setTimeout(() => {
        const newWindow = window.open(htmlUrl, "_blank")
        if (!newWindow) {
          toast({
            title: "Popup Blocked",
            description: "Please allow popups and try again, or click 'View Portfolio' button.",
            variant: "destructive",
          })
        }
      }, 500)
    } catch (error) {
      console.error("Generation failed:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate your portfolio. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeploying(false)
    }
  }

  const handleDeploySuccess = (url: string, id: string) => {
    setDeploymentUrl(url)
    setSiteId(id)
    localStorage.setItem("portfolio-site-id", id)
    localStorage.setItem("portfolio-url", url)
    setShowNetlifyDialog(false)
  }

  const viewGeneratedPortfolio = () => {
    if (deploymentUrl) {
      window.open(deploymentUrl, "_blank")
      return
    }

    if (generatedPortfolioUrl) {
      const newWindow = window.open(generatedPortfolioUrl, "_blank")
      if (!newWindow) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups to view your portfolio.",
          variant: "destructive",
        })
      }
    } else {
      // Generate on the fly if not available
      const files = generatePortfolioFiles(portfolioData)
      const htmlBlob = new Blob([files["index.html"]], { type: "text/html" })
      const htmlUrl = URL.createObjectURL(htmlBlob)
      const newWindow = window.open(htmlUrl, "_blank")
      if (!newWindow) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups to view your portfolio.",
          variant: "destructive",
        })
      }
    }
  }

  const copyDeploymentUrl = async () => {
    if (deploymentUrl) {
      try {
        await navigator.clipboard.writeText(deploymentUrl)
        toast({
          title: "URL Copied",
          description: "Portfolio URL has been copied to clipboard.",
        })
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Failed to copy URL to clipboard.",
          variant: "destructive",
        })
      }
    }
  }

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode)
    toast({
      title: isPreviewMode ? "Edit Mode" : "Preview Mode",
      description: isPreviewMode ? "You can now edit your portfolio." : "Viewing your portfolio preview.",
    })
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        {typeof window !== "undefined" && <SoundEffects enabled={portfolioData.soundEffects} />}
        <NetlifyDeployDialog
          open={showNetlifyDialog}
          onOpenChange={setShowNetlifyDialog}
          files={generatePortfolioFiles(portfolioData)}
          existingSiteId={siteId}
          onDeploySuccess={handleDeploySuccess}
        />

        {/* Header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">Portfolio Builder</h1>

              {/* Mobile-First Button Layout */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Always visible core buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePreviewMode}
                  className="text-white border-white/40 hover:bg-white/10 bg-white/5 opacity-100 font-medium text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden sm:inline">{isPreviewMode ? "Edit" : "Preview"}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={savePortfolio}
                  disabled={isSaving}
                  className="text-white border-white/40 hover:bg-white/10 bg-white/5 opacity-100 font-medium text-xs sm:text-sm px-2 sm:px-3"
                >
                  {isSaving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <Save className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  )}
                  <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowNetlifyDialog(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 font-medium text-xs sm:text-sm px-2 sm:px-3 shadow-lg shadow-purple-500/20"
                >
                  <Rocket className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden sm:inline">{deploymentUrl ? "Update Site" : "Deploy"}</span>
                </Button>

                {/* Mobile dropdown for additional actions */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="text-white border-white/40 hover:bg-white/10 bg-white/5 opacity-100 font-medium text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <Menu className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden lg:inline ml-1">More</span>
                  </Button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showMobileMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50"
                      >
                        <div className="p-2 space-y-1">
                          <Button
                            size="sm"
                            onClick={() => {
                              exportPortfolio()
                              setShowMobileMenu(false)
                            }}
                            disabled={isExporting}
                            className="w-full justify-start bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white opacity-100 font-medium text-xs"
                          >
                            {isExporting ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                className="w-3 h-3 mr-2 border-2 border-white border-t-transparent rounded-full"
                              />
                            ) : (
                              <Download className="w-3 h-3 mr-2" />
                            )}
                            {isExporting ? "Exporting..." : "Export ZIP"}
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => {
                              generateAndViewPortfolio()
                              setShowMobileMenu(false)
                            }}
                            disabled={isDeploying}
                            className="w-full justify-start bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white opacity-100 font-medium text-xs"
                          >
                            {isDeploying ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                className="w-3 h-3 mr-2 border-2 border-white border-t-transparent rounded-full"
                              />
                            ) : (
                              <Globe className="w-3 h-3 mr-2" />
                            )}
                            {isDeploying ? "Generating..." : (deploymentUrl ? "View Live Site" : "Preview")}
                          </Button>

                          {generatedPortfolioUrl && (
                            <Button
                              size="sm"
                              onClick={() => {
                                viewGeneratedPortfolio()
                                setShowMobileMenu(false)
                              }}
                              variant="outline"
                              className="w-full justify-start text-white border-white/40 hover:bg-white/10 bg-white/5 opacity-100 font-medium text-xs"
                            >
                              <ExternalLink className="w-3 h-3 mr-2" />
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
        </motion.header>

        {/* Deploy Success Modal */}
        {deploymentUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeploymentUrl("")}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 border border-gray-700 text-white p-6 rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 text-green-400">🎉 Portfolio Generated!</h3>

              <div className="space-y-4">
                <div className="p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-gray-300 mb-2">Your portfolio is ready to view:</p>
                  <p className="text-green-400 font-mono text-sm break-all">{deploymentUrl}</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={viewGeneratedPortfolio} className="flex-1 bg-green-600 hover:bg-green-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Portfolio
                  </Button>
                  <Button
                    onClick={copyDeploymentUrl}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-xs text-gray-400">
                  <p>💡 To deploy for real:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Click "Export ZIP" to download files</li>
                    <li>Upload to Netlify, Vercel, or GitHub Pages</li>
                    <li>Your portfolio will be live on the internet!</li>
                  </ul>
                </div>

                <Button
                  onClick={() => setDeploymentUrl("")}
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {isPreviewMode ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full"
              >
                <PortfolioPreview data={portfolioData} />
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Editor Panel */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="glass-effect builder-card-hover border-white/10 text-white shadow-2xl">
                    <CardHeader className="border-b border-white/10 pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                        <Edit3 className="w-5 h-5 text-purple-400" />
                        Portfolio Editor
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-6 bg-white/5 text-xs h-auto border border-white/10 p-1 rounded-lg">
                          <TabsTrigger value="basic" className="text-xs py-2 px-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md transition-all">
                            <span className="hidden sm:inline">Basic Info</span>
                            <span className="sm:hidden">Basic</span>
                          </TabsTrigger>
                          <TabsTrigger value="projects" className="text-xs py-2 px-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md transition-all">
                            Projects
                          </TabsTrigger>
                          <TabsTrigger value="skills" className="text-xs py-2 px-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md transition-all">
                            Skills
                          </TabsTrigger>
                          <TabsTrigger value="theme" className="text-xs py-2 px-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md transition-all">
                            Theme
                          </TabsTrigger>
                          <TabsTrigger value="chatbot" className="text-xs py-2 px-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md transition-all">
                            <span className="hidden sm:inline">AI Chat</span>
                            <span className="sm:hidden">AI</span>
                          </TabsTrigger>
                          <TabsTrigger value="settings" className="text-xs py-2 px-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md transition-all">
                            <span className="hidden sm:inline">Settings</span>
                            <span className="sm:hidden">Set</span>
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-6 mt-6">
                          {/* Profile Picture Section */}
                          <div className="space-y-4">
                            <Label className="text-white">Profile Picture</Label>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                              <div className="relative">
                                <div
                                  className="w-20 h-20 rounded-full bg-gradient-to-r flex items-center justify-center text-white text-2xl font-bold overflow-hidden"
                                  style={{
                                    background: portfolioData.profilePicture
                                      ? "transparent"
                                      : `linear-gradient(45deg, ${portfolioData.theme.primaryColor}, ${portfolioData.theme.secondaryColor})`,
                                  }}
                                >
                                  {portfolioData.profilePicture ? (
                                    <img
                                      src={portfolioData.profilePicture || "/placeholder.svg"}
                                      alt="Profile"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : portfolioData.name ? (
                                    portfolioData.name.charAt(0).toUpperCase()
                                  ) : (
                                    <User className="w-8 h-8" />
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Button
                                  onClick={() => fileInputRef.current?.click()}
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700 text-xs md:text-sm"
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload Photo
                                </Button>
                                {portfolioData.profilePicture && (
                                  <Button
                                    onClick={removeProfilePicture}
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white text-xs md:text-sm"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove
                                  </Button>
                                )}
                              </div>
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleProfilePictureUpload}
                              className="hidden"
                            />
                            <p className="text-xs text-gray-400">
                              Upload a profile picture (max 5MB). Supports JPG, PNG, GIF formats.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="name" className="text-white mb-2 block">Full Name</Label>
                              <Input
                                id="name"
                                value={portfolioData.name}
                                onChange={(e) => updatePortfolioData("name", e.target.value)}
                                placeholder="John Doe"
                                className="bg-white/5 border-white/20 text-white input-glow transition-all"
                              />
                            </div>
                            <div>
                              <Label htmlFor="title" className="text-white mb-2 block">Professional Title</Label>
                              <Input
                                id="title"
                                value={portfolioData.title}
                                onChange={(e) => updatePortfolioData("title", e.target.value)}
                                placeholder="Full Stack Developer"
                                className="bg-white/5 border-white/20 text-white input-glow transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={portfolioData.bio}
                              onChange={(e) => updatePortfolioData("bio", e.target.value)}
                              placeholder="Tell us about yourself..."
                              rows={4}
                              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={portfolioData.email}
                                onChange={(e) => updatePortfolioData("email", e.target.value)}
                                placeholder="john@example.com"
                                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                              />
                            </div>
                            <div>
                              <Label htmlFor="github">GitHub</Label>
                              <Input
                                id="github"
                                value={portfolioData.github}
                                onChange={(e) => updatePortfolioData("github", e.target.value)}
                                placeholder="https://github.com/johndoe"
                                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                              />
                            </div>
                            <div>
                              <Label htmlFor="linkedin">LinkedIn</Label>
                              <Input
                                id="linkedin"
                                value={portfolioData.linkedin}
                                onChange={(e) => updatePortfolioData("linkedin", e.target.value)}
                                placeholder="https://linkedin.com/in/johndoe"
                                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="projects" className="space-y-6 mt-6">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <h3 className="text-lg font-semibold">Projects</h3>
                            <Button
                              onClick={addProject}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Project
                            </Button>
                          </div>

                          <div className="space-y-4">
                            {portfolioData.projects.length === 0 ? (
                              <div className="text-center py-12 text-gray-400">
                                <p className="mb-4">No projects added yet.</p>
                                <Button onClick={addProject} className="bg-purple-600 hover:bg-purple-700 text-white">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Your First Project
                                </Button>
                              </div>
                            ) : (
                              portfolioData.projects.map((project) => (
                                <ProjectEditor
                                  key={project.id}
                                  project={project}
                                  onUpdate={(updatedProject) => updateProject(project.id, updatedProject)}
                                  onDelete={() => deleteProject(project.id)}
                                />
                              ))
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="skills" className="space-y-6 mt-6">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <h3 className="text-lg font-semibold">Skills</h3>
                            <Button
                              onClick={addSkill}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Skill
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            {portfolioData.skills.length === 0 ? (
                              <div className="text-center py-12 text-gray-400">
                                <p className="mb-4">No skills added yet.</p>
                                <Button onClick={addSkill} className="bg-purple-600 hover:bg-purple-700 text-white">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Your First Skill
                                </Button>
                              </div>
                            ) : (
                              portfolioData.skills.map((skill) => (
                                <Card key={skill.id} className="bg-white/5 border-white/20">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <Input
                                        value={skill.name}
                                        onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                                        className="bg-transparent border-none text-white p-0 font-semibold"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteSkill(skill.id)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <div className="space-y-2">
                                      <Select
                                        value={skill.category}
                                        onValueChange={(value) => updateSkill(skill.id, { category: value })}
                                      >
                                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Frontend">Frontend</SelectItem>
                                          <SelectItem value="Backend">Backend</SelectItem>
                                          <SelectItem value="Database">Database</SelectItem>
                                          <SelectItem value="DevOps">DevOps</SelectItem>
                                          <SelectItem value="Design">Design</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="range"
                                          min="0"
                                          max="100"
                                          value={skill.level}
                                          onChange={(e) =>
                                            updateSkill(skill.id, { level: Number.parseInt(e.target.value) })
                                          }
                                          className="flex-1 accent-purple-500"
                                        />
                                        <span className="text-sm text-gray-400 w-12">{skill.level}%</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="theme" className="mt-6">
                          <ThemeCustomizer
                            theme={portfolioData.theme}
                            themes={defaultThemes}
                            onThemeChange={(theme) => updatePortfolioData("theme", theme)}
                          />
                        </TabsContent>

                        <TabsContent value="settings" className="space-y-6 mt-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor="animations">Enable Animations</Label>
                                <p className="text-sm text-gray-400">Toggle animations and effects</p>
                              </div>
                              <Switch
                                id="animations"
                                checked={portfolioData.animations}
                                onCheckedChange={(checked) => updatePortfolioData("animations", checked)}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor="sound">Sound Effects</Label>
                                <p className="text-sm text-gray-400">Enable interaction sound effects</p>
                              </div>
                              <Switch
                                id="sound"
                                checked={portfolioData.soundEffects}
                                onCheckedChange={(checked) => updatePortfolioData("soundEffects", checked)}
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="chatbot" className="mt-6">
                          <ChatbotConfig
                            config={portfolioData.chatbot || { enabled: false, apiKey: "", systemPrompt: "You are a helpful portfolio assistant." }}
                            onChange={(config) => updatePortfolioData("chatbot", config)}
                          />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>

                {/* Live Preview Panel - Hidden on mobile when in edit mode */}
                <div className="hidden lg:block lg:col-span-1">
                  <Card className="glass-effect builder-card-hover border-white/10 text-white sticky top-24 shadow-2xl">
                    <CardHeader className="border-b border-white/10 pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-purple-400" />
                        Live Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="aspect-[9/16] bg-black/40 rounded-lg overflow-hidden border border-white/10 shadow-inner">
                        <PortfolioPreview data={portfolioData} isCompact />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Portfolio Chatbot */}
      <PortfolioChatbot apiKey={portfolioData.chatbot?.apiKey} />
    </>
  )
}
