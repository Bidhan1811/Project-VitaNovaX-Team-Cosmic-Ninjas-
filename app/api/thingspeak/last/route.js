// Usage: /api/thingspeak/last?channel=12345&field=1&api_key=OPTIONAL
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const channel = searchParams.get("channel")
  const field = searchParams.get("field")
  const apiKey = searchParams.get("api_key") || undefined

  if (!channel || !field) {
    return new Response(JSON.stringify({ error: "Missing required query params: channel, field" }), { status: 400 })
  }

  const url = new URL(`https://api.thingspeak.com/channels/${channel}/fields/${field}/last.json`)
  if (apiKey) url.searchParams.set("api_key", apiKey)

  const res = await fetch(url.toString(), { cache: "no-store" })
  if (!res.ok) {
    const text = await res.text()
    return new Response(JSON.stringify({ error: "ThingSpeak error", details: text }), { status: res.status })
  }

  const data = await res.json()
  // The response contains created_at, entry_id, and fieldN with the value as string
  const created_at = data?.created_at || null
  const entry_id = data?.entry_id || null
  const fieldKey = Object.keys(data || {}).find((k) => /^field\d+$/.test(k))
  const raw = fieldKey ? data[fieldKey] : null
  const value = raw != null ? Number(raw) : null

  return Response.json({ created_at, entry_id, value: Number.isFinite(value) ? value : null })
}
