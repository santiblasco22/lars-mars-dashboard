"use client"

import { useState, useMemo } from "react"
import { useLars, NASAPhoto } from "@/lib/mars-context"
import { TerrainSvg } from "../terrain-svg"

const CAMERAS = ["Todas", "NAVCAM", "MAST", "FHAZ", "RHAZ"]

const MOCK_PHOTOS: NASAPhoto[] = [
  { id: 1, sol: 4498, camera: "NAVCAM", camera_full_name: "Navigation Camera", img_src: "", earth_date: "2024-01-01" },
  { id: 2, sol: 4499, camera: "MAST", camera_full_name: "Mast Camera", img_src: "", earth_date: "2024-01-02" },
  { id: 3, sol: 4500, camera: "FHAZ", camera_full_name: "Front Hazard Avoidance Camera", img_src: "", earth_date: "2024-01-03" },
  { id: 4, sol: 4497, camera: "RHAZ", camera_full_name: "Rear Hazard Avoidance Camera", img_src: "", earth_date: "2023-12-31" },
  { id: 5, sol: 4500, camera: "NAVCAM", camera_full_name: "Navigation Camera", img_src: "", earth_date: "2024-01-03" },
  { id: 6, sol: 4499, camera: "MAST", camera_full_name: "Mast Camera", img_src: "", earth_date: "2024-01-02" },
  { id: 7, sol: 4498, camera: "FHAZ", camera_full_name: "Front Hazard Avoidance Camera", img_src: "", earth_date: "2024-01-01" },
  { id: 8, sol: 4497, camera: "RHAZ", camera_full_name: "Rear Hazard Avoidance Camera", img_src: "", earth_date: "2023-12-31" },
]

const INTEREST_BADGE: Record<string, { label: string; cls: string }> = {
  alto:  { label: "Interes alto",  cls: "danger"  },
  medio: { label: "Interes medio", cls: "warning" },
  bajo:  { label: "Interes bajo",  cls: "success" },
}

export function Superficie() {
  const { photos, photosLoading, usedMock, photoAnalyses, setPhotoAnalysis } = useLars()

  const [activeCamera, setActiveCamera] = useState("Todas")
  const [solInput, setSolInput] = useState("")
  const [solPhotos, setSolPhotos] = useState<NASAPhoto[] | null>(null)
  const [solLoading, setSolLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  const basePhotos: NASAPhoto[] = solPhotos ?? (photos.length > 0 ? photos : MOCK_PHOTOS)
  const showMockBadge = usedMock && !solPhotos

  const filtered = useMemo(() => {
    const list = activeCamera === "Todas" ? basePhotos : basePhotos.filter((p) => p.camera === activeCamera)
    return list.slice(0, 20)
  }, [basePhotos, activeCamera])

  const selectedPhoto = basePhotos.find((p) => p.id === selectedId)
  const selectedAnalysis = selectedId != null ? photoAnalyses[selectedId] : null

  async function handleSolSearch() {
    const sol = solInput.trim()
    if (!sol) { setSolPhotos(null); return }
    setSolLoading(true)
    setSolPhotos(null)
    setSelectedId(null)
    try {
      const res = await fetch(`/api/nasa-photos?sol=${sol}`)
      const data = await res.json()
      setSolPhotos(data.photos ?? [])
    } catch {
      setSolPhotos([])
    } finally {
      setSolLoading(false)
    }
  }

  function clearSolFilter() {
    setSolInput("")
    setSolPhotos(null)
    setSelectedId(null)
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
        }),
      })
      const data = await res.json()
      setPhotoAnalysis(photo.id, {
        analysis: data.analysis ?? "Analisis no disponible.",
        interest: data.interest ?? "medio",
      })
    } catch {
      setPhotoAnalysis(photo.id, {
        analysis: "Analisis no disponible, intenta de nuevo.",
        interest: "medio",
      })
    } finally {
      setAnalysisLoading(false)
    }
  }

  const isLoadingCurrent = analysisLoading && selectedId != null && !photoAnalyses[selectedId]

  return (
    <>
      <div className="superficie-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          Imagenes de superficie
          {showMockBadge && <span className="mock-badge">Datos simulados</span>}
        </h2>
        <div className="sol-filter">
          <input
            type="number"
            className="sol-input"
            placeholder="N de sol"
            value={solInput}
            onChange={(e) => setSolInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSolSearch() }}
          />
          <button className="sol-btn" onClick={handleSolSearch} disabled={solLoading}>
            {solLoading ? "..." : "Buscar"}
          </button>
          {solPhotos !== null && (
            <button className="sol-clear" onClick={clearSolFilter}>x</button>
          )}
        </div>
      </div>

      <div className="filter-chips" style={{ marginTop: "0.75rem" }}>
        {CAMERAS.map((cam) => (
          <button
            key={cam}
            className={`filter-chip ${activeCamera === cam ? "active" : ""}`}
            onClick={() => setActiveCamera(cam)}
          >
            {cam}
          </button>
        ))}
      </div>

      {(photosLoading || solLoading) && (
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

      {!photosLoading && !solLoading && filtered.length === 0 && (
        <div className="loading-state">No hay fotos para este filtro.</div>
      )}

      {!photosLoading && !solLoading && (
        <div className="photo-gallery-large">
          {filtered.map((photo, idx) => {
            const cached = photoAnalyses[photo.id]
            const interestData = cached ? (INTEREST_BADGE[cached.interest] ?? INTEREST_BADGE.medio) : null
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
            {selectedPhoto.camera_full_name} - Sol {selectedPhoto.sol}
          </div>
          <div className="detail-meta">
            Foto #{selectedPhoto.id} - {selectedPhoto.earth_date}
            {selectedAnalysis && (
              <span
                className={`badge ${INTEREST_BADGE[selectedAnalysis.interest]?.cls ?? "warning"}`}
                style={{ marginLeft: "0.5rem" }}
              >
                {INTEREST_BADGE[selectedAnalysis.interest]?.label ?? "Interes medio"}
              </span>
            )}
          </div>
          <div className="detail-analysis">
            {isLoadingCurrent ? (
              <>
                <div className="skeleton-line skeleton-anim" style={{ width: "90%", marginBottom: "0.5rem" }} />
                <div className="skeleton-line skeleton-anim" style={{ width: "75%", marginBottom: "0.5rem" }} />
                <span className="loading-text">Claude esta analizando la imagen...</span>
              </>
            ) : selectedAnalysis ? (
              <><strong>Analisis IA:</strong> {selectedAnalysis.analysis}</>
            ) : (
              <span className="loading-text">Selecciona una foto para ver el analisis.</span>
            )}
          </div>
        </div>
      )}
    </>
  )
}
