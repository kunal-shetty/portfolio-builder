"use client"

import { motion } from "framer-motion"
import { Github, ExternalLink, Mail, Linkedin, User } from "lucide-react"
import Hyperspeed from "./HyperspeedBackground"

interface NeonCyberTemplateProps {
    data: any
    isCompact?: boolean
}

export default function NeonCyberTemplate({ data, isCompact = false }: NeonCyberTemplateProps) {
    const { name, title, bio, email, github, linkedin, profilePicture, projects, skills } = data

    return (
        <div
            className={`${isCompact ? "w-full h-full overflow-y-auto" : "w-full min-h-screen"} relative`}
            style={{
                fontFamily: "'Orbitron', sans-serif",
                backgroundColor: "#0a0a0a",
                color: "#FFFFFF",
            }}
        >
            {/* Hyperspeed Background */}
            {!isCompact && (
                <div className="fixed inset-0 z-[-1]">
                    <Hyperspeed
  effectOptions={{"distortion":"turbulentDistortion","length":400,"roadWidth":10,"islandWidth":2,"lanesPerRoad":3,"fov":90,"fovSpeedUp":150,"speedUp":2,"carLightsFade":0.4,"totalSideLightSticks":20,"lightPairsPerRoadWay":40,"shoulderLinesWidthPercentage":0.05,"brokenLinesWidthPercentage":0.1,"brokenLinesLengthPercentage":0.5,"lightStickWidth":[0.12,0.5],"lightStickHeight":[1.3,1.7],"movingAwaySpeed":[60,80],"movingCloserSpeed":[-120,-160],"carLightsLength":[12,80],"carLightsRadius":[0.05,0.14],"carWidthPercentage":[0.3,0.5],"carShiftX":[-0.8,0.8],"carFloorSeparation":[0,5],"colors":{"roadColor":526344,"islandColor":657930,"background":0,"shoulderLines":1250072,"brokenLines":1250072,"leftCars":[14177983,6770850,12732332],"rightCars":[242627,941733,3294549],"sticks":242627}}}
/>
                </div>
            )}

            {/* Scanline Effect */}
            <div
                className="fixed inset-0 pointer-events-none z-10"
                style={{
                    background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.15) 3px)",
                    opacity: 0.1,
                }}
            />

            {/* Content */}
            <div className="relative z-20">
                {/* Hero Section */}
                <section
                    className={`${isCompact ? "p-4" : "p-8 md:p-16"} text-center relative flex flex-col items-center justify-center`}
                    style={{ minHeight: isCompact ? "auto" : "100vh" }}
                >
                    {/* Glowing Avatar */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className={`${isCompact ? "w-20 h-20 mb-4" : "w-32 h-32 md:w-40 md:h-40 mb-8"} relative`}
                    >
                        {/* Glow rings */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-2xl opacity-60 animate-pulse" />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-40" style={{ animation: "spin 10s linear infinite" }} />

                        {/* Avatar */}
                        <div
                            className="relative w-full h-full rounded-full flex items-center justify-center text-white font-bold overflow-hidden border-4 border-purple-500/50"
                            style={{
                                background: profilePicture ? "transparent" : "linear-gradient(135deg, #8B5CF6, #EC4899)",
                                fontSize: isCompact ? "1.5rem" : "3rem",
                                boxShadow: "0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(236, 72, 153, 0.3)",
                            }}
                        >
                            {profilePicture ? (
                                <img src={profilePicture} alt={name || "Profile"} className="w-full h-full object-cover" />
                            ) : name ? (
                                name.charAt(0).toUpperCase()
                            ) : (
                                <User className={isCompact ? "w-8 h-8" : "w-16 h-16"} />
                            )}
                        </div>
                    </motion.div>

                    {/* Name with Neon Glow */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className={`${isCompact ? "text-2xl" : "text-4xl md:text-6xl lg:text-7xl"} font-black mb-4 tracking-widest uppercase`}
                        style={{
                            textShadow: "0 0 10px #8B5CF6, 0 0 20px #8B5CF6, 0 0 40px #8B5CF6, 0 0 80px #EC4899",
                            background: "linear-gradient(to right, #8B5CF6, #EC4899, #8B5CF6)",
                            backgroundSize: "200% auto",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            animation: "gradient 3s ease infinite",
                        }}
                    >
                        {name || "YOUR NAME"}
                    </motion.h1>

                    {/* Title */}
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className={`${isCompact ? "text-sm" : "text-lg md:text-xl lg:text-2xl"} mb-6 tracking-[0.3em] uppercase text-cyan-400`}
                        style={{
                            textShadow: "0 0 10px #22D3EE",
                        }}
                    >
                        {title || "YOUR TITLE"}
                    </motion.h2>

                    {/* Bio */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className={`${isCompact ? "text-xs" : "text-base md:text-lg"} max-w-2xl mx-auto mb-8 opacity-80 px-4 leading-relaxed`}
                    >
                        {bio || "Your bio will appear here..."}
                    </motion.p>

                    {/* Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        {email && (
                            <a
                                href={`mailto:${email}`}
                                className={`${isCompact ? "text-xs px-4 py-2" : "text-sm px-6 py-3"} font-bold rounded-full transition-all duration-300 hover:scale-110 inline-flex items-center gap-2 uppercase tracking-wider`}
                                style={{
                                    background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                                    boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
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
                                className={`${isCompact ? "text-xs px-4 py-2" : "text-sm px-6 py-3"} font-bold rounded-full transition-all duration-300 hover:scale-110 inline-flex items-center gap-2 uppercase tracking-wider border-2 border-purple-500 hover:bg-purple-500/20`}
                                style={{
                                    boxShadow: "0 0 15px rgba(139, 92, 246, 0.3)",
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
                                className={`${isCompact ? "text-xs px-4 py-2" : "text-sm px-6 py-3"} font-bold rounded-full transition-all duration-300 hover:scale-110 inline-flex items-center gap-2 uppercase tracking-wider border-2 border-cyan-400 hover:bg-cyan-400/20`}
                                style={{
                                    boxShadow: "0 0 15px rgba(34, 211, 238, 0.3)",
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
                    <section className={`${isCompact ? "p-4" : "p-8 md:p-16"} relative`}>
                        <h2
                            className={`${isCompact ? "text-xl mb-6" : "text-3xl md:text-4xl mb-12"} font-black text-center uppercase tracking-widest`}
                            style={{
                                textShadow: "0 0 10px #8B5CF6, 0 0 20px #8B5CF6",
                                background: "linear-gradient(to right, #8B5CF6, #EC4899)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Projects
                        </h2>

                        <div className={`grid ${isCompact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-6 max-w-7xl mx-auto`}>
                            {projects.map((project: any, index: number) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className="rounded-xl overflow-hidden backdrop-blur-md relative group"
                                    style={{
                                        background: "rgba(139, 92, 246, 0.05)",
                                        border: "1px solid rgba(139, 92, 246, 0.3)",
                                        boxShadow: "0 0 20px rgba(139, 92, 246, 0.1)",
                                    }}
                                >
                                    {/* Hover glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <img
                                        src={project.image || "/placeholder.svg?height=200&width=300"}
                                        alt={project.title}
                                        className={`w-full ${isCompact ? "h-32" : "h-48"} object-cover`}
                                    />
                                    <div className={`${isCompact ? "p-3" : "p-5"} relative z-10`}>
                                        <h3
                                            className={`${isCompact ? "text-sm" : "text-lg md:text-xl"} font-bold mb-2 uppercase tracking-wide`}
                                            style={{
                                                color: "#EC4899",
                                                textShadow: "0 0 10px rgba(236, 72, 153, 0.5)",
                                            }}
                                        >
                                            {project.title}
                                        </h3>
                                        <p className={`${isCompact ? "text-xs" : "text-sm"} opacity-80 mb-3`}>{project.description}</p>

                                        {project.technologies?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {project.technologies.map((tech: string, i: number) => (
                                                    <span
                                                        key={i}
                                                        className={`${isCompact ? "text-[10px] px-2 py-1" : "text-xs px-3 py-1"} rounded-full font-bold uppercase tracking-wide`}
                                                        style={{
                                                            background: "rgba(139, 92, 246, 0.2)",
                                                            border: "1px solid rgba(139, 92, 246, 0.5)",
                                                            color: "#A78BFA",
                                                        }}
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
                                                    className={`${isCompact ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2"} font-bold rounded-lg flex-1 text-center inline-flex items-center justify-center gap-1 transition-all hover:scale-105`}
                                                    style={{
                                                        background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                                                        boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)",
                                                    }}
                                                >
                                                    <ExternalLink className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
                                                    LIVE
                                                </a>
                                            )}
                                            {project.githubUrl && (
                                                <a
                                                    href={project.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`${isCompact ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2"} font-bold rounded-lg flex-1 text-center inline-flex items-center justify-center gap-1 transition-all hover:scale-105 border-2 border-purple-500 hover:bg-purple-500/20`}
                                                >
                                                    <Github className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
                                                    CODE
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
                        className={`${isCompact ? "p-4" : "p-8 md:p-16"} relative`}
                        style={{ background: "rgba(139, 92, 246, 0.03)" }}
                    >
                        <h2
                            className={`${isCompact ? "text-xl mb-6" : "text-3xl md:text-4xl mb-12"} font-black text-center uppercase tracking-widest`}
                            style={{
                                textShadow: "0 0 10px #8B5CF6, 0 0 20px #8B5CF6",
                                background: "linear-gradient(to right, #8B5CF6, #EC4899)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Skills
                        </h2>

                        <div className={`grid ${isCompact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-6 max-w-5xl mx-auto`}>
                            {skills.map((skill: any, index: number) => (
                                <motion.div
                                    key={skill.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative"
                                >
                                    <div className="flex justify-between mb-2">
                                        <span className={`${isCompact ? "text-xs" : "text-sm md:text-base"} font-bold uppercase tracking-wide text-cyan-400`}>
                                            {skill.name}
                                        </span>
                                        <span className={`${isCompact ? "text-xs" : "text-sm"} font-bold text-purple-400`}>{skill.level}%</span>
                                    </div>
                                    <div
                                        className={`${isCompact ? "h-2" : "h-3"} rounded-full overflow-hidden relative`}
                                        style={{
                                            background: "rgba(139, 92, 246, 0.2)",
                                            border: "1px solid rgba(139, 92, 246, 0.3)",
                                        }}
                                    >
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${skill.level}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                            className="h-full rounded-full relative overflow-hidden"
                                            style={{
                                                background: "linear-gradient(90deg, #8B5CF6, #EC4899)",
                                                boxShadow: "0 0 10px rgba(139, 92, 246, 0.8)",
                                            }}
                                        >
                                            {/* Animated shine effect */}
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    background: "repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.3) 10px, transparent 20px)",
                                                    animation: "shimmer 2s linear infinite",
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
                <section className={`${isCompact ? "p-4" : "p-8 md:p-16"} text-center relative`}>
                    <h2
                        className={`${isCompact ? "text-xl mb-4" : "text-3xl md:text-4xl mb-6"} font-black uppercase tracking-widest`}
                        style={{
                            textShadow: "0 0 10px #8B5CF6, 0 0 20px #8B5CF6",
                            background: "linear-gradient(to right, #8B5CF6, #EC4899)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        Get In Touch
                    </h2>
                    <p className={`${isCompact ? "text-xs" : "text-base md:text-lg"} mb-6 opacity-80`}>
                        Let's work together on your next project!
                    </p>
                    {email && (
                        <a
                            href={`mailto:${email}`}
                            className={`${isCompact ? "text-sm px-5 py-2.5" : "text-base px-8 py-4"} font-bold rounded-full inline-flex items-center gap-2 transition-all duration-300 hover:scale-110 uppercase tracking-wider`}
                            style={{
                                background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                                boxShadow: "0 0 30px rgba(139, 92, 246, 0.6)",
                            }}
                        >
                            <Mail className={isCompact ? "w-4 h-4" : "w-5 h-5"} />
                            Contact Me
                        </a>
                    )}
                </section>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
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
      `}</style>
        </div>
    )
}
