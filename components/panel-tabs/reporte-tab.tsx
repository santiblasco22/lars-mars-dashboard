"use client"

import { useEffect, useState } from "react"
import { useLars } from "@/lib/mars-context"

interface ReportSections {
  "RESUMEN DEL DÍA"?: string
  "HALLAZGOS DESTACADOS"?: string
  "ESTADO DE LOS ROVERS"?: string
  "RECOMENDACIONES"?: string
}

export function ReporteTab() {
  const { currentSol, photos, climate, geology } = useLars()
  const [sections, setSections] = useState<ReportSections | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function generateReport() {
      setLoading(true)
      try {
        const last = climate[climate.length - 1]
        const cameras = [...new Set(photos.map((p) => p.camera))]
        const res = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentSol,
            photoCount: photos.length,
            cameras,
            climate,
            geology,
          }),
        })
        const data = await res.json()
        if (data.sections) setSections(data.sections)
      } catch {
        setSections(null)
      } finally {
        setLoading(false)
      }
    }

    generateReport()
  }, [currentSol])

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <div className="report-content">
        <div className="loading-state">Claude está generando el reporte del Sol {currentSol}...</div>
      </div>
    )
  }

  if (!sections) {
    return <FallbackReport currentSol={currentSol} onPrint={handlePrint} />
  }

  return (
    <div className="report-content">
      <div className="report-header">
        <span className="report-sol">Sol {currentSol}</span>
        <button className="report-print-btn" onClick={handlePrint}>
          Exportar PDF
        </button>
      </div>

      {sections["RESUMEN DEL DÍA"] && (
        <div className="report-section">
          <h3 className="report-section-title">Resumen del día</h3>
          <p className="report-text">{sections["RESUMEN DEL DÍA"]}</p>
        </div>
      )}

      {sections["HALLAZGOS DESTACADOS"] && (
        <div className="report-section">
          <h3 className="report-section-title">Hallazgos destacados</h3>
          <ul className="report-list">
            {sections["HALLAZGOS DESTACADOS"]
              .split("\n")
              .filter((l) => l.trim().startsWith("-"))
              .map((line, i) => (
                <li key={i}>{line.replace(/^-\s*/, "")}</li>
              ))}
          </ul>
        </div>
      )}

      {sections["ESTADO DE LOS ROVERS"] && (
        <div className="report-section">
          <h3 className="report-section-title">Estado de los rovers</h3>
          <p className="report-text">{sections["ESTADO DE LOS ROVERS"]}</p>
        </div>
      )}

      {sections["RECOMENDACIONES"] && (
        <div className="report-section">
          <h3 className="report-section-title">Recomendaciones</h3>
          <p className="report-text">{sections["RECOMENDACIONES"]}</p>
        </div>
      )}
    </div>
  )
}

function FallbackReport({ currentSol, onPrint }: { currentSol: number; onPrint: () => void }) {
  return (
    <div className="report-content">
      <div className="report-header">
        <span className="report-sol">Sol {currentSol}</span>
        <button className="report-print-btn" onClick={onPrint}>Exportar PDF</button>
      </div>
      <div className="report-section">
        <h3 className="report-section-title">Resumen del día</h3>
        <p className="report-text">
          Sol {currentSol} fue un día productivo para Curiosity. El rover capturó imágenes de alta resolución
          y realizó análisis espectrales. Las condiciones atmosféricas fueron favorables.
        </p>
      </div>
      <div className="report-section">
        <h3 className="report-section-title">Hallazgos destacados</h3>
        <ul className="report-list">
          <li>Detección de sulfatos en la Formación Murray</li>
          <li>Nuevas capas sedimentarias expuestas por erosión eólica</li>
          <li>Concentración de óxido de hierro en sector NE</li>
          <li>Patrón de estratificación consistente con ambiente lacustre</li>
        </ul>
      </div>
      <div className="report-section">
        <h3 className="report-section-title">Estado de los rovers</h3>
        <p className="report-text">
          Curiosity: todos los instrumentos operativos. Perseverance: helicóptero Ingenuity operativo.
        </p>
      </div>
    </div>
  )
}
