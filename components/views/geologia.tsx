"use client"

import { useLars } from "@/lib/mars-context"

const FALLBACK_FINDINGS = [
  {
    name: "Formación Murray - Sector Central",
    coordinates: "-4.589°, 137.442°",
    sol: 4498,
    description: "Capas sedimentarias finamente estratificadas que sugieren un antiguo ambiente lacustre. La presencia de arcillas esmectitas indica interacción prolongada con agua líquida.",
    minerals: ["Óxido de hierro", "Sulfatos", "Arcillas esmectitas"],
    badge: "prioridad alta",
    badgeType: "danger",
  },
  {
    name: "Cráter Gale - Sector NE",
    coordinates: "-4.601°, 137.458°",
    sol: 4500,
    description: "Acumulación inusual de óxido de hierro detectada esta semana. El patrón sugiere deposición hidrotermal o evaporación de agua rica en minerales.",
    minerals: ["Óxido de hierro", "Hematita", "Perclorato"],
    badge: "nuevo hallazgo",
    badgeType: "info",
  },
  {
    name: "Afloramiento Vera Rubin",
    coordinates: "-4.575°, 137.430°",
    sol: 4495,
    description: "Cresta rocosa con alta concentración de hematita. Evidencia de diagénesis y alteración post-deposicional por fluidos.",
    minerals: ["Hematita", "Magnetita", "Sulfatos"],
    badge: "en análisis",
    badgeType: "warning",
  },
  {
    name: "Depósito Aluvial Delta-3",
    coordinates: "-4.612°, 137.475°",
    sol: 4492,
    description: "Sedimentos clásticos con gradación normal, característicos de depósitos fluviales. La secuencia sugiere múltiples eventos de inundación.",
    minerals: ["Olivino", "Piroxeno", "Feldespato"],
    badge: "confirmado",
    badgeType: "success",
  },
]

export function Geologia() {
  const { geology, geologyLoading } = useLars()

  const findings = geology.length > 0 ? geology : FALLBACK_FINDINGS
  const isAIGenerated = geology.length > 0

  return (
    <>
      <h2 className="section-title">
        Hallazgos geológicos
        {isAIGenerated && <span className="section-badge">generado por IA</span>}
      </h2>

      {geologyLoading && (
        <div className="loading-state">Claude está analizando datos geológicos...</div>
      )}

      {findings.map((finding) => (
        <div key={finding.name} className="finding-card">
          <div className="finding-header">
            <div className="finding-name">{finding.name}</div>
            <span className={`badge ${finding.badgeType}`}>{finding.badge}</span>
          </div>
          <div className="finding-meta">
            Coordenadas: {finding.coordinates} · Sol {finding.sol}
          </div>
          <div className="finding-description">{finding.description}</div>
          <div className="mineral-tags">
            {finding.minerals.map((mineral) => (
              <span key={mineral} className="mineral-tag">
                {mineral}
              </span>
            ))}
          </div>
        </div>
      ))}

      <div className="recommendations-section">
        <h2 className="section-title">Zonas recomendadas para exploración</h2>
        {findings.slice(0, 2).map((finding) => (
          <div key={finding.name} className="recommendation-item">
            <div className="recommendation-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3 7h7l-5.5 5 2 7-6.5-4.5L5.5 21l2-7L2 9h7z" />
              </svg>
            </div>
            <div className="recommendation-text">
              Explorar {finding.name} ({finding.coordinates}) — {finding.minerals[0]} detectado con alta prioridad.
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
