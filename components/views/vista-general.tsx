"use client"

import { useLars } from "@/lib/mars-context"
import { TerrainSvg } from "../terrain-svg"

const FALLBACK_PHOTOS = [
  { id: 1, sol: 4498, camera: "NAVCAM", img_src: "", earth_date: "2024-01-01" },
  { id: 2, sol: 4499, camera: "MAST", img_src: "", earth_date: "2024-01-02" },
  { id: 3, sol: 4500, camera: "FHAZ", img_src: "", earth_date: "2024-01-03" },
  { id: 4, sol: 4497, camera: "RHAZ", img_src: "", earth_date: "2023-12-31" },
  { id: 5, sol: 4500, camera: "NAVCAM", img_src: "", earth_date: "2024-01-03" },
  { id: 6, sol: 4499, camera: "MAST", img_src: "", earth_date: "2024-01-02" },
]

const FALLBACK_ZONES = [
  {
    name: "Formacion Murray",
    description: "Capas sedimentarias, posible presencia de agua antigua",
    badge: "prioridad alta",
    badgeType: "danger",
  },
  {
    name: "Crater Gale, sector NE",
    description: "Acumulacion de oxido de hierro detectada esta semana",
    badge: "nuevo hallazgo",
    badgeType: "info",
  },
]

export function VistaGeneral() {
  const { photos, climate, geology, photosLoading, currentSol } = useLars()

  const last = climate[climate.length - 1]
  const uvLevel = (last?.max ?? -23) > -15 ? "Alto" : "Moderado"
  const uvClass = (last?.max ?? -23) > -15 ? "danger" : "warning"
  const windDir = (last?.wind ?? 18) > 18 ? "Norte a Sur" : "Noroeste a Sureste"

  const displayPhotos = photos.length > 0 ? photos.slice(0, 6) : FALLBACK_PHOTOS
  const displayZones =
    geology.length > 0
      ? geology.slice(0, 2).map((z) => ({
          name: z.name,
          description: z.description,
          badge: z.badge,
          badgeType: z.badgeType,
        }))
      : FALLBACK_ZONES

  const stats = [
    { label: "Temperatura", value: `${last?.max ?? -23}C / ${last?.min ?? -78}C`, subtext: "Maxima / minima del dia" },
    { label: "Presion", value: `${last?.pressure ?? 748} Pa`, subtext: "Dentro del rango normal" },
    { label: "Polvo atmosferico", value: "Moderado", subtext: "Tau 0.6" },
    { label: "UV", value: uvLevel, subtext: "Sin nubes detectadas" },
  ]

  const climateCards = [
    {
      title: "Temperatura",
      value: `${last?.max ?? -23}C / ${last?.min ?? -78}C`,
      description: `Rango de ${Math.abs((last?.max ?? -23) - (last?.min ?? -78))}C entre dia y noche, mas extremo que cualquier desierto en la Tierra.`,
      progressColor: "info",
    },
    {
      title: "Viento",
      value: `${last?.wind ?? 18} m/s`,
      description: `Direccion: ${windDir}. Puede transportar polvo hacia el sector sur del Crater Gale.`,
      progressColor: "warning",
    },
    {
      title: "Radiacion UV",
      value: uvLevel,
      description: "Sin nubes hoy. El pico de radiacion fue a las 13:00 hora marciana.",
      progressColor: uvClass,
    },
  ]

  return (
    <>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-subtext">{stat.subtext}</div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Galeria de fotos - Sol {currentSol}</h2>

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
        <div className="photo-gallery">
          {displayPhotos.map((photo, idx) => (
            <div key={photo.id} className="photo-card">
              <div className="photo-placeholder">
                {photo.img_src ? (
                  <img src={photo.img_src} alt={`Sol ${photo.sol} ${photo.camera}`} />
                ) : (
                  <TerrainSvg variant={(idx % 6) + 1} />
                )}
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
      <div className="climate-grid">
        {climateCards.map((card) => (
          <div key={card.title} className="climate-card">
            <div className="climate-title">{card.title}</div>
            <div className="climate-value">{card.value}</div>
            <div className="climate-description">{card.description}</div>
            <div className={`progress-bar ${card.progressColor}`} />
          </div>
        ))}
      </div>

      <h2 className="section-title">Zonas geologicas</h2>
      <div className="zone-list">
        {displayZones.map((zone) => (
          <div key={zone.name} className="zone-item">
            <div className="zone-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 19h20L12 2z" />
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
