"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Zap, Palette, Code, Download, Globe, MessageCircle, X, Send, Layers, Rocket, Users, Star, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ParticlesBackground from "./components/ParticlesBackground"
import AnimatedBlob from "./components/AnimatedBlob"
import TypewriterText from "./components/TypewriterText"
import GlitchText from "./components/GlitchText"
import FloatingElements from "./components/FloatingElements"

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: string, content: string }[]>([
    { role: "assistant", content: "Hi! I'm your Portfolio Builder assistant. How can I help you today?" }
  ])
  const [chatInput, setChatInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatInput("")
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        "how": "To get started, click 'Start Building' and fill in your details. You can customize colors, fonts, and layouts in real-time!",
        "template": "We have several templates: Neon Cyber, Minimal Clean, Brutalist, Glass Morphism, and more. Check out our Templates page!",
        "deploy": "You can export your portfolio as a ZIP file and upload it to Netlify, Vercel, or GitHub Pages. It's that simple!",
        "help": "I can help you with: creating your portfolio, choosing templates, customizing themes, adding projects, and deploying your site.",
        "feature": "Key features include: real-time preview, custom themes, animated effects, project showcase, skills section, and one-click export.",
        "default": "I'd be happy to help! You can ask me about templates, deployment, features, or how to get started with building your portfolio."
      }

      const lowerMessage = userMessage.toLowerCase()
      let response = responses.default

      for (const [key, value] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
          response = value
          break
        }
      }

      setChatMessages(prev => [...prev, { role: "assistant", content: response }])
      setIsTyping(false)
    }, 1000)
  }

  const features = [
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Ultra-Modern UI",
      description: "Crazy animations, parallax effects, and morphing elements that make your portfolio stand out.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Customization",
      description: "See changes instantly with live preview. Customize themes, fonts, and layouts on the fly.",
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Export & Deploy",
      description: "Download your portfolio as a ZIP or deploy directly to Netlify.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Responsive Design",
      description: "Your portfolio looks perfect on all devices - mobile, tablet, and desktop.",
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: "Multiple Templates",
      description: "Choose from Neon Cyber, Minimal, Brutalist, Glass Morphism, and more unique styles.",
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "SEO Optimized",
      description: "Built-in SEO best practices to help your portfolio rank higher in search results.",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Frontend Developer",
      content: "This portfolio builder helped me land my dream job! The animations are incredible.",
      avatar: "SC",
    },
    {
      name: "Mike Johnson",
      role: "UI/UX Designer",
      content: "The customization options are endless. I created a unique portfolio in just 30 minutes.",
      avatar: "MJ",
    },
    {
      name: "Emily Davis",
      role: "Full Stack Developer",
      content: "Best portfolio builder I've used. The export feature is seamless and the result is stunning.",
      avatar: "ED",
    },
  ]

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      features: ["Basic templates", "Export as ZIP", "Community support", "Standard animations"],
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$19",
      features: ["All templates", "One-click deploy", "Priority support", "Advanced animations", "Custom domain", "Analytics"],
      highlighted: true,
    },
    {
      name: "Team",
      price: "$49",
      features: ["Everything in Pro", "Team collaboration", "White-label option", "API access", "Dedicated support"],
      highlighted: false,
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <ParticlesBackground />
      <FloatingElements />

      {/* Custom cursor - hidden on mobile */}
      <motion.div
        className="fixed w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <AnimatedBlob />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center z-10 max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-8"
          >
            <GlitchText text="PORTFOLIO" className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-4" />
            <TypewriterText
              text="BUILDER"
              className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
          >
            Create stunning, animated portfolios with crazy effects, real-time customization, and one-click deployment.
            No coding required.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Link href="/builder">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-base font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 w-full sm:w-auto"
              >
                Start Building
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/templates">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-purple-500 text-purple-400 hover:bg-purple-500/20 px-8 py-4 text-base font-semibold rounded-full transition-all duration-300 w-full sm:w-auto bg-transparent"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                View Templates
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Insane Features
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to create mind-blowing portfolios that stand out from the crowd
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="group relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="text-purple-400 mb-4 md:mb-6 group-hover:text-pink-400 transition-colors duration-300">
                  {feature.icon}
                </div>

                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-white group-hover:text-purple-300 transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-sm md:text-base text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 relative bg-gradient-to-b from-transparent via-purple-900/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
              Create your stunning portfolio in just 3 simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Choose Template", description: "Pick from our collection of stunning templates or start from scratch" },
              { step: "02", title: "Customize", description: "Add your info, projects, skills, and customize colors and fonts" },
              { step: "03", title: "Deploy", description: "Export your portfolio and deploy it to your favorite hosting platform" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-6xl md:text-7xl font-black text-purple-500/30 mb-4">{item.step}</div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Loved by Developers
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
              Join thousands of developers who've built stunning portfolios
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 italic">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 px-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            Ready to Go Viral?
          </h2>

          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of creators who've built stunning portfolios that get noticed and land dream jobs
          </p>

          <Link href="/builder">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-yellow-500 via-red-500 to-pink-500 hover:from-yellow-600 hover:via-red-600 hover:to-pink-600 text-white px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl font-bold rounded-full transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-red-500/25"
            >
              <Download className="mr-3 w-5 h-5 md:w-6 md:h-6 group-hover:animate-bounce" />
              Build Your Portfolio Now
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            Made with ❤️ by Kunal
          </p>
        </div>
      </footer>

    </div>
  )
}
