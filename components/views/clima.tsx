"use client"

import { useLars } from "@/lib/mars-context"

function TrendArrow({ current, previous }: { current: number; previous: number }) {
  if (current === previous) return null
  const up = current > previous
  return (
    <span style={{ fontSize: "10px", color: up ? "var(--color-text-danger)" : "var(--color-text-info)", marginLeft: "0.25rem" }}>
      {up ? "▲" : "▼"} {Math.abs(current - previous)}
    </span>
  )
}

export function Clima() {
  const { climate, alerts } = useLars()

  const last = climate[climate.length - 1]
  const prev = climate[climate.length - 2]

  // Chart geometry
  const W = 560
  const H = 120
  const PAD_L = 38
  const PAD_R = 12
  const PAD_T = 10
  const PAD_B = 24
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B

  const allTemps = climate.flatMap((d) => [d.max, d.min])
  const tMin = Math.min(...allTemps) - 4
  const tMax = Math.max(...allTemps) + 4
  const tRange = tMax - tMin

  const cx = (i: number) => PAD_L + (i / (climate.length - 1)) * innerW
  const cy = (t: number) => PAD_T + innerH - ((t - tMin) / tRange) * innerH

  const linePath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"} ${cx(i).toFixed(1)} ${cy(v).toFixed(1)}`).join(" ")

  const areaPath = (vals: number[]) => {
    const base = PAD_T + innerH
    const line = vals.map((v, i) => `${i === 0 ? "M" : "L"} ${cx(i).toFixed(1)} ${cy(v).toFixed(1)}`).join(" ")
    return `${line} L ${cx(vals.length - 1).toFixed(1)} ${base} L ${cx(0).toFixed(1)} ${base} Z`
  }

  // Grid Y values (every 20°C)
  const gridTemps: number[] = []
  for (let t = Math.ceil(tMin / 20) * 20; t <= tMax; t += 20) gridTemps.push(t)

  const uvLevel = (last?.max ?? -21) > -15 ? "Alto" : "Moderado"
  const uvClass = (last?.max ?? -21) > -15 ? "danger" : "warning"
  const tempRange = Math.abs((last?.max ?? -21) - (last?.min ?? -81))

  return (
    <>
      <div className="view-header">
        <div>
          <h2 className="section-title" style={{ marginBottom: "0.2rem" }}>Condiciones climáticas</h2>
          <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>
            Cráter Gale · Sol {last?.sol ?? "—"} · REMS instrument
          </div>
        </div>
        {alerts.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {alerts.map((a, i) => (
              <span key={i} className={`chip alert-${a.type}`}>{a.message}</span>
            ))}
          </div>
        )}
      </div>

      {/* Metric cards */}
      <div className="climate-metrics-row">
        <div className="climate-metric-card">
          <div className="climate-metric-icon temp-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
            </svg>
          </div>
          <div className="climate-metric-body">
            <div className="climate-metric-label">Temperatura</div>
            <div className="climate-metric-value">
              {last?.max ?? -21}° <span style={{ color: "var(--color-text-tertiary)" }}>/</span> {last?.min ?? -81}°C
              {prev && <TrendArrow current={last.max} previous={prev.max} />}
            </div>
            <div className="climate-metric-sub">Rango diurno de {tempRange}°C</div>
          </div>
        </div>

        <div className="climate-metric-card">
          <div className="climate-metric-icon pressure-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="climate-metric-body">
            <div className="climate-metric-label">Presión atmosférica</div>
            <div className="climate-metric-value">
              {last?.pressure ?? 749} Pa
              {prev && <TrendArrow current={last.pressure} previous={prev.pressure} />}
            </div>
            <div className="climate-metric-sub">Rango normal estacional</div>
          </div>
        </div>

        <div className="climate-metric-card">
          <div className="climate-metric-icon wind-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
              <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
              <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
            </svg>
          </div>
          <div className="climate-metric-body">
            <div className="climate-metric-label">Viento</div>
            <div className="climate-metric-value">
              {last?.wind ?? 16} m/s
              {prev && <TrendArrow current={last.wind} previous={prev.wind} />}
            </div>
            <div className="climate-metric-sub">Dirección: {last?.windDir ?? "NW"}</div>
          </div>
        </div>

        <div className="climate-metric-card">
          <div className={`climate-metric-icon uv-icon ${uvClass}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          </div>
          <div className="climate-metric-body">
            <div className="climate-metric-label">Índice UV</div>
            <div className={`climate-metric-value uv-${uvClass}`}>{uvLevel}</div>
            <div className="climate-metric-sub">Opacidad: {last?.opacity ?? "Sunny"}</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <div className="chart-title" style={{ marginBottom: 0 }}>Temperatura — últimos 7 soles</div>
          <div className="chart-legend">
            <div className="legend-item">
              <span style={{ display: "inline-block", width: 20, height: 2, background: "#f97316", borderRadius: 1 }} />
              <span>Máxima</span>
            </div>
            <div className="legend-item">
              <span style={{ display: "inline-block", width: 20, height: 2, background: "#60a5fa", borderRadius: 1 }} />
              <span>Mínima</span>
            </div>
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <linearGradient id="gradMax" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="gradMin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines + Y labels */}
          {gridTemps.map((t) => (
            <g key={t}>
              <line x1={PAD_L} y1={cy(t)} x2={W - PAD_R} y2={cy(t)} stroke="#2a2a2a" strokeWidth="0.5" />
              <text x={PAD_L - 4} y={cy(t) + 3.5} textAnchor="end" fontSize="9" fill="#737373">{t}°</text>
            </g>
          ))}

          {/* Area fills */}
          <path d={areaPath(climate.map((d) => d.max))} fill="url(#gradMax)" />
          <path d={areaPath(climate.map((d) => d.min))} fill="url(#gradMin)" />

          {/* Lines */}
          <path d={linePath(climate.map((d) => d.max))} fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinejoin="round" />
          <path d={linePath(climate.map((d) => d.min))} fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Dots + X labels */}
          {climate.map((d, i) => (
            <g key={d.sol}>
              <circle cx={cx(i)} cy={cy(d.max)} r="2.5" fill="#f97316" />
              <circle cx={cx(i)} cy={cy(d.min)} r="2.5" fill="#60a5fa" />
              <text x={cx(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#737373">{d.sol}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Secondary info row */}
      <div className="climate-secondary-row">
        <div className="climate-secondary-card">
          <div className="climate-secondary-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 12, height: 12 }}>
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            Amanecer
          </div>
          <div className="climate-secondary-value">{last?.sunrise ?? "06:03"} LMST</div>
        </div>
        <div className="climate-secondary-card">
          <div className="climate-secondary-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 12, height: 12 }}>
              <path d="M17 18a5 5 0 0 0-10 0" />
              <line x1="12" y1="9" x2="12" y2="2" />
              <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
              <line x1="1" y1="18" x2="3" y2="18" />
              <line x1="21" y1="18" x2="23" y2="18" />
              <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
            </svg>
            Atardecer
          </div>
          <div className="climate-secondary-value">{last?.sunset ?? "18:08"} LMST</div>
        </div>
        <div className="climate-secondary-card">
          <div className="climate-secondary-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 12, height: 12 }}>
              <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" />
            </svg>
            Duración del sol
          </div>
          <div className="climate-secondary-value">12h 05m</div>
        </div>
        <div className="climate-secondary-card">
          <div className="climate-secondary-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 12, height: 12 }}>
              <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
            </svg>
            Polvo atmosférico
          </div>
          <div className="climate-secondary-value">τ ≈ 0.6 Moderado</div>
        </div>
        <div className="climate-secondary-card">
          <div className="climate-secondary-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 12, height: 12 }}>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Presión media 7 soles
          </div>
          <div className="climate-secondary-value">
            {Math.round(climate.reduce((s, d) => s + d.pressure, 0) / climate.length)} Pa
          </div>
        </div>
        <div className="climate-secondary-card">
          <div className="climate-secondary-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 12, height: 12 }}>
              <path d="M12 22V12M12 12L8 16M12 12l4 4" />
              <circle cx="12" cy="6" r="4" />
            </svg>
            Viento máx. registrado
          </div>
          <div className="climate-secondary-value">
            {Math.max(...climate.map((d) => d.wind))} m/s
          </div>
        </div>
      </div>
    </>
  )
}
