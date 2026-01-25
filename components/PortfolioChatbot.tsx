"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
    role: "user" | "assistant"
    content: string
}

interface PortfolioChatbotProps {
    apiKey?: string
}

export default function PortfolioChatbot({ apiKey }: PortfolioChatbotProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hi! I'm here to help you build an amazing portfolio. Ask me anything about adding projects, customizing themes, or deploying your site!"
        }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return

        const userMessage: Message = { role: "user", content: input }
        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input, apiKey })
            })

            const data = await response.json()

            if (data.error) {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: data.error
                }])
            } else {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: data.response
                }])
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again."
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <Button
                            onClick={() => setIsOpen(true)}
                            className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
                        >
                            <MessageCircle className="w-6 h-6" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className="fixed bottom-6 right-6 w-96 h-[500px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-white" />
                                <h3 className="text-white font-semibold">Portfolio Assistant</h3>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === "user"
                                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                                : "bg-gray-800 text-gray-100"
                                            }`}
                                    >
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-gray-800 text-gray-100 rounded-2xl px-4 py-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-700">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    sendMessage()
                                }}
                                className="flex gap-2"
                            >
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me anything..."
                                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
