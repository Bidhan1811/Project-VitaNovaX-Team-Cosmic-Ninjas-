"use client"

import { useState, useEffect } from "react"
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"

export function QRShareCard() {
  const [ownerEmail, setOwnerEmail] = useState("")
  const [shareUrl, setShareUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  const createShare = async () => {
    if (!ownerEmail) return
    setLoading(true)
    try {
      // Fetch latest measurements & predictions
      let payload = null
      try {
        const [latestRes, predRes] = await Promise.all([
          fetch("/api/thingspeak/latest", { cache: "no-store" }),
          fetch("/api/predict", { method: "POST", cache: "no-store" }),
        ])
        const latest = latestRes.ok ? await latestRes.json() : null
        const prediction = predRes.ok ? await predRes.json() : null
        payload = { latest, prediction }
      } catch {
        payload = { message: "No live data available" }
      }

      const res = await fetch("/api/share/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerEmail, payload }),
      })

      const json = await res.json()
      if (res.ok) setShareUrl(json.shareUrl)
      else alert(json?.error || "Failed to create share")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border p-4 bg-background card-elevate">
      <h3 className="text-lg font-semibold mb-2 text-pretty">Secure Share (QR)</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Generate an encrypted QR link to your latest measurements and predictions. Approve requests via email.
      </p>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="email"
          placeholder="Owner email for approvals"
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
          className="flex-1 rounded-md border px-3 py-2 text-sm bg-background"
        />
        <Button onClick={createShare} disabled={!ownerEmail || loading} className="cta-glow">
          {loading ? "Generating..." : "Generate Link"}
        </Button>
      </div>
      {shareUrl ? (
        <div className="flex flex-col items-center gap-2">
          <div className="bg-white p-3 rounded-md hover-lift animate-fade-up">
            <QRCode value={shareUrl} size={164} />
          </div>
          <div className="w-full flex items-center justify-between gap-2">
            <code className="text-xs overflow-hidden text-ellipsis">{shareUrl}</code>
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(shareUrl)} className="shrink-0">
              Copy
            </Button>
          </div>
        </div>
      ) : (
        <div className="h-[170px] rounded-md border border-dashed grid place-items-center text-xs text-muted-foreground">
          No link yet. Generate to see a QR.
        </div>
      )}
    </div>
  )
}
