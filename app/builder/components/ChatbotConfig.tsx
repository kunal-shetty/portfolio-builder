"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Bot, Info } from "lucide-react"

interface ChatbotConfigProps {
    config: {
        enabled: boolean
        apiKey: string
        systemPrompt: string
    }
    onChange: (config: any) => void
}

export default function ChatbotConfig({ config, onChange }: ChatbotConfigProps) {
    const handleChange = (field: string, value: any) => {
        onChange({
            ...config,
            [field]: value,
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-white"
        >
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Gemini AI Chatbot</h3>
                        <p className="text-sm text-gray-400">Add an AI assistant to your portfolio</p>
                    </div>
                </div>
                <Switch
                    checked={config.enabled}
                    onCheckedChange={(checked) => handleChange("enabled", checked)}
                />
            </div>

            {config.enabled && (
                <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="space-y-2">
                        <Label>Google Gemini API Key</Label>
                        <Input
                            type="password"
                            value={config.apiKey}
                            onChange={(e) => handleChange("apiKey", e.target.value)}
                            placeholder="AIza..."
                            className="bg-black/20 border-white/10"
                        />
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            This key will be included in your public website code.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>System Instructions</Label>
                        <Textarea
                            value={config.systemPrompt}
                            onChange={(e) => handleChange("systemPrompt", e.target.value)}
                            placeholder="You are a helpful assistant..."
                            className="bg-black/20 border-white/10 min-h-[100px]"
                        />
                        <p className="text-xs text-gray-500">
                            Define how the AI should behave (e.g., "Answer questions about my skills").
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    )
}
