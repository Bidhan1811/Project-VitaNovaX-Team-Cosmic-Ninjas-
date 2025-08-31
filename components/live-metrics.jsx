"use client"
import useSWR from "swr"
import { METRICS } from "@/lib/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Stagger, Item } from "@/components/motion"

const fetcher = (url) => fetch(url).then((res) => res.json())

export function LiveMetricsPreview() {
  const { data } = useSWR("/api/thingspeak/latest?health_channel=2851466&env_channel=2910602&bp_channel=2913017&anaemia_channel=3044993", fetcher, { refreshInterval: 5000 })
  const loading = !data

  // Compute SpO2 / BP risk dynamically
  const bpData = data?.bp?.values
  let spo2Risk = []
  if (bpData) {
    const { spo2, heartRate, systolic, diastolic } = bpData
    if (spo2 < 90) spo2Risk.push("Hypoxemia")
    if (heartRate > 100) spo2Risk.push("Tachycardia")
    if (heartRate < 60) spo2Risk.push("Bradycardia")
    if (systolic > 140 || diastolic > 90) spo2Risk.push("Hypertension")
    if (systolic < 90 || diastolic < 60) spo2Risk.push("Hypotension")
    if (!spo2Risk.length) spo2Risk.push("Normal")
  }

  return (
    <Stagger>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {METRICS.map((m) => {
          // Determine the source channel
          let sourceData = null
          if (m.source === "health") sourceData = data?.health
          else if (m.source === "bp") sourceData = data?.bp
          else if (m.source === "anaemia") sourceData = data?.anaemia
          else if (m.source === "environment") sourceData = data?.environment

          const val = sourceData?.values?.[m.key]
          const createdAt = sourceData?.created_at

          // Special handling for BP risk card
          const isBpCard = m.source === "bp" && m.key === "spo2"

          return (
            <Item key={m.key}>
              <Card className="transition-transform hover:-translate-y-0.5 card-elevate">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {m.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div>
                      <div className="h-7 rounded bg-muted shimmer" />
                      <div className="mt-2 h-3 w-24 rounded bg-muted shimmer" />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold" style={{ color: m.colorVar }}>
                        {val != null ? Number(val).toFixed(2) : "--"}
                        {m.unit && <span className="ml-1 text-sm text-muted-foreground">{m.unit}</span>}
                      </div>
                      {isBpCard && (
                        <p className="mt-1 text-sm text-red-600">
                          Risk: {spo2Risk.join(", ")}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {createdAt ? new Date(createdAt).toLocaleTimeString() : "—"}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </Item>
          )
        })}
      </div>
    </Stagger>
  )
}
