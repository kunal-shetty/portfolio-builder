"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"

/**
 * Product demo (rendered with Remotion, see /demos). Loads only when scrolled into view,
 * plays muted while visible (browsers only autoplay muted video), and has a sound toggle
 * for the background music. Never autoplays for people who prefer reduced motion.
 */
export default function DemoVideo({
  src,
  poster,
  title,
  className = "",
}: {
  src: string
  poster: string
  title: string
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setReducedMotion(reduce)
    if (reduce) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.35 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  const toggleSound = () => {
    const video = ref.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
    // Turning sound on is a user gesture, so playback is allowed from here.
    if (!video.muted) video.play().catch(() => {})
  }

  return (
    <div className="relative">
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted={muted}
        loop
        playsInline
        preload="none"
        controls={reducedMotion}
        aria-label={title}
        className={`block aspect-video w-full ${className}`}
      />
      {!reducedMotion && (
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          aria-pressed={!muted}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:bg-black/80"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {muted ? "Sound off" : "Sound on"}
        </button>
      )}
    </div>
  )
}
