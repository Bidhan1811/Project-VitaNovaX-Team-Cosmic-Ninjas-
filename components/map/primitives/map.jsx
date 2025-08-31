"use client"

import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const hospitalIcon = new L.DivIcon({
  html: '<div style="background:#00F0FF;border:2px solid rgba(255,255,255,0.25);width:16px;height:16px;border-radius:50%;box-shadow:0 0 12px #00F0FF;"></div>',
  iconSize: [16, 16],
  className: "",
})

const doctorIcon = new L.DivIcon({
  html: '<div style="background:#FF3B81;border:2px solid rgba(255,255,255,0.25);width:16px;height:16px;border-radius:50%;box-shadow:0 0 12px #FF3B81;"></div>',
  iconSize: [16, 16],
  className: "",
})

export function Map({ userCoords, markers }) {
  const center = userCoords ? [userCoords.lat, userCoords.lon] : [28.6139, 77.209] // fallback: New Delhi

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full" attributionControl={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {userCoords && (
        <CircleMarker
          center={[userCoords.lat, userCoords.lon]}
          radius={8}
          pathOptions={{ color: "#00F0FF", fillColor: "#00F0FF", fillOpacity: 0.4 }}
        >
          <Popup>You are here</Popup>
        </CircleMarker>
      )}
      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lon]} icon={m.kind === "hospital" ? hospitalIcon : doctorIcon}>
          <Popup>
            <div className="space-y-1">
              <div className="font-medium">{m.name}</div>
              <div className="text-xs text-black/70">
                {m.lat.toFixed(4)}, {m.lon.toFixed(4)}
              </div>
              <a
                className="text-xs font-medium text-blue-600 underline"
                href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lon}`}
                target="_blank"
                rel="noreferrer"
              >
                Directions
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export function MarkerSet() {
  return null
}

MarkerSet.DetailsPanel = function DetailsPanel({ markers }) {
  return (
    <div className="absolute bottom-3 left-3 max-h-48 w-[min(480px,90%)] overflow-auto rounded-md bg-[#0E1422]/90 p-3 text-xs ring-1 ring-white/10">
      <div className="mb-2 font-medium text-white/80">Nearby Providers</div>
      <ul className="space-y-2">
        {markers.slice(0, 10).map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-3">
            <div className="truncate">
              <span
                className={`mr-2 inline-block h-2 w-2 rounded-full ${
                  m.kind === "hospital" ? "bg-[#00F0FF]" : "bg-[#FF3B81]"
                }`}
              />
              <span className="truncate">{m.name}</span>
            </div>
            <a
              className="shrink-0 rounded bg-white/10 px-2 py-1 text-[10px] text-white/80 hover:bg-white/15"
              href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lon}`}
              target="_blank"
              rel="noreferrer"
            >
              Directions
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
