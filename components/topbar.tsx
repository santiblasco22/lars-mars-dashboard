"use client"

import { useLars } from "@/lib/mars-context"

export function Topbar() {
  const { currentSol, alerts, photosLoading } = useLars()

  return (
    <header className="topbar">
      <div className="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <ellipse cx="12" cy="12" rx="10" ry="4" />
          <path d="M12 2a10 10 0 0 1 0 20" />
        </svg>
        <span>LARS</span>
      </div>
      <div className="topbar-chips">
        <span className="chip">Curiosity · Sol {currentSol}</span>
        <span className={`chip ${photosLoading ? "" : "live"}`}>
          {photosLoading ? "Cargando…" : "Datos en vivo"}
        </span>
        {alerts.map((alert, i) => (
          <span key={i} className={`chip alert-${alert.type}`}>
            {alert.type === "danger" ? "⚠ " : "▲ "}
            {alert.message}
          </span>
        ))}
      </div>
      <div style={{ marginLeft: "auto", fontSize: "11px", color: "var(--color-text-tertiary)" }}>
        Cráter Gale · Marte
      </div>
    </header>
  )
}
