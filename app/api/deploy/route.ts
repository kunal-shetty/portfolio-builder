
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const token = formData.get("token") as string
        const zipFile = formData.get("file") as File
        const siteId = formData.get("siteId") as string

        if (!token || !zipFile) {
            return NextResponse.json(
                { message: "Missing token or file" },
                { status: 400 }
            )
        }
 
        const zipBuffer = await zipFile.arrayBuffer()

        // Determine URL: Create New vs Update Existing
        let url = "https://api.netlify.com/api/v1/sites"

        // If siteId exists, we update that site by creating a new deploy for it
        if (siteId) {
            url = `https://api.netlify.com/api/v1/sites/${siteId}/deploys`
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/zip",
            },
            body: Buffer.from(zipBuffer) as unknown as BodyInit,
        })

        const data = await response.json()

        if (!response.ok) {
            if (response.status === 404 && siteId) {
                // Fallback: If site ID not found (maybe deleted), try creating new
                return NextResponse.json(
                    { message: "Site ID not found. Try clearing local storage or deploying as new." },
                    { status: 404 }
                )
            }
            return NextResponse.json(
                { message: data.message || "Netlify API Error" },
                { status: response.status }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error("Deploy Proxy Error:", error)
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        )
    }
}
