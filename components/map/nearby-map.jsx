"use client"

import dynamic from "next/dynamic"
import useSWR from "swr"
import { useEffect, useMemo, useState } from "react"
import { Map, MarkerSet } from "./primitives/map"


//const Map = dynamic(() => import("./primitives/map").then((m) => m.Map), { ssr: false })
//const MarkerSet = dynamic(() => import("./primitives/map").then((m) => m.MarkerSet), { ssr: false })

const fetcher = (url) => fetch(url).then((r) => r.json())

export default function NearbyMap() {
  const [coords, setCoords] = useState(null)
  const [geoError, setGeoError] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported")
      return
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setGeoError(null)
      },
      (err) => setGeoError(err.message || "Location permission denied"),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  const bbox = useMemo(() => {
    if (!coords) return null
    const delta = 0.03 // ~3km bbox
    return {
      minLon: coords.lon - delta,
      minLat: coords.lat - delta,
      maxLon: coords.lon + delta,
      maxLat: coords.lat + delta,
    }
  }, [coords])

  const { data: hospitals } = useSWR(
    bbox
      ? `https://nominatim.openstreetmap.org/search?format=json&limit=20&amenity=hospital&viewbox=${bbox.minLon},${bbox.maxLat},${bbox.maxLon},${bbox.minLat}&bounded=1`
      : null,
    fetcher,
    { refreshInterval: 30000 }
  )

  const { data: doctors } = useSWR(
    bbox
      ? `https://nominatim.openstreetmap.org/search?format=json&limit=20&amenity=doctors&viewbox=${bbox.minLon},${bbox.maxLat},${bbox.maxLon},${bbox.minLat}&bounded=1`
      : null,
    fetcher,
    { refreshInterval: 30000 }
  )

  const markers = useMemo(() => {
    const list = []
    hospitals?.forEach((p) =>
      list.push({
        id: `h-${p.osm_id}`,
        name: p.display_name.split(",")[0] || "Hospital",
        lat: Number(p.lat),
        lon: Number(p.lon),
        kind: "hospital",
      })
    )
    doctors?.forEach((p) =>
      list.push({
        id: `d-${p.osm_id}`,
        name: p.display_name.split(",")[0] || "Doctor",
        lat: Number(p.lat),
        lon: Number(p.lon),
        kind: "doctor",
      })
    )
    return list
  }, [hospitals, doctors])

  return (
    <div className="relative h-[420px] ">
      <Map userCoords={coords} markers={markers} />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10" />
      <div className="absolute right-3 top-3 rounded-md bg-[#0E1422]/90 px-3 py-2 text-xs text-white/75 ring-1 ring-white/10">
        {coords ? (
          <span>
            Your location: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
          </span>
        ) : (
          <span>{geoError ?? "Getting your location…"}</span>
        )}
      </div>
      <MarkerSet.DetailsPanel markers={markers} />
    </div>
  )
}
