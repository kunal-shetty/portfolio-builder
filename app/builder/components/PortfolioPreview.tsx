"use client"

import { motion } from "framer-motion"
import { Github, ExternalLink, Mail, Linkedin, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useEffect, useRef } from "react"

interface PortfolioPreviewProps {
  data: any
  isCompact?: boolean
}

export default function PortfolioPreview({ data, isCompact = false }: PortfolioPreviewProps) {
  const { name, title, bio, email, github, linkedin, profilePicture, projects, skills, theme, animations } = data
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const containerClass = isCompact ? "w-full h-full overflow-y-auto text-xs" : "w-full min-h-screen"
  const sectionClass = isCompact ? "p-4" : "p-8"

  // Simple particle effect for preview
  useEffect(() => {
    if (!animations || isCompact || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: any[] = []
    const particleCount = 30

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      })
    }

    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = theme.primaryColor + '40'

      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationId)
  }, [animations, isCompact, theme.primaryColor])

  return (
    <div
      className={`${containerClass} relative`}
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.font,
      }}
    >
      {/* Particle Canvas */}
      {animations && !isCompact && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none opacity-30"
          style={{ zIndex: 0 }}
        />
      )}

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Hero Section */}
        <motion.section
          initial={animations ? { opacity: 0, y: 50 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${sectionClass} text-center relative overflow-hidden`}
          style={{
            minHeight: isCompact ? 'auto' : '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <motion.div
            initial={animations ? { scale: 0 } : { scale: 1 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 w-full"
          >
            {/* Avatar with glow */}
            <div className="relative mx-auto mb-6" style={{ width: isCompact ? '64px' : '150px', height: isCompact ? '64px' : '150px' }}>
              {!isCompact && (
                <motion.div
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity
                  }}
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{
                    background: `linear-gradient(45deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                    transform: 'scale(1.1)',
                    zIndex: -1
                  }}
                />
              )}
              <div
                className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold overflow-hidden border-4`}
                style={{
                  background: profilePicture
                    ? "transparent"
                    : `linear-gradient(45deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                  fontSize: isCompact ? "1.5rem" : "2.5rem",
                  borderColor: theme.backgroundColor,
                }}
              >
                {profilePicture ? (
                  <img
                    src={profilePicture || "/placeholder.svg"}
                    alt={name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : name ? (
                  name.charAt(0).toUpperCase()
                ) : (
                  <User className={`${isCompact ? "w-8 h-8" : "w-16 h-16"}`} />
                )}
              </div>
            </div>

            {/* Gradient Text Name */}
            <h1
              className={`${isCompact ? "text-lg" : "text-4xl md:text-6xl"} font-bold mb-4`}
              style={{
                background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {name || "Your Name"}
            </h1>

            <h2 className={`${isCompact ? "text-sm" : "text-xl md:text-2xl"} mb-6`} style={{ color: theme.primaryColor }}>
              {title || "Your Title"}
            </h2>

            <p className={`${isCompact ? "text-xs" : "text-lg"} max-w-2xl mx-auto mb-8 opacity-80`}>
              {bio || "Your bio will appear here..."}
            </p>

            {/* Premium Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              {email && (
                <button
                  className={`${isCompact ? "text-xs px-4 py-2" : "text-sm px-7 py-3.5"} font-semibold rounded-full transition-all duration-300 hover:transform hover:-translate-y-1 uppercase tracking-wider`}
                  style={{
                    background: `linear-gradient(45deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                    color: 'white',
                    boxShadow: `0 4px 15px ${theme.primaryColor}40`
                  }}
                >
                  <Mail className={`${isCompact ? "w-3 h-3" : "w-4 h-4"} inline mr-2`} />
                  Contact Me
                </button>
              )}
              {github && (
                <button
                  className={`${isCompact ? "text-xs px-4 py-2" : "text-sm px-7 py-3.5"} font-semibold rounded-full transition-all duration-300 hover:transform hover:-translate-y-1 uppercase tracking-wider`}
                  style={{
                    backgroundColor: "transparent",
                    color: theme.primaryColor,
                    border: `2px solid ${theme.primaryColor}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.primaryColor
                    e.currentTarget.style.color = theme.backgroundColor
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.color = theme.primaryColor
                  }}
                >
                  <Github className={`${isCompact ? "w-3 h-3" : "w-4 h-4"} inline mr-2`} />
                  GitHub
                </button>
              )}
              {linkedin && (
                <button
                  className={`${isCompact ? "text-xs px-4 py-2" : "text-sm px-7 py-3.5"} font-semibold rounded-full transition-all duration-300 hover:transform hover:-translate-y-1 uppercase tracking-wider`}
                  style={{
                    backgroundColor: "transparent",
                    color: theme.primaryColor,
                    border: `2px solid ${theme.primaryColor}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.primaryColor
                    e.currentTarget.style.color = theme.backgroundColor
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.color = theme.primaryColor
                  }}
                >
                  <Linkedin className={`${isCompact ? "w-3 h-3" : "w-4 h-4"} inline mr-2`} />
                  LinkedIn
                </button>
              )}
            </div>
          </motion.div>
        </motion.section>

        {/* Projects Section */}
        {projects.length > 0 && (
          <section className={sectionClass}>
            <motion.h2
              initial={animations ? { opacity: 0, x: -50 } : { opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              className={`${isCompact ? "text-lg" : "text-3xl"} font-bold mb-12 text-center`}
              style={{
                background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Projects
            </motion.h2>

            <div className={`grid ${isCompact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-6`}>
              {projects.map((project: any, index: number) => (
                <motion.div
                  key={project.id}
                  initial={animations ? { opacity: 0, y: 50 } : { opacity: 1, y: 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={animations ? { scale: 1.02, y: -10 } : {}}
                  className="h-full"
                >
                  <Card
                    className="overflow-hidden border shadow-lg hover:shadow-2xl transition-all duration-400 h-full flex flex-col relative"
                    style={{
                      backgroundColor: theme.backgroundColor === '#000000' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderColor: `${theme.primaryColor}20`
                    }}
                  >
                    <div className="relative">
                      <Image
                        src={project.image || "/placeholder.svg?height=200&width=300"}
                        alt={project.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                    </div>

                    <CardContent className={`${isCompact ? "p-3" : "p-6"} flex-1 flex flex-col`}>
                      <h3 className={`${isCompact ? "text-sm" : "text-xl"} font-bold mb-2`} style={{ color: theme.primaryColor }}>
                        {project.title}
                      </h3>
                      <p className={`${isCompact ? "text-xs" : "text-sm"} opacity-80 mb-4 flex-1`}>
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies?.map((tech: string, techIndex: number) => (
                          <span
                            key={techIndex}
                            className={`${isCompact ? "text-xs px-2 py-1" : "text-xs px-3 py-1.5"} rounded-full font-medium`}
                            style={{
                              backgroundColor: `${theme.primaryColor}20`,
                              color: theme.primaryColor,
                              border: `1px solid ${theme.primaryColor}40`
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-auto">
                        {project.liveUrl && (
                          <button
                            className={`${isCompact ? "text-xs px-3 py-2" : "text-sm px-4 py-2"} font-semibold rounded-lg flex-1 transition-all duration-300`}
                            style={{
                              background: `linear-gradient(45deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                              color: 'white'
                            }}
                          >
                            <ExternalLink className={`${isCompact ? "w-3 h-3" : "w-4 h-4"} inline mr-2`} />
                            Live Demo
                          </button>
                        )}
                        {project.githubUrl && (
                          <button
                            className={`${isCompact ? "text-xs px-3 py-2" : "text-sm px-4 py-2"} font-semibold rounded-lg flex-1 transition-all duration-300`}
                            style={{
                              backgroundColor: "transparent",
                              color: theme.primaryColor,
                              border: `2px solid ${theme.primaryColor}`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.primaryColor
                              e.currentTarget.style.color = theme.backgroundColor
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent"
                              e.currentTarget.style.color = theme.primaryColor
                            }}
                          >
                            <Github className={`${isCompact ? "w-3 h-3" : "w-4 h-4"} inline mr-2`} />
                            Code
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <section className={sectionClass} style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <motion.h2
              initial={animations ? { opacity: 0, x: -50 } : { opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              className={`${isCompact ? "text-lg" : "text-3xl"} font-bold mb-12 text-center`}
              style={{
                background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Skills
            </motion.h2>

            <div className={`grid ${isCompact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-6`}>
              {skills.map((skill: any, index: number) => (
                <motion.div
                  key={skill.id}
                  initial={animations ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="mb-6"
                >
                  <div className="flex justify-between mb-2">
                    <h3 className={`${isCompact ? "text-sm" : "text-base"} font-semibold`}>{skill.name}</h3>
                    <span className={`${isCompact ? "text-xs" : "text-sm"} opacity-70`}>{skill.level}%</span>
                  </div>
                  <div className="relative w-full rounded-full h-2.5 overflow-hidden" style={{ backgroundColor: `${theme.primaryColor}20` }}>
                    <motion.div
                      initial={animations ? { width: 0 } : { width: `${skill.level}%` }}
                      whileInView={{ width: `${skill.level}%` }}
                      transition={{ duration: 1.5, delay: index * 0.1 }}
                      className="h-full rounded-full relative overflow-hidden"
                      style={{
                        background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                      }}
                    >
                      {/* Animated stripes */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 10px, transparent 10px, transparent 20px)',
                          animation: 'stripe-animation 1s linear infinite'
                        }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section className={`${sectionClass} text-center`}>
          <motion.h2
            initial={animations ? { opacity: 0, y: 50 } : { opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={`${isCompact ? "text-lg" : "text-3xl"} font-bold mb-8`}
            style={{
              background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Get In Touch
          </motion.h2>

          <motion.p
            initial={animations ? { opacity: 0 } : { opacity: 1 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`${isCompact ? "text-xs" : "text-lg"} mb-8 opacity-80`}
          >
            Let's work together on your next project!
          </motion.p>

          <motion.div
            initial={animations ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {email && (
              <button
                className={`${isCompact ? "text-sm px-6 py-3" : "text-lg px-8 py-4"} font-semibold rounded-full transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg uppercase tracking-wider`}
                style={{
                  background: `linear-gradient(45deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                  color: 'white',
                  boxShadow: `0 4px 15px ${theme.primaryColor}40`
                }}
              >
                <Mail className={`${isCompact ? "w-3 h-3" : "w-5 h-5"} inline mr-2`} />
                Message Me
              </button>
            )}
          </motion.div>
        </section>
      </div>
    </div>
  )
}
