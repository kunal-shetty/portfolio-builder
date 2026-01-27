import JSZip from "jszip"

interface PortfolioData {
    name: string
    title: string
    bio: string
    email: string
    github: string
    linkedin: string
    profilePicture: string
    projects: any[]
    skills: any[]
    theme: {
        name: string
        primaryColor: string
        secondaryColor: string
        backgroundColor: string
        textColor: string
        font: string
    }
    animations: boolean
}

export async function generateNextJSPortfolio(data: PortfolioData): Promise<Blob> {
    const zip = new JSZip()

    // Package.json
    zip.file("package.json", JSON.stringify({
        name: data.name?.toLowerCase().replace(/\s+/g, "-") || "portfolio",
        version: "1.0.0",
        private: true,
        scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
            lint: "next lint"
        },
        dependencies: {
            react: "^19",
            "react-dom": "^19",
            next: "15.2.4",
            "framer-motion": "latest",
            three: "latest",
            postprocessing: "latest"
        },
        devDependencies: {
            "@types/node": "^22",
            "@types/react": "^19",
            "@types/react-dom": "^19",
            "@types/three": "latest",
            typescript: "^5"
        }
    }, null, 2))

    // next.config.js for static export
    zip.file("next.config.js", `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true
}

module.exports = nextConfig
`)

    // tsconfig.json
    zip.file("tsconfig.json", JSON.stringify({
        compilerOptions: {
            target: "ES2017",
            lib: ["dom", "dom.iterable", "esnext"],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: "esnext",
            moduleResolution: "bundler",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "preserve",
            incremental: true,
            plugins: [{ name: "next" }],
            paths: { "@/*": ["./*"] }
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"]
    }, null, 2))

    // README.md
    zip.file("README.md", `# ${data.name || "Portfolio"} Website

Built with Portfolio Builder

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build for Production

\`\`\`bash
npm run build
\`\`\`

The static files will be in the \`out\` directory.

## Deploy

Upload the \`out\` folder to any static hosting service (Netlify, Vercel, GitHub Pages, etc.)
`)

    // .gitignore
    zip.file(".gitignore", `node_modules
.next
out
.DS_Store
*.log
`)

    // Generate the portfolio page based on template
    const isNeonCyber = data.theme.name === "Neon Cyber"

    if (isNeonCyber) {
        // Neon Cyber template files
        await generateNeonCyberTemplate(zip, data)
    } else {
        // Generic template
        await generateGenericTemplate(zip, data)
    }

    return await zip.generateAsync({ type: "blob" })
}

async function generateNeonCyberTemplate(zip: JSZip, data: PortfolioData) {
    // app/page.tsx
    zip.file("app/page.tsx", generateNeonCyberPageTSX(data))

    // app/layout.tsx
    zip.file("app/layout.tsx", `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '${data.name || "Portfolio"} - ${data.title || "Developer"}',
  description: '${data.bio || "Professional portfolio"}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
`)

    // app/globals.css
    zip.file("app/globals.css", `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #0a0a0a;
  color: #ffffff;
  overflow-x: hidden;
}

@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`)

    // tailwind.config.js
    zip.file("tailwind.config.js", `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`)

    // postcss.config.js
    zip.file("postcss.config.js", `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`)

    // components/Hyperspeed.tsx - Copy the hyperspeed component
    zip.file("components/Hyperspeed.tsx", await fetch('/builder/components/HyperspeedBackground.tsx').then(r => r.text()).catch(() => '// Hyperspeed component'))
}

async function generateGenericTemplate(zip: JSZip, data: PortfolioData) {
    // Simple HTML-based template for non-Neon Cyber
    zip.file("app/page.tsx", `export default function Home() {
  return (
    <div style={{ fontFamily: '${data.theme.font}', backgroundColor: '${data.theme.backgroundColor}', color: '${data.theme.textColor}', minHeight: '100vh', padding: '2rem' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <section style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>${data.name || "Your Name"}</h1>
          <h2 style={{ fontSize: '1.5rem', color: '${data.theme.primaryColor}', marginBottom: '2rem' }}>${data.title || "Your Title"}</h2>
          <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem', opacity: 0.8 }}>${data.bio || "Your bio"}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            ${data.email ? `<a href="mailto:${data.email}" style={{ padding: '0.75rem 1.5rem', background: '${data.theme.primaryColor}', color: 'white', borderRadius: '0.5rem', textDecoration: 'none' }}>Contact</a>` : ''}
            ${data.github ? `<a href="${data.github}" target="_blank" style={{ padding: '0.75rem 1.5rem', border: '2px solid ${data.theme.primaryColor}', color: '${data.theme.primaryColor}', borderRadius: '0.5rem', textDecoration: 'none' }}>GitHub</a>` : ''}
          </div>
        </section>
        
        ${data.projects.length > 0 ? `
        <section style={{ padding: '4rem 0' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '3rem', color: '${data.theme.primaryColor}' }}>Projects</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            ${data.projects.map(p => `
              <div style={{ border: '1px solid ${data.theme.primaryColor}40', borderRadius: '1rem', overflow: 'hidden' }}>
                <img src="${p.image}" alt="${p.title}" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '${data.theme.primaryColor}' }}>${p.title}</h3>
                  <p style={{ opacity: 0.8, marginBottom: '1rem' }}>${p.description}</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" style={{ padding: '0.5rem 1rem', background: '${data.theme.primaryColor}', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.875rem' }}>Live</a>` : ''}
                    ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" style={{ padding: '0.5rem 1rem', border: '2px solid ${data.theme.primaryColor}', color: '${data.theme.primaryColor}', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.875rem' }}>Code</a>` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}
      </main>
    </div>
  )
}
`)

    zip.file("app/layout.tsx", `export const metadata = {
  title: '${data.name || "Portfolio"}',
  description: '${data.bio || "Portfolio"}',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`)
}

function generateNeonCyberPageTSX(data: PortfolioData): string {
    return `'use client'

import { motion } from 'framer-motion'
import Hyperspeed from '../components/Hyperspeed'

export default function Home() {
  return (
    <div style={{ fontFamily: 'Orbitron, sans-serif', backgroundColor: '#0a0a0a', color: '#FFFFFF', minHeight: '100vh', position: 'relative' }}>
      {/* Hyperspeed Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        <Hyperspeed />
      </div>

      {/* Scanline Effect */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.15) 3px)',
        opacity: 0.1
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 20 }}>
        {/* Hero Section */}
        <section style={{ padding: '4rem 2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {/* Avatar */}
          <div style={{ width: '10rem', height: '10rem', position: 'relative', marginBottom: '2rem' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(to right, #8B5CF6, #EC4899)', filter: 'blur(2rem)', opacity: 0.6, animation: 'pulse 3s infinite' }} />
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'white',
              overflow: 'hidden',
              border: '4px solid rgba(139, 92, 246, 0.5)',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(236, 72, 153, 0.3)'
            }}>
              ${data.profilePicture ? `<img src="${data.profilePicture}" alt="${data.name}" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />` : `${data.name?.charAt(0).toUpperCase() || '?'}`}
            </div>
          </div>

          {/* Name */}
          <h1 style={{
            fontSize: 'clamp(2rem, 8vw, 4rem)',
            fontWeight: 900,
            marginBottom: '1rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            textShadow: '0 0 10px #8B5CF6, 0 0 20px #8B5CF6, 0 0 40px #8B5CF6, 0 0 80px #EC4899',
            background: 'linear-gradient(to right, #8B5CF6, #EC4899, #8B5CF6)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradient 3s ease infinite'
          }}>
            ${data.name || "YOUR NAME"}
          </h1>

          {/* Title */}
          <h2 style={{
            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
            marginBottom: '1.5rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#22D3EE',
            textShadow: '0 0 10px #22D3EE'
          }}>
            ${data.title || "YOUR TITLE"}
          </h2>

          {/* Bio */}
          <p style={{ fontSize: 'clamp(0.875rem, 2vw, 1.125rem)', maxWidth: '48rem', margin: '0 auto 2rem', opacity: 0.8, padding: '0 1rem', lineHeight: 1.6 }}>
            ${data.bio || "Your bio will appear here..."}
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            ${data.email ? `
            <a href="mailto:${data.email}" style={{
              padding: '0.75rem 1.5rem',
              fontWeight: 'bold',
              borderRadius: '9999px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
              color: 'white',
              transition: 'transform 0.3s'
            }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              CONTACT
            </a>
            ` : ''}
            ${data.github ? `
            <a href="${data.github}" target="_blank" rel="noopener noreferrer" style={{
              padding: '0.75rem 1.5rem',
              fontWeight: 'bold',
              borderRadius: '9999px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              border: '2px solid #8B5CF6',
              color: 'white',
              background: 'transparent',
              boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.3s'
            }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'transparent' }}>
              GITHUB
            </a>
            ` : ''}
          </div>
        </section>

        ${data.projects.length > 0 ? `
        {/* Projects Section */}
        <section style={{ padding: '4rem 2rem' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            fontWeight: 900,
            textAlign: 'center',
            marginBottom: '3rem',
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            textShadow: '0 0 10px #8B5CF6, 0 0 20px #8B5CF6',
            background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            PROJECTS
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', maxWidth: '90rem', margin: '0 auto' }}>
            ${data.projects.map(p => `
              <div style={{
                borderRadius: '0.75rem',
                overflow: 'hidden',
                background: 'rgba(139, 92, 246, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.1)',
                transition: 'all 0.3s'
              }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)' }}>
                <img src="${p.image}" alt="${p.title}" style={{ width: '100%', height: '12rem', objectFit: 'cover' }} />
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{
                    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#EC4899',
                    textShadow: '0 0 10px rgba(236, 72, 153, 0.5)'
                  }}>
                    ${p.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.75rem' }}>${p.description}</p>
                  ${p.technologies?.length > 0 ? `
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    ${p.technologies.map((tech: string) => `
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        background: 'rgba(139, 92, 246, 0.2)',
                        border: '1px solid rgba(139, 92, 246, 0.5)',
                        color: '#A78BFA'
                      }}>
                        ${tech}
                      </span>
                    `).join('')}
                  </div>
                  ` : ''}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    ${p.liveUrl ? `
                    <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" style={{
                      fontSize: '0.875rem',
                      padding: '0.5rem 1rem',
                      fontWeight: 'bold',
                      borderRadius: '0.5rem',
                      flex: 1,
                      textAlign: 'center',
                      textDecoration: 'none',
                      background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                      boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)',
                      color: 'white',
                      transition: 'transform 0.3s'
                    }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                      LIVE
                    </a>
                    ` : ''}
                    ${p.githubUrl ? `
                    <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" style={{
                      fontSize: '0.875rem',
                      padding: '0.5rem 1rem',
                      fontWeight: 'bold',
                      borderRadius: '0.5rem',
                      flex: 1,
                      textAlign: 'center',
                      textDecoration: 'none',
                      border: '2px solid #8B5CF6',
                      color: 'white',
                      background: 'transparent',
                      transition: 'all 0.3s'
                    }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'transparent' }}>
                      CODE
                    </a>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}
      </div>
    </div>
  )
}
`
}
