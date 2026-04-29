"use client"

import { useState, useMemo } from "react"
import { useLars, NASAPhoto } from "@/lib/mars-context"
import { TerrainSvg } from "../terrain-svg"

const CAMERAS = ["Todas", "NAVCAM", "MAST", "FHAZ", "RHAZ", "FRONT_HAZCAM", "REAR_HAZCAM", "NAVCAM_LEFT", "NAVCAM_RIGHT", "MCZ_LEFT", "MCZ_RIGHT"]
const ROVERS = [
  { id: "all", label: "Ambos" },
  { id: "perseverance", label: "Perseverance" },
  { id: "curiosity", label: "Curiosity" },
]

const INTEREST_BADGE: Record<string, { label: string; cls: string }> = {
  alto:  { label: "Interés alto",  cls: "danger"  },
  medio: { label: "Interés medio", cls: "warning" },
  bajo:  { label: "Interés bajo",  cls: "success" },
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-")
  return `${d}/${m}/${y}`
}

export function Superficie() {
  const {
    photos, photosLoading, loadedDate, isExactDate,
    selectedDate, setSelectedDate, clearSelectedDate,
    selectedRover, setSelectedRover,
    photoAnalyses, setPhotoAnalysis,
  } = useLars()

  const [activeCamera, setActiveCamera] = useState("Todas")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [dateInput, setDateInput] = useState("")

  const activeCameras = useMemo(() => {
    const cams = [...new Set(photos.map(p => p.camera))]
    return ["Todas", ...cams]
  }, [photos])

  const filtered = useMemo(() => {
    const list = activeCamera === "Todas" ? photos : photos.filter((p) => p.camera === activeCamera)
    return list.slice(0, 30)
  }, [photos, activeCamera])

  const selectedPhoto = photos.find((p) => p.id === selectedId)
  const selectedAnalysis = selectedId != null ? photoAnalyses[selectedId] : null

  function handleDateSearch() {
    if (!dateInput) return
    setSelectedDate(dateInput)
    setSelectedId(null)
    setActiveCamera("Todas")
  }

  function handleLatest() {
    setDateInput("")
    clearSelectedDate()
    setSelectedId(null)
    setActiveCamera("Todas")
  }

  function handleRover(rover: string) {
    setSelectedRover(rover)
    setSelectedId(null)
    setActiveCamera("Todas")
  }

  async function handleSelect(photo: NASAPhoto) {
    setSelectedId(photo.id)
    if (photoAnalyses[photo.id]) return

    setAnalysisLoading(true)
    try {
      const res = await fetch("/api/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imgSrc: photo.img_src,
          camera: photo.camera,
          cameraFullName: photo.camera_full_name,
          sol: photo.sol,
          earthDate: photo.earth_date,
          rover: photo.rover,
        }),
      })
      const data = await res.json()
      setPhotoAnalysis(photo.id, {
        analysis: data.analysis ?? "Análisis no disponible.",
        interest: data.interest ?? "medio",
      })
    } catch {
      setPhotoAnalysis(photo.id, {
        analysis: "Análisis no disponible, intentá de nuevo.",
        interest: "medio",
      })
    } finally {
      setAnalysisLoading(false)
    }
  }

  const isLoadingCurrent = analysisLoading && selectedId != null && !photoAnalyses[selectedId]
  const dateLabel = !selectedDate
    ? `Últimas disponibles · ${formatDate(loadedDate)}`
    : isExactDate
      ? formatDate(loadedDate)
      : `Sin fotos para ${formatDate(selectedDate)}`

  return (
    <>
      <div className="superficie-header">
        <div>
          <h2 className="section-title" style={{ marginBottom: "0.25rem" }}>
            Imágenes de superficie
          </h2>
          {!photosLoading && photos.length > 0 && (
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
              {photos.length} fotos · {dateLabel}
            </div>
          )}
        </div>

        <div className="sol-filter" style={{ gap: "0.5rem" }}>
          <input
            type="date"
            className="sol-input"
            value={dateInput}
            max={todayStr()}
            onChange={(e) => setDateInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleDateSearch() }}
          />
          <button className="sol-btn" onClick={handleDateSearch} disabled={photosLoading || !dateInput}>
            {photosLoading ? "..." : "Buscar"}
          </button>
          {selectedDate && (
            <button className="sol-btn" onClick={handleLatest} style={{ background: "var(--color-accent)" }}>
              Últimas
            </button>
          )}
        </div>
      </div>

      {/* Rover selector */}
      <div className="filter-chips" style={{ marginTop: "0.75rem" }}>
        {ROVERS.map((r) => (
          <button
            key={r.id}
            className={`filter-chip ${selectedRover === r.id ? "active" : ""}`}
            onClick={() => handleRover(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Cámara selector (dinámico según las fotos cargadas) */}
      {!photosLoading && activeCameras.length > 1 && (
        <div className="filter-chips" style={{ marginTop: "0.5rem" }}>
          {activeCameras.map((cam) => (
            <button
              key={cam}
              className={`filter-chip ${activeCamera === cam ? "active" : ""}`}
              onClick={() => setActiveCamera(cam)}
            >
              {cam}
            </button>
          ))}
        </div>
      )}

      {photosLoading && (
        <div className="skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-img skeleton-anim" />
              <div className="skeleton-info">
                <div className="skeleton-line skeleton-anim" style={{ width: "40%" }} />
                <div className="skeleton-line skeleton-anim" style={{ width: "60%" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!photosLoading && photos.length === 0 && selectedDate && (
        <div className="loading-state" style={{ flexDirection: "column", gap: "0.75rem" }}>
          <span>No hay fotos disponibles para el {formatDate(selectedDate)}.</span>
          <button className="sol-btn" onClick={handleLatest} style={{ background: "var(--color-accent)" }}>
            Ver últimas disponibles
          </button>
        </div>
      )}

      {!photosLoading && photos.length > 0 && filtered.length === 0 && (
        <div className="loading-state">No hay fotos para esta cámara.</div>
      )}

      {!photosLoading && (
        <div className="photo-gallery-large">
          {filtered.map((photo, idx) => {
            const cached = photoAnalyses[photo.id]
            const interestData = cached ? (INTEREST_BADGE[cached.interest] ?? INTEREST_BADGE.medio) : null
            const roverLabel = photo.rover === "perseverance" ? "Perseverance" : photo.rover === "curiosity" ? "Curiosity" : photo.rover
            return (
              <div
                key={photo.id}
                className={`photo-card photo-card-large ${selectedId === photo.id ? "selected" : ""}`}
                onClick={() => handleSelect(photo)}
              >
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
                  <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                    <span className="badge info">{photo.earth_date}</span>
                    <span className="badge secondary">{roverLabel}</span>
                    {interestData && (
                      <span className={`badge ${interestData.cls}`}>{interestData.label}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedPhoto && (
        <div className="detail-panel">
          <div className="detail-title">
            {selectedPhoto.camera_full_name} — Sol {selectedPhoto.sol}
            <span style={{ fontWeight: 400, fontSize: "0.8em", marginLeft: "0.5rem", textTransform: "capitalize" }}>
              ({selectedPhoto.rover})
            </span>
          </div>
          <div className="detail-meta">
            Foto #{selectedPhoto.id} · {selectedPhoto.earth_date}
            {selectedAnalysis && (
              <span
                className={`badge ${INTEREST_BADGE[selectedAnalysis.interest]?.cls ?? "warning"}`}
                style={{ marginLeft: "0.5rem" }}
              >
                {INTEREST_BADGE[selectedAnalysis.interest]?.label ?? "Interés medio"}
              </span>
            )}
          </div>
          <div className="detail-analysis">
            {isLoadingCurrent ? (
              <>
                <div className="skeleton-line skeleton-anim" style={{ width: "90%", marginBottom: "0.5rem" }} />
                <div className="skeleton-line skeleton-anim" style={{ width: "75%", marginBottom: "0.5rem" }} />
                <span className="loading-text">Claude está analizando la imagen...</span>
              </>
            ) : selectedAnalysis ? (
              <><strong>Análisis IA:</strong> {selectedAnalysis.analysis}</>
            ) : (
              <span className="loading-text">Seleccioná una foto para ver el análisis.</span>
            )}
          </div>
        </div>
      )}
    </>
  )
}
