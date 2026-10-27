"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, FileText, MousePointer2 } from "lucide-react"

// Sister apps. Links carry ?ref= so each site can see where visitors came from.
const SITES = [
  {
    name: "Resume Builder",
    tagline: "AI-assisted, ATS-friendly resumes with 10 templates and pixel-perfect PDF export.",
    href: "https://build-resume.online/?ref=portfolio-builder",
    Icon: FileText,
    accent: "from-yellow-400 to-orange-500",
    glow: "group-hover:border-orange-400/60 group-hover:shadow-orange-500/20",
  },
  {
    name: "BuildIT",
    tagline: "Design any website with free-form drag and drop, then export clean HTML.",
    href: "https://buildin-it.vercel.app/?ref=portfolio-builder",
    Icon: MousePointer2,
    accent: "from-cyan-400 to-fuchsia-500",
    glow: "group-hover:border-cyan-400/60 group-hover:shadow-cyan-500/20",
  },
]

export default function AlsoTry() {
  return (
    <section className="relative px-4 pb-24" aria-labelledby="also-try-heading">
      <div className="mx-auto max-w-4xl">
        <p id="also-try-heading" className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
          Also try, free from the same maker
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {SITES.map(({ name, tagline, href, Icon, accent, glow }, i) => (
            <motion.a
              key={name}
              href={href}
              target="_blank"
              rel="noopener"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl ${glow}`}
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent}`}>
                <Icon className="h-5 w-5 text-white" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 font-bold text-white">
                  {name}
                  <ArrowUpRight className="h-4 w-4 text-white/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-white/60">{tagline}</span>
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
