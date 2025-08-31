import { updateShareApproval } from "@/lib/_store"

export async function POST(req, { params }) {
  const { id } = params
  const share = updateShareApproval(id, true)
  if (!share) return new Response("Not found", { status: 404 })
  return new Response("Share approved", { status: 200 })
}
