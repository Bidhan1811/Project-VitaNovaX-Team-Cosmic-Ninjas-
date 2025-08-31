import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LiveMetricsPreview } from "@/components/live-metrics"
import { FadeIn, Stagger, Item } from "@/components/motion"

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-6xl px-4 pt-16 pb-10 md:pt-24 md:pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
              <Stagger>
                <div className="space-y-6">
                  <Item>
                    <h1 className="text-pretty text-4xl md:text-5xl font-black">
                      Real‑time Health Monitoring with Intelligent Risk Predictions
                    </h1>
                  </Item>
                  <Item>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Track ECG, SpO₂, Pulse, AQI, Pressure, and Humidity. Our Edge Impulse model surfaces actionable
                      risks from live ThingSpeak sensor data.
                    </p>
                  </Item>
                  <Item>
                    <div className="flex items-center gap-3">
                      <Link href="/dashboard">
                        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 cta-glow">
                          Open Dashboard
                        </Button>
                      </Link>
                      <a href="#features" className="text-secondary animated-underline underline-offset-4">
                        Learn more
                      </a>
                    </div>
                  </Item>
                  <Item>
                    <div className="pt-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs">
                        <span className="size-2 rounded-full bg-primary inline-block animate-pulse" aria-hidden />
                        Live data updating every 5s
                      </div>
                    </div>
                  </Item>
                </div>
              </Stagger>
              <div className="relative">
                <div
                  className="absolute -top-6 -right-6 size-40 rounded-xl bg-primary/10 animate-float-slow"
                  aria-hidden
                />
                <div
                  className="absolute -bottom-8 -left-8 size-28 rounded-xl bg-secondary/10 animate-float"
                  aria-hidden
                />
                <FadeIn>
                  <Card className="relative z-10 shadow-lg card-elevate">
                    <CardContent className="p-4 md:p-6">
                      <LiveMetricsPreview />
                    </CardContent>
                  </Card>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 md:py-16 bg-card">
          <div className="mx-auto max-w-6xl px-4">
            <FadeIn>
              <h2 className="text-balance text-2xl md:text-3xl font-extrabold mb-6">Built for clarity and trust</h2>
            </FadeIn>
            <Stagger>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Live Sensors", desc: "Stream ECG, SpO₂, pulse, and environment via ThingSpeak." },
                  { title: "ML Predictions", desc: "Edge Impulse inference for risks and anomalies." },
                  { title: "Actionable UI", desc: "Clean charts, accessible colors, and subtle motion." },
                ].map((f) => (
                  <Item key={f.title}>
                    <Card className="transition-transform hover:-translate-y-0.5 card-elevate">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg">{f.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                      </CardContent>
                    </Card>
                  </Item>
                ))}
              </div>
            </Stagger>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} PulseSense. All rights reserved.
        </div>
      </footer>
    </>
  )
}
