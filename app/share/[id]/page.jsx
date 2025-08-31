"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

const fetcher = (url) => fetch(url).then((r) => r.json())

export default function SharePage({ params }) {
  const search = useSearchParams()
  const approvedStatus = search.get("status")
  const shareId = params.id

  const { data, mutate } = useSWR(`/api/share/status?shareId=${shareId}`, fetcher, {
    refreshInterval: 3000,
  })
  const [requesterEmail, setRequesterEmail] = useState("")

  const pending = data?.status === "pending"
  const approved = data?.status === "approved"
  const error = data?.error

  useEffect(() => {
    if (approvedStatus === "approved") {
      mutate()
    }
  }, [approvedStatus, mutate])

  const handleRequest = async () => {
    const res = await fetch("/api/share/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareId, requesterEmail }),
    })
    const json = await res.json()
    if (json?.approveLink) {
      // Dev-mode helper to copy approve link
      console.log("[v0] Approve link:", json.approveLink)
      alert("Dev mode: copy approve link from console")
    }
  }

  const pretty = useMemo(() => (approved && data?.data ? JSON.stringify(data.data, null, 2) : ""), [approved, data])

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4 text-pretty">Shared Health Data</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {approved ? (
        <div className="rounded-lg border p-4 bg-background">
          <p className="text-sm text-muted-foreground mb-2">Access approved</p>
          <pre className="text-xs leading-6 overflow-auto max-h-[50vh]">{pretty}</pre>
        </div>
      ) : (
        <div className="rounded-lg border p-4 bg-background">
          <p className="text-sm mb-4">
            Access to this shared data is protected. Request approval from the owner to view.
          </p>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="email"
              placeholder="Your email (optional)"
              value={requesterEmail}
              onChange={(e) => setRequesterEmail(e.target.value)}
              className="flex-1 rounded-md border px-3 py-2 text-sm bg-background"
            />
            <Button onClick={handleRequest} className="shrink-0">
              Request Access
            </Button>
          </div>
          {pending && <p className="text-sm text-muted-foreground">Waiting for owner approval...</p>}
        </div>
      )}
    </main>
  )
}
