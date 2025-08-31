"use client"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { FadeIn } from "@/components/motion"

const allowedMetrics = ["Heart Rate", "Blood Pressure", "SpO₂", "Temperature"]

export function MetricChart({ title, data, colorVar, unit }) {
  if (!allowedMetrics.includes(title)) return null;

  return (
    <FadeIn>
      <Card className="w-full h-64 card-elevate hover-lift">
        <CardHeader className="p-0">
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-full">
          <ChartContainer
            config={{
              series: {
                label: title,
                color: colorVar,
              },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" hide />
                <YAxis
                  width={36}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (unit ? `${v}${unit === "%" ? "" : ""}` : String(v))}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-series)"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </FadeIn>
  )
}

