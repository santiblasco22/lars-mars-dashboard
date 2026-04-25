"use client"

import { useLars } from "@/lib/mars-context"

export function Clima() {
  const { climate, alerts } = useLars()

  const last = climate[climate.length - 1]
  const maxTemp = Math.max(...climate.map((d) => d.max))
  const minTemp = Math.min(...climate.map((d) => d.min))
  const range = maxTemp - minTemp || 1

  const getY = (temp: number) => 130 - ((temp - minTemp) / range) * 100

  const maxLine = climate
    .map((d, i) => `${i === 0 ? "M" : "L"} ${50 + i * 80} ${getY(d.max)}`)
    .join(" ")

  const minLine = climate
    .map((d, i) => `${i === 0 ? "M" : "L"} ${50 + i * 80} ${getY(d.min)}`)
    .join(" ")

  const uvIndex = (last?.max ?? -23) > -15 ? "Alto (8.5)" : "Moderado (6.2)"
  const uvClass = (last?.max ?? -23) > -15 ? "danger" : "warning"
  const windDir = (last?.wind ?? 18) > 18 ? "Norte Sur" : "Noroeste Sureste"

  return (
    <>
      <h2 className="section-title">Condiciones climaticas</h2>

      {alerts.length > 0 && (
        <div className="climate-alerts">
          {alerts.map((a, i) => (
            <div key={i} className={`climate-alert ${a.type}`}>
              {a.type === "danger" ? "Alerta: " : "Aviso: "}
              {a.message}
            </div>
          ))}
        </div>
      )}

      <div className="climate-grid-large">
        <div className="climate-card-large">
          <div className="climate-title">Temperatura</div>
          <div className="climate-value">{last?.max ?? -23}C / {last?.min ?? -78}C</div>
          <div className="climate-description">Maxima diurna / Minima nocturna</div>
        </div>
        <div className="climate-card-large">
          <div className="climate-title">Presion</div>
          <div className="climate-value">{last?.pressure ?? 748} Pa</div>
          <div className="climate-description">Dentro del rango normal estacional</div>
        </div>
        <div className="climate-card-large">
          <div className="climate-title">Viento</div>
          <div className="climate-value">{last?.wind ?? 18} m/s</div>
          <div className="climate-description">Direccion: {windDir}</div>
        </div>
        <div className="climate-card-large">
          <div className="climate-title">Indice UV</div>
          <div className={`climate-value uv-${uvClass}`}>{uvIndex}</div>
          <div className="climate-description">Sin nubes en las ultimas 72 horas</div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-title">Temperatura de los ultimos 7 soles</div>
        <svg className="chart-svg" viewBox="0 0 600 150">
          <line x1="50" y1="30" x2="550" y2="30" stroke="var(--color-border-tertiary)" strokeWidth="0.5" />
          <line x1="50" y1="80" x2="550" y2="80" stroke="var(--color-border-tertiary)" strokeWidth="0.5" />
          <line x1="50" y1="130" x2="550" y2="130" stroke="var(--color-border-tertiary)" strokeWidth="0.5" />

          <path d={maxLine} fill="none" stroke="#f97316" strokeWidth="2" />
          <path d={minLine} fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" />

          {climate.map((d, i) => (
            <circle key={`max-${d.sol}`} cx={50 + i * 80} cy={getY(d.max)} r="3" fill="#f97316" />
          ))}
          {climate.map((d, i) => (
            <circle key={`min-${d.sol}`} cx={50 + i * 80} cy={getY(d.min)} r="3" fill="var(--color-text-tertiary)" />
          ))}
          {climate.map((d, i) => (
            <text
              key={`label-${d.sol}`}
              x={50 + i * 80}
              y="148"
              textAnchor="middle"
              fontSize="10"
              fill="var(--color-text-tertiary)"
            >
              {d.sol}
            </text>
          ))}
        </svg>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot info" />
            <span>Maxima</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot secondary" />
            <span>Minima</span>
          </div>
        </div>
      </div>

      <div className="weather-grid">
        <div className="climate-card">
          <div className="climate-title">Direccion del viento</div>
          <div className="climate-value">{windDir}</div>
          <div className="climate-description">
            Velocidad media de {last?.wind ?? 18} m/s. El patron es consistente con la
            circulacion atmosferica estacional del Crater Gale.
          </div>
          <div className={`progress-bar ${(last?.wind ?? 18) > 20 ? "danger" : "warning"}`} />
        </div>
        <div className="climate-card">
          <div className="climate-title">Escala UV</div>
          <div className={`climate-value uv-${uvClass}`}>{uvIndex}</div>
          <div className="uv-scale">
            <div className={`uv-bar uv-fill-${uvClass}`} />
          </div>
          <div className="climate-description">
            Radiacion ultravioleta elevada por la delgada atmosfera marciana.
            Sin presencia de nubes en las ultimas 72 horas.
          </div>
          <div className={`progress-bar ${uvClass}`} />
        </div>
      </div>
    </>
  )
}
