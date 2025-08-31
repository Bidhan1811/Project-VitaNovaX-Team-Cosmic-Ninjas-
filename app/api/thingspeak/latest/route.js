// Usage:
// /api/thingspeak/latest?health_channel=111&env_channel=222&bp_channel=333&anaemia_channel=444
// Optional: &health_api_key=...&env_api_key=...&bp_api_key=...&anaemia_api_key=...

import { HEALTH_FIELD_MAP, ENV_FIELD_MAP, BP_FIELD_MAP, ANAEMIA_FIELD_MAP, parseNumber } from "@/lib/channel-map"

async function fetchLatest(channel, apiKey) {
  const url = new URL(`https://api.thingspeak.com/channels/${channel}/feeds.json`)
  url.searchParams.set("results", "1")
  if (apiKey) url.searchParams.set("api_key", apiKey)

  const res = await fetch(url.toString(), { cache: "no-store" })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`ThingSpeak error: ${text}`)
  }
  const json = await res.json()
  return json?.feeds?.[0] ?? null
}

function extractByMap(latest, fieldMap) {
  if (!latest) {
    return {
      created_at: null,
      values: Object.fromEntries(Object.keys(fieldMap).map((k) => [k, null])),
    }
  }
  const created_at = latest?.created_at || null
  const values = Object.fromEntries(
    Object.entries(fieldMap).map(([name, idx]) => {
      const raw = latest?.[`field${idx}`]
      return [name, parseNumber(raw)]
    }),
  )
  return { created_at, values }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)

  const healthChannel = searchParams.get("health_channel")
  const envChannel = searchParams.get("env_channel")
  const bpChannel = searchParams.get("bp_channel")
  const anaemiaChannel = searchParams.get("anaemia_channel")

  const healthKey = searchParams.get("health_api_key") || undefined
  const envKey = searchParams.get("env_api_key") || undefined
  const bpKey = searchParams.get("bp_api_key") || undefined
  const anaemiaKey = searchParams.get("anaemia_api_key") || undefined

  if (!healthChannel && !envChannel && !bpChannel && !anaemiaChannel) {
    return new Response(
      JSON.stringify({
        error: "Provide at least one of: health_channel, env_channel, bp_channel, anaemia_channel",
      }),
      { status: 400 },
    )
  }

  try {
    const [healthLatest, envLatest, bpLatest, anaemiaLatest] = await Promise.all([
      healthChannel ? fetchLatest(healthChannel, healthKey) : Promise.resolve(null),
      envChannel ? fetchLatest(envChannel, envKey) : Promise.resolve(null),
      bpChannel ? fetchLatest(bpChannel, bpKey) : Promise.resolve(null),
      anaemiaChannel ? fetchLatest(anaemiaChannel, anaemiaKey) : Promise.resolve(null),
    ])

    const health = healthChannel ? extractByMap(healthLatest, HEALTH_FIELD_MAP) : null
    const environment = envChannel ? extractByMap(envLatest, ENV_FIELD_MAP) : null
    const bp = bpChannel ? extractByMap(bpLatest, BP_FIELD_MAP) : null
    const anaemia = anaemiaChannel ? extractByMap(anaemiaLatest, ANAEMIA_FIELD_MAP) : null

    return Response.json({ health, environment, bp, anaemia })
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Failed to read ThingSpeak" }), { status: 500 })
  }
}
