// Supports: /api/thingspeak/feeds?channel=12345&results=100&api_key=OPTIONAL
// Falls back to THINGSPEAK_CHANNEL_ID and THINGSPEAK_READ_API_KEY if not provided.

export async function GET(req) {
  const { searchParams } = new URL(req.url)

  const channelParam = searchParams.get("channel")
  const results = searchParams.get("results") || "100"
  const apiKeyParam = searchParams.get("api_key") || undefined

  const envChannelId = process.env.THINGSPEAK_CHANNEL_ID
  const envApiKey = process.env.THINGSPEAK_READ_API_KEY

  const channelId = channelParam || envChannelId
  const apiKey = apiKeyParam || envApiKey

  if (!channelId) {
    return new Response(
      JSON.stringify({ error: "Missing channel. Provide ?channel=... or set THINGSPEAK_CHANNEL_ID" }),
      { status: 400 },
    )
  }

  const url = new URL(`https://api.thingspeak.com/channels/${channelId}/feeds.json`)
  url.searchParams.set("results", results)
  if (apiKey) url.searchParams.set("api_key", apiKey)

  const res = await fetch(url.toString(), { cache: "no-store" })
  if (!res.ok) {
    const text = await res.text()
    return new Response(JSON.stringify({ error: "ThingSpeak error", details: text }), { status: res.status })
  }

  const data = await res.json()
  return Response.json(data)
}
