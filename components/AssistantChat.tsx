"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, Send, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { callAI } from "@/lib/ai-client"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
}

const GREETING: Message = {
  role: "assistant",
  content: "Hi! I can review your portfolio, suggest better project descriptions, or explain how to deploy. What do you need?",
}

const STARTERS = ["Review my portfolio", "How do I deploy?", "Make my bio stand out"]

/** Floating AI assistant. `context` is a text summary of the user's current portfolio. */
export default function AssistantChat({ context }: { context: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [messages, loading, open])

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || loading) return
    const next: Message[] = [...messages, { role: "user", content }]
    setMessages(next)
    setInput("")
    setLoading(true)
    try {
      const { reply } = await callAI<{ reply: string }>("chat", { messages: next.slice(1), portfolio: context })
      setMessages((m) => [...m, { role: "assistant", content: reply }])
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: (err as Error).message }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="fixed bottom-5 right-5 z-50">
            <Button
              onClick={() => setOpen(true)}
              aria-label="Open AI assistant"
              className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-900/40 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-4 right-4 z-50 flex h-[min(540px,calc(100vh-2rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl"
            role="dialog"
            aria-label="AI assistant"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-semibold">Portfolio Assistant</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8 text-white hover:bg-white/20" aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm",
                      m.role === "user" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "bg-gray-800 text-gray-100",
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2">
                  {STARTERS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border border-purple-500/40 px-3 py-1 text-xs text-purple-200 hover:bg-purple-500/20">
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-gray-800 px-3.5 py-2 text-gray-100">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="flex gap-2 border-t border-gray-700 p-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                maxLength={2000}
                className="flex-1 border-gray-700 bg-gray-800 text-white placeholder:text-gray-400"
              />
              <Button type="submit" disabled={loading || !input.trim()} aria-label="Send" className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
