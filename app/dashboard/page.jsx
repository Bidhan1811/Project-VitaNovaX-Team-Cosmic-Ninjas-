"use client"

import { SiteHeader } from "@/components/site-header"
import { LiveMetricsPreview } from "@/components/live-metrics"
import { ArrhythmiaPredictionCard } from "@/components/dashboard/predictions-panel"
import { QRShareCard } from "@/components/qr-share-card"
import { FadeIn } from "@/components/motion"
import NearbyMap from "@/components/map/nearby-map"

export default function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <FadeIn>
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold">Live Dashboard</h1>
            <p className="text-muted-foreground">
              Streaming from ThingSpeak, predictions by Edge Impulse.
            </p>
          </div>
        </FadeIn>

        {/* Live Metrics Cards */}
        <LiveMetricsPreview />


            {/* Predictions, QR share, Nearby Hospitals */}
            <div className="flex flex-col mt-4 gap-6">
            <ArrhythmiaPredictionCard />
            <FadeIn>
              <QRShareCard />
            </FadeIn>
            <FadeIn>
              {/*<NearbyHospitalsWrapper />*/}
              <NearbyMap />
            </FadeIn>
            </div>
          
      </main>
    </>
  )
}
