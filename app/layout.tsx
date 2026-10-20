import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Portfolio Builder: AI Portfolio Website Maker",
    template: "%s | Portfolio Builder",
  },
  description:
    "Build a fast, animated portfolio website in minutes. AI writes your bio and project descriptions, imports your resume, and designs themes. Download it or deploy to Netlify in one click. No sign-up.",
  keywords: ["portfolio builder", "developer portfolio", "AI portfolio", "personal website", "Netlify"],
  openGraph: {
    title: "Portfolio Builder: AI Portfolio Website Maker",
    description: "Animated themes, AI writing help and one-click Netlify deploy. No sign-up required.",
    type: "website",
  },
}

export const viewport: Viewport = { width: "device-width", initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
