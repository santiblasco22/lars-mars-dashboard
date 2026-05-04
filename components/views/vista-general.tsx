"use client"

import { useState } from "react"
import { useLars } from "@/lib/mars-context"
import { TerrainSvg } from "../terrain-svg"

function PhotoThumb({ src, alt, variant }: { src: string; alt: string; variant: number }) {
  const [error, setError] = useState(false)
  if (!src || error) return <TerrainSvg variant={variant} />
  return <img src={src} alt={alt} onError={() => setError(true)} />
}

const FALLBACK_ZONES = [
  {
    name: "Formación Murray",
    description: "Capas sedimentarias, posible presencia de agua antigua",
    badge: "prioridad alta",
    badgeType: "danger",
  },
  {
    name: "Cráter Gale, sector NE",
    description: "Acumulación de óxido de hierro detectada esta semana",
    badge: "nuevo hallazgo",
    badgeType: "info",
  },
]

export function VistaGeneral() {
  const { photos, climate, geology, photosLoading, currentSol } = useLars()

  const last = climate[climate.length - 1]
  const uvLevel = (last?.max ?? -21) > -15 ? "Alto" : "Moderado"
  const uvClass = (last?.max ?? -21) > -15 ? "danger" : "warning"

  const displayPhotos = photos.slice(0, 6)
  const displayZones =
    geology.length > 0
      ? geology.slice(0, 2).map((z) => ({ name: z.name, description: z.description, badge: z.badge, badgeType: z.badgeType }))
      : FALLBACK_ZONES

  const stats = [
    { label: "Sol actual", value: String(currentSol), subtext: "Curiosity · Cráter Gale" },
    { label: "Temperatura", value: `${last?.max ?? -21}° / ${last?.min ?? -81}°C`, subtext: "Máx. diurna / mín. nocturna" },
    { label: "Presión", value: `${last?.pressure ?? 749} Pa`, subtext: "Dentro del rango normal" },
    { label: "Índice UV", value: uvLevel, subtext: "Sin nubes detectadas", accent: uvClass },
  ]

  const climateCards = [
    {
      title: "Temperatura",
      value: `${last?.max ?? -21}° / ${last?.min ?? -81}°C`,
      description: `Rango de ${Math.abs((last?.max ?? -21) - (last?.min ?? -81))}°C entre día y noche — más extremo que cualquier desierto en la Tierra.`,
      progressColor: "info",
    },
    {
      title: "Viento",
      value: `${last?.wind ?? 16} m/s`,
      description: `Dirección: ${last?.windDir ?? "NW"}. Puede transportar polvo hacia el sector sur del Cráter Gale.`,
      progressColor: "warning",
    },
    {
      title: "Radiación UV",
      value: uvLevel,
      description: "Sin nubes hoy. El pico de radiación fue a las 13:00 hora marciana.",
      progressColor: uvClass,
    },
  ]

  return (
    <>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className={`stat-value ${stat.accent ? `uv-${stat.accent}` : ""}`}>{stat.value}</div>
            <div className="stat-subtext">{stat.subtext}</div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Galería de fotos · Sol {currentSol}</h2>

      {photosLoading ? (
        <div className="skeleton-grid" style={{ marginBottom: "1.5rem" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-img skeleton-anim" />
              <div className="skeleton-info">
                <div className="skeleton-line skeleton-anim" style={{ width: "40%" }} />
                <div className="skeleton-line skeleton-anim" style={{ width: "60%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="photo-gallery" style={{ marginBottom: "1.5rem" }}>
          {displayPhotos.map((photo, idx) => (
            <div key={photo.id} className="photo-card">
              <div className="photo-placeholder">
                <PhotoThumb src={photo.img_src} alt={`Sol ${photo.sol} ${photo.camera}`} variant={(idx % 6) + 1} />
              </div>
              <div className="photo-info">
                <div className="photo-sol">Sol {photo.sol}</div>
                <div className="photo-camera">{photo.camera}</div>
                <span className="badge info">{photo.earth_date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">Clima</h2>
      <div className="climate-grid" style={{ marginBottom: "1.5rem" }}>
        {climateCards.map((card) => (
          <div key={card.title} className="climate-card">
            <div className="climate-title">{card.title}</div>
            <div className="climate-value">{card.value}</div>
            <div className="climate-description">{card.description}</div>
            <div className={`progress-bar ${card.progressColor}`} />
          </div>
        ))}
      </div>

      <h2 className="section-title">Zonas geológicas</h2>
      <div className="zone-list">
        {displayZones.map((zone) => (
          <div key={zone.name} className="zone-item">
            <div className="zone-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="zone-content">
              <div className="zone-name">{zone.name}</div>
              <div className="zone-description">{zone.description}</div>
            </div>
            <div className="zone-badge">
              <span className={`badge ${zone.badgeType}`}>{zone.badge}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
