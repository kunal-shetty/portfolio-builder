"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Rocket, Globe, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import JSZip from "jszip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface NetlifyDeployDialogProps {
    files: { [key: string]: string }
    open: boolean
    onOpenChange: (open: boolean) => void
    existingSiteId?: string
    onDeploySuccess?: (url: string, siteId: string) => void
}

export function NetlifyDeployDialog({ files, open, onOpenChange, existingSiteId, onDeploySuccess }: NetlifyDeployDialogProps) {
    const [token, setToken] = useState("")
    const [isDeploying, setIsDeploying] = useState(false)
    const [deployedUrl, setDeployedUrl] = useState("")
    const [errorDetails, setErrorDetails] = useState<string | null>(null)
    const { toast } = useToast()

    const handleDeploy = async () => {
        if (!token) {
            toast({
                title: "Token Required",
                description: "Please enter your Netlify Personal Access Token.",
                variant: "destructive",
            })
            return
        }

        setIsDeploying(true)
        setErrorDetails(null)

        try {
            // 1. Create ZIP
            const zip = new JSZip()
            Object.entries(files).forEach(([filename, content]) => {
                zip.file(filename, content)
            })

            // Netlify expects binary body. Generating blob is correct, but we must ensure
            // it's sent as raw binary in the body.
            const zipBlob = await zip.generateAsync({ type: "blob" })

            // 2. Upload to Netlify via Proxy (to avoid CORS)
            const formData = new FormData()
            formData.append("token", token)
            formData.append("file", zipBlob, "site.zip")
            if (existingSiteId) {
                formData.append("siteId", existingSiteId)
            }

            const response = await fetch("/api/deploy", {
                method: "POST",
                body: formData,
            })

            let data
            const responseText = await response.text()
            try {
                data = JSON.parse(responseText)
            } catch (e) {
                throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`)
            }

            if (!response.ok) {
                throw new Error(data.message || `Netlify Error: ${response.status} ${response.statusText}`)
            }

            // Netlify usually returns 'ssl_url' (https) or 'url' (http) or 'subdomain'
            // If deployed successfully, state should be 'processing' or 'ready'.
            const siteUrl = data.ssl_url || data.url || (data.subdomain ? `https://${data.subdomain}.netlify.app` : null) || (data.name ? `https://${data.name}.netlify.app` : null)

            if (!siteUrl) {
                console.error("Netlify Response:", data)
                throw new Error(`Deployment succeeded but URL is missing. Response: ${JSON.stringify(data)}`)
            }

            setDeployedUrl(siteUrl)
            if (onDeploySuccess && data.site_id) {
                onDeploySuccess(siteUrl, data.site_id)
            }

            toast({
                title: "Deployment Successful!",
                description: "Your site is live on Netlify.",
            })
        } catch (error) {
            console.error("Deployment failed:", error)
            setErrorDetails(error instanceof Error ? error.message : "Unknown error occurred")
            toast({
                title: "Deployment Failed",
                description: "Check the error details in the dialog.",
                variant: "destructive",
            })
        } finally {
            setIsDeploying(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-purple-500" />
                        Deploy to Netlify
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Enter your Netlify Personal Access Token to deploy your portfolio instantly.
                        <div className="mt-2 text-xs">
                            <a
                                href="https://app.netlify.com/user/applications#personal-access-tokens"
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-400 hover:underline"
                            >
                                Get a Personal Access Token here &rarr;
                            </a>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                {errorDetails && (
                    <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription className="text-xs font-mono mt-1 break-all">
                            {errorDetails}
                        </AlertDescription>
                    </Alert>
                )}

                {!deployedUrl ? (
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="token" className="text-gray-300">Netlify Access Token</Label>
                            <Input
                                id="token"
                                type="password"
                                placeholder="nfp_..."
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="bg-gray-800 border-gray-700 text-white focus:ring-purple-500"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="py-6 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                            <Globe className="w-8 h-8 text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Site Deployed!</h3>
                            <p className="text-gray-400 text-sm mt-1">Your portfolio is now live.</p>
                        </div>
                        <a
                            href={deployedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
                        >
                            Visit Site
                        </a>
                    </div>
                )}

                <DialogFooter className="sm:justify-between">
                    {!deployedUrl && (
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-white">
                            Cancel
                        </Button>
                    )}
                    {!deployedUrl && (
                        <Button
                            onClick={handleDeploy}
                            disabled={isDeploying}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {isDeploying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deploying...
                                </>
                            ) : (
                                "Deploy Now"
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
