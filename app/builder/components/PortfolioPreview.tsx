"use client"

import { motion } from "framer-motion"
import { Github, ExternalLink, Mail, Linkedin, User } from "lucide-react"
import NeonCyberTemplate from "./NeonCyberTemplate"

interface PortfolioPreviewProps {
  data: any
  isCompact?: boolean
}

export default function PortfolioPreview({ data, isCompact = false }: PortfolioPreviewProps) {
  const { name, title, bio, email, github, linkedin, profilePicture, projects, skills, theme, animations } = data

  // Template routing based on theme name
  if (theme?.name === "Neon Cyber") {
    return <NeonCyberTemplate data={data} isCompact={isCompact} />
  }

  // Default generic template (fallback)

  const containerStyle = {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    fontFamily: theme.font,
  }

  const primaryColor = theme.primaryColor
  const secondaryColor = theme.secondaryColor

  return (
    <div
      className={`${isCompact ? "w-full h-full overflow-y-auto" : "w-full min-h-screen"}`}
      style={containerStyle}
    >
      {/* Hero Section */}
      <section
        className={`${isCompact ? "p-4" : "p-8 md:p-16"} text-center relative`}
        style={{
          background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`,
          minHeight: isCompact ? "auto" : "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Avatar */}
        <motion.div
          initial={animations ? { scale: 0 } : { scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`${isCompact ? "w-16 h-16 mb-3" : "w-28 h-28 md:w-32 md:h-32 mb-6"} mx-auto rounded-full flex items-center justify-center text-white font-bold overflow-hidden`}
          style={{
            background: profilePicture ? "transparent" : `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
            fontSize: isCompact ? "1.25rem" : "2.5rem",
            border: `3px solid ${primaryColor}40`,
          }}
        >
          {profilePicture ? (
            <img src={profilePicture || "/placeholder.svg"} alt={name || "Profile"} className="w-full h-full object-cover" />
          ) : name ? (
            name.charAt(0).toUpperCase()
          ) : (
            <User className={isCompact ? "w-6 h-6" : "w-12 h-12"} />
          )}
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={animations ? { opacity: 0, y: 20 } : { opacity: 1 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${isCompact ? "text-xl" : "text-3xl md:text-5xl"} font-bold mb-2 md:mb-4`}
        >
          {name || "Your Name"}
        </motion.h1>

        {/* Title */}
        <motion.h2
          initial={animations ? { opacity: 0, y: 20 } : { opacity: 1 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${isCompact ? "text-sm" : "text-lg md:text-2xl"} mb-3 md:mb-6`}
          style={{ color: primaryColor }}
        >
          {title || "Your Title"}
        </motion.h2>

        {/* Bio */}
        <motion.p
          initial={animations ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`${isCompact ? "text-xs" : "text-base md:text-lg"} max-w-2xl mx-auto mb-4 md:mb-8 opacity-80 px-4`}
        >
          {bio || "Your bio will appear here..."}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={animations ? { opacity: 0, y: 20 } : { opacity: 1 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {email && (
            <a
              href={`mailto:${email}`}
              className={`${isCompact ? "text-xs px-3 py-2" : "text-sm px-5 py-3"} font-semibold rounded-lg transition-all duration-300 hover:-translate-y-1 inline-flex items-center gap-2`}
              style={{
                backgroundColor: primaryColor,
                color: theme.backgroundColor,
              }}
            >
              <Mail className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
              Contact
            </a>
          )}
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className={`${isCompact ? "text-xs px-3 py-2" : "text-sm px-5 py-3"} font-semibold rounded-lg transition-all duration-300 hover:-translate-y-1 inline-flex items-center gap-2`}
              style={{
                backgroundColor: "transparent",
                color: primaryColor,
                border: `2px solid ${primaryColor}`,
              }}
            >
              <Github className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
              GitHub
            </a>
          )}
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={`${isCompact ? "text-xs px-3 py-2" : "text-sm px-5 py-3"} font-semibold rounded-lg transition-all duration-300 hover:-translate-y-1 inline-flex items-center gap-2`}
              style={{
                backgroundColor: "transparent",
                color: primaryColor,
                border: `2px solid ${primaryColor}`,
              }}
            >
              <Linkedin className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
              LinkedIn
            </a>
          )}
        </motion.div>
      </section>

      {/* Projects Section */}
      {projects.length > 0 && (
        <section className={`${isCompact ? "p-4" : "p-8 md:p-16"}`}>
          <h2
            className={`${isCompact ? "text-lg mb-4" : "text-2xl md:text-3xl mb-8 md:mb-12"} font-bold text-center`}
            style={{ color: primaryColor }}
          >
            Projects
          </h2>

          <div className={`grid ${isCompact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-4 md:gap-6 max-w-6xl mx-auto`}>
            {projects.map((project: any, index: number) => (
              <motion.div
                key={project.id}
                initial={animations ? { opacity: 0, y: 30 } : { opacity: 1 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={animations ? { y: -5 } : {}}
                className="rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: `${primaryColor}08`,
                  border: `1px solid ${primaryColor}20`,
                }}
              >
                <img
                  src={project.image || "/placeholder.svg?height=200&width=300"}
                  alt={project.title}
                  className={`w-full ${isCompact ? "h-32" : "h-48"} object-cover`}
                />
                <div className={isCompact ? "p-3" : "p-5"}>
                  <h3 className={`${isCompact ? "text-sm" : "text-lg"} font-bold mb-2`}>{project.title}</h3>
                  <p className={`${isCompact ? "text-xs" : "text-sm"} opacity-80 mb-3`}>{project.description}</p>

                  {project.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.technologies.map((tech: string, i: number) => (
                        <span
                          key={i}
                          className={`${isCompact ? "text-[10px] px-2 py-0.5" : "text-xs px-2 py-1"} rounded-full`}
                          style={{ backgroundColor: primaryColor, color: theme.backgroundColor }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${isCompact ? "text-xs px-2 py-1.5" : "text-sm px-4 py-2"} font-semibold rounded-lg flex-1 text-center inline-flex items-center justify-center gap-1`}
                        style={{ backgroundColor: primaryColor, color: theme.backgroundColor }}
                      >
                        <ExternalLink className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
                        Live
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${isCompact ? "text-xs px-2 py-1.5" : "text-sm px-4 py-2"} font-semibold rounded-lg flex-1 text-center inline-flex items-center justify-center gap-1`}
                        style={{ backgroundColor: "transparent", color: primaryColor, border: `2px solid ${primaryColor}` }}
                      >
                        <Github className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
                        Code
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Skills Section */}
      {skills.length > 0 && (
        <section
          className={`${isCompact ? "p-4" : "p-8 md:p-16"}`}
          style={{ backgroundColor: `${primaryColor}05` }}
        >
          <h2
            className={`${isCompact ? "text-lg mb-4" : "text-2xl md:text-3xl mb-8 md:mb-12"} font-bold text-center`}
            style={{ color: primaryColor }}
          >
            Skills
          </h2>

          <div className={`grid ${isCompact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-4 max-w-4xl mx-auto`}>
            {skills.map((skill: any, index: number) => (
              <motion.div
                key={skill.id}
                initial={animations ? { opacity: 0, scale: 0.9 } : { opacity: 1 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex justify-between mb-2">
                  <span className={`${isCompact ? "text-xs" : "text-sm"} font-semibold`}>{skill.name}</span>
                  <span className={`${isCompact ? "text-xs" : "text-sm"} opacity-70`}>{skill.level}%</span>
                </div>
                <div
                  className={`${isCompact ? "h-1.5" : "h-2"} rounded-full overflow-hidden`}
                  style={{ backgroundColor: `${theme.textColor}20` }}
                >
                  <motion.div
                    initial={animations ? { width: 0 } : { width: `${skill.level}%` }}
                    whileInView={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className={`${isCompact ? "p-4" : "p-8 md:p-16"} text-center`}>
        <h2
          className={`${isCompact ? "text-lg mb-3" : "text-2xl md:text-3xl mb-6"} font-bold`}
          style={{ color: primaryColor }}
        >
          Get In Touch
        </h2>
        <p className={`${isCompact ? "text-xs" : "text-base"} mb-4 md:mb-6 opacity-80`}>
          Let's work together on your next project!
        </p>
        {email && (
          <a
            href={`mailto:${email}`}
            className={`${isCompact ? "text-sm px-4 py-2" : "text-base px-6 py-3"} font-semibold rounded-lg inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-1`}
            style={{ backgroundColor: primaryColor, color: theme.backgroundColor }}
          >
            <Mail className={isCompact ? "w-4 h-4" : "w-5 h-5"} />
            Contact Me
          </a>
        )}
      </section>
    </div>
  )
}
