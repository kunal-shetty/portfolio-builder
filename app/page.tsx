"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Zap, Palette, Code, Download, Globe } from "lucide-react"
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

  useEffect(() => {
    setIsLoaded(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const features = [
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Ultra-Modern UI",
      description: "Crazy animations, parallax effects, and morphing elements",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Customization",
      description: "Live preview with instant theme and layout changes",
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Export & Deploy",
      description: "One-click deployment to Netlify or download code",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Responsive Design",
      description: "Perfect on all devices with smooth animations",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <ParticlesBackground />
      <FloatingElements />
{/* Navigation Bar */}


      {/* Custom cursor */}
      <motion.div
        className="fixed w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
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
            className="flex justify-center items-center"
          >
            <Link href="/builder">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 text-base font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
              >
                Start Building
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-2 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Insane Features
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to create mind-blowing portfolios that stand out
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  z: 50,
                }}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="text-purple-400 mb-6 group-hover:text-pink-400 transition-colors duration-300"
                >
                  {feature.icon}
                </motion.div>

                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-8 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            Ready to Go Viral?
          </h2>

          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of creators who've built stunning portfolios that get noticed
          </p>

          <Link href="/builder">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-yellow-500 via-red-500 to-pink-500 hover:from-yellow-600 hover:via-red-600 hover:to-pink-600 text-white px-12 py-6 text-xl font-bold rounded-full transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-red-500/25"
            >
              <Download className="mr-3 w-6 h-6 group-hover:animate-bounce" />
              Build Your Portfolio Now
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
