"use client"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const fetcher = (url) => fetch(url).then(res => res.json())

export function ArrhythmiaPredictionCard() {
  const { data, error } = useSWR("/api/predict", fetcher, { refreshInterval: 5000 })

  if (error) return <Card><CardContent>Error loading prediction</CardContent></Card>
  if (!data) return <Card><CardContent>Loading...</CardContent></Card>

  return (
    <Card className="transition-transform hover:-translate-y-0.5 card-elevate">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Arrhythmia Probability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.arrhythmia_probability ?? "--"}</div>
      </CardContent>
    </Card>
  )
}
