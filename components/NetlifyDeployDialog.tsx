"use client"

import { useEffect, useState } from "react"
import JSZip from "jszip"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ExternalLink, Globe, Loader2, Rocket } from "lucide-react"
import type { SavedSite } from "@/lib/portfolio"

const TOKEN_KEY = "netlify-token"

interface NetlifyDeployDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  getFiles: () => Record<string, string>
  site: SavedSite | null
  onDeployed: (site: SavedSite) => void
  onForgetSite: () => void
}

export function NetlifyDeployDialog({ open, onOpenChange, getFiles, site, onDeployed, onForgetSite }: NetlifyDeployDialogProps) {
  const [token, setToken] = useState("")
  const [remember, setRemember] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deployedUrl, setDeployedUrl] = useState("")

  useEffect(() => {
    if (!open) return
    setError(null)
    setDeployedUrl("")
    try {
      const saved = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || ""
      setToken(saved)
      setRemember(Boolean(localStorage.getItem(TOKEN_KEY)))
    } catch {}
  }, [open])

  const deploy = async () => {
    if (!token.trim()) return setError("Enter your Netlify personal access token.")
    setDeploying(true)
    setError(null)
    try {
      try {
        localStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem(TOKEN_KEY)
        ;(remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token.trim())
      } catch {}

      const zip = new JSZip()
      for (const [name, content] of Object.entries(getFiles())) zip.file(name, content)
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" })

      const form = new FormData()
      form.append("token", token.trim())
      form.append("file", blob, "site.zip")
      if (site?.siteId) form.append("siteId", site.siteId)

      const res = await fetch("/api/deploy", { method: "POST", body: form })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.siteMissing) onForgetSite()
        throw new Error(data.message ? `${data.message}${data.siteMissing ? " Deploy again to create a new site." : ""}` : "Deployment failed.")
      }
      setDeployedUrl(data.url)
      onDeployed({ siteId: data.siteId, url: data.url })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setDeploying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gray-800 bg-gray-900 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-purple-400" />
            {site ? "Update your live site" : "Deploy to Netlify"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {site ? (
              <>
                Publishes your latest changes to{" "}
                <a href={site.url} target="_blank" rel="noreferrer" className="text-purple-300 underline">
                  {site.url.replace(/^https?:\/\//, "")}
                </a>
                .
              </>
            ) : (
              "Publishes your portfolio to a free netlify.app address in a few seconds."
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="border-red-900 bg-red-950/40 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {deployedUrl ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <Globe className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Your portfolio is live</h3>
              <p className="mt-1 break-all text-sm text-gray-400">{deployedUrl}</p>
              <p className="mt-1 text-xs text-gray-500">It can take a few seconds to appear the first time.</p>
            </div>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <a href={deployedUrl} target="_blank" rel="noreferrer">
                Visit site <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="token" className="text-gray-300">
                Netlify personal access token
              </Label>
              <Input
                id="token"
                type="password"
                autoComplete="off"
                placeholder="nfp_…"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="border-gray-700 bg-gray-800 text-white"
              />
              <a
                href="https://app.netlify.com/user/applications#personal-access-tokens"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-purple-400 hover:underline"
              >
                Create a token in Netlify → User settings → Applications
              </a>
            </div>
            <div className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
              <Label htmlFor="remember" className="text-sm font-normal text-gray-300">
                Remember token on this device
              </Label>
              <Switch id="remember" checked={remember} onCheckedChange={setRemember} />
            </div>
            <p className="text-xs text-gray-500">
              The token is sent once to Netlify through this app's server to upload your site. It is never stored on the server.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          {!deployedUrl ? (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-400 hover:bg-white/10 hover:text-white">
                Cancel
              </Button>
              <Button onClick={deploy} disabled={deploying} className="bg-purple-600 text-white hover:bg-purple-700">
                {deploying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                {deploying ? "Deploying…" : site ? "Update site" : "Deploy now"}
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full text-gray-400 hover:bg-white/10 hover:text-white">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
