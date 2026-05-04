"use client"

import { useState } from "react"
import { useLars } from "@/lib/mars-context"

const FALLBACK_FINDINGS = [
  {
    name: "Formación Murray — Sector Central",
    coordinates: "-4.589°, 137.442°",
    sol: 4874,
    description: "Capas sedimentarias finamente estratificadas que sugieren un antiguo ambiente lacustre. La presencia de arcillas esmectitas indica interacción prolongada con agua líquida en condiciones de pH neutro.",
    minerals: ["Arcillas esmectitas", "Óxido de hierro", "Sulfatos"],
    badge: "prioridad alta",
    badgeType: "danger",
  },
  {
    name: "Cráter Gale — Sector NE",
    coordinates: "-4.601°, 137.458°",
    sol: 4876,
    description: "Acumulación inusual de óxido de hierro detectada esta semana. El patrón de distribución sugiere deposición hidrotermal o evaporación de agua rica en minerales disueltos.",
    minerals: ["Óxido de hierro", "Hematita", "Perclorato"],
    badge: "nuevo hallazgo",
    badgeType: "info",
  },
  {
    name: "Afloramiento Vera Rubin",
    coordinates: "-4.575°, 137.430°",
    sol: 4871,
    description: "Cresta rocosa con alta concentración de hematita gris y especular. Evidencia clara de diagénesis y alteración post-deposicional por fluidos ricos en hierro.",
    minerals: ["Hematita", "Magnetita", "Jarosita"],
    badge: "en análisis",
    badgeType: "warning",
  },
  {
    name: "Depósito Aluvial Delta-3",
    coordinates: "-4.612°, 137.475°",
    sol: 4867,
    description: "Sedimentos clásticos con gradación normal, característicos de depósitos fluviales activos. La secuencia estratigráfica sugiere múltiples episodios de inundación.",
    minerals: ["Olivino", "Piroxeno", "Feldespato"],
    badge: "confirmado",
    badgeType: "success",
  },
]

const BORDER_COLOR: Record<string, string> = {
  danger: "var(--color-text-danger)",
  warning: "var(--color-text-warning)",
  success: "var(--color-text-success)",
  info: "var(--color-accent-light)",
}

const MINERAL_COLORS: Record<string, string> = {
  "Hematita": "danger",
  "Magnetita": "danger",
  "Óxido de hierro": "danger",
  "Arcillas esmectitas": "info",
  "Sulfatos": "warning",
  "Perclorato": "warning",
  "Jarosita": "warning",
  "Olivino": "success",
  "Piroxeno": "success",
  "Feldespato": "success",
}

function MineralTag({ name }: { name: string }) {
  const cls = MINERAL_COLORS[name] ?? "secondary"
  return <span className={`mineral-tag-v2 ${cls}`}>{name}</span>
}

function FindingCard({ finding }: { finding: typeof FALLBACK_FINDINGS[0] }) {
  const [expanded, setExpanded] = useState(false)
  const borderColor = BORDER_COLOR[finding.badgeType] ?? "var(--color-border-secondary)"
  const short = finding.description.length > 110 && !expanded

  return (
    <div className="finding-card-v2" style={{ borderLeftColor: borderColor }}>
      <div className="finding-header">
        <div className="finding-name">{finding.name}</div>
        <span className={`badge ${finding.badgeType}`}>{finding.badge}</span>
      </div>
      <div className="finding-meta-v2">
        <span className="finding-coord">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 10, height: 10 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {finding.coordinates}
        </span>
        <span className="finding-sol-badge">Sol {finding.sol}</span>
      </div>
      <div className="finding-description">
        {short ? `${finding.description.slice(0, 110)}…` : finding.description}
        {finding.description.length > 110 && (
          <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Ver menos" : "Ver más"}
          </button>
        )}
      </div>
      <div className="mineral-tags">
        {finding.minerals.map((m) => <MineralTag key={m} name={m} />)}
      </div>
    </div>
  )
}

export function Geologia() {
  const { geology, geologyLoading } = useLars()

  const findings = geology.length > 0 ? geology : FALLBACK_FINDINGS
  const isAI = geology.length > 0

  return (
    <>
      <div className="view-header">
        <div>
          <h2 className="section-title" style={{ marginBottom: "0.2rem" }}>
            Hallazgos geológicos
            {isAI && <span className="section-badge">generado por IA</span>}
          </h2>
          <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>
            {findings.length} formaciones registradas · Cráter Gale
          </div>
        </div>
      </div>

      {geologyLoading && (
        <div className="loading-state" style={{ marginBottom: "1rem" }}>
          Claude está analizando datos geológicos…
        </div>
      )}

      <div className="findings-list">
        {findings.map((f) => (
          <FindingCard key={f.name} finding={f} />
        ))}
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <h2 className="section-title" style={{ marginBottom: "0.75rem", fontSize: "13px" }}>
          Zonas objetivo para exploración
        </h2>
        <div className="target-zones">
          {findings.slice(0, 3).map((f, i) => (
            <div key={f.name} className="target-zone-item">
              <div className="target-zone-rank">{i + 1}</div>
              <div className="target-zone-body">
                <div className="target-zone-name">{f.name}</div>
                <div className="target-zone-detail">
                  {f.coordinates} · {f.minerals[0]}
                </div>
              </div>
              <span className={`badge ${f.badgeType}`}>{f.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
