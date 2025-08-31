import { getShare } from "@/lib/_store"
import { sendEmail } from "@/lib/mail"
import { decryptJSON } from "@/lib/crypto"

export async function GET(req, { params }) {
  const { id } = params
  const share = getShare(id)
  if (!share) return new Response("Not found", { status: 404 })

  if (!share.approved) {
    await sendEmail({
      to: share.ownerEmail,
      subject: "QR Access Requested",
      text: `Someone tried to access your QR: ${req.url}. Approve at: ${req.nextUrl.origin}/share/approve/${id}`,
    })
    return new Response("Owner approval required", { status: 403 })
  }

  const payload = await decryptJSON(share.encryptedPayload)
  return new Response(JSON.stringify(payload), { status: 200 })
}
