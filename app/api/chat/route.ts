import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { message, apiKey } = await req.json()

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            )
        }

        const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY

        if (!key) {
            return NextResponse.json(
                { error: "API key is required. Please add your Gemini API key in the chatbot settings." },
                { status: 400 }
            )
        }

        const systemPrompt = `You are a helpful AI assistant for a Portfolio Builder application.

Your role:
- Help users create and customize their professional portfolios
- Guide them through adding projects, skills, and personal information
- Explain how to use themes, colors, and styling options
- Assist with deployment to Netlify
- Answer questions about exporting and previewing portfolios
- Provide tips for creating impressive, professional portfolios

About the Portfolio Builder:
- Users can create beautiful, responsive portfolio websites
- Features include: Basic Info, Projects, Skills, Theme customization, AI Chatbot integration, and Settings
- Supports custom themes with colors, fonts, and animations
- One-click deployment to Netlify
- Export as downloadable ZIP files
- Live preview functionality

Keep responses:
- Clear, helpful, and beginner-friendly
- Action-oriented with practical guidance
- Focused on portfolio building best practices
- Concise (3-5 sentences max)

Do not use markdown formatting.
Write in plain text only.`

        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=" + key, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\nUser: ${message}\n\nRespond helpfully and concisely:`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200,
                }
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            return NextResponse.json(
                { error: errorData.error?.message || "Failed to generate response" },
                { status: response.status }
            )
        }

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try again."

        return NextResponse.json({ response: text })
    } catch (error) {
        console.error("Chat API error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
