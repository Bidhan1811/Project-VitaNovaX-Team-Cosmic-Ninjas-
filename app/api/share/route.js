import { NextResponse } from "next/server"
import { encryptJSON } from "@/lib/crypto"
import { createShare } from "@/lib/_store"
import QRCode from "qrcode"

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function POST(req) {
  const body = await req.json()
  const ownerEmail = body?.ownerEmail
  if (!ownerEmail) return NextResponse.json({ error: "ownerEmail required" }, { status: 400 })

  const payload = body?.payload || { message: "No live data" }
  const encryptedPayload = await encryptJSON(payload)
  const id = uid()
  createShare({ id, ownerEmail, encryptedPayload, createdAt: Date.now() })

  const shareUrl = `${req.nextUrl.origin}/share/${id}`
  const qrDataUrl = await QRCode.toDataURL(shareUrl)

  return NextResponse.json({ id, shareUrl, qrDataUrl })
}
