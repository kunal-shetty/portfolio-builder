"use client"

import { useEffect, useRef, useState } from "react"
import { Monitor, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"

const VIEWPORTS = { desktop: 1280, mobile: 390 } as const

/**
 * Shows the generated site in a sandboxed iframe (scripts run, but it can't touch
 * this page), scaled to fit. Same HTML as the deployed site.
 */
export default function SitePreview({ html, height = 640 }: { html: string; height?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [device, setDevice] = useState<keyof typeof VIEWPORTS>("desktop")
  const [width, setWidth] = useState(0)
  const [doc, setDoc] = useState(html)

  // Debounce so typing doesn't reload the iframe on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDoc(html), 350)
    return () => clearTimeout(t)
  }, [html])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const vw = VIEWPORTS[device]
  const frameWidth = device === "mobile" ? Math.min(vw, width) : vw
  const scale = width ? Math.min(1, width / frameWidth) : 1

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-1">
        {(Object.keys(VIEWPORTS) as (keyof typeof VIEWPORTS)[]).map((d) => (
          <button
            key={d}
            onClick={() => setDevice(d)}
            aria-pressed={device === d}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
              device === d ? "bg-white/15 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white",
            )}
          >
            {d === "desktop" ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
            {d === "desktop" ? "Desktop" : "Mobile"}
          </button>
        ))}
      </div>
      <div ref={wrapRef} className="relative overflow-hidden rounded-xl border-2 border-white/10 bg-black" style={{ height }}>
        {width > 0 && (
          <iframe
            title="Portfolio preview"
            srcDoc={doc}
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
            className="absolute top-0 border-0 bg-white"
            style={{
              width: frameWidth,
              height: height / scale,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              left: device === "mobile" ? Math.max(0, (width - frameWidth * scale) / 2) : 0,
            }}
          />
        )}
      </div>
    </div>
  )
}
