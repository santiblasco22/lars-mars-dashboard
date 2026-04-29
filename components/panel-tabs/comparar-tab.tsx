"use client"

import { useState } from "react"

interface NASAPhoto {
  id: number
  sol: number
  camera: string
  img_src: string
  earth_date: string
}

async function fetchPhotosBySol(sol: string): Promise<NASAPhoto[]> {
  const res = await fetch(`/api/nasa-photos?sol=${sol}`)
  const data = await res.json()
  return (data.photos ?? []).slice(0, 4)
}

export function CompararTab() {
  const [solA, setSolA] = useState("4490")
  const [solB, setSolB] = useState("4500")
  const [photosA, setPhotosA] = useState<NASAPhoto[]>([])
  const [photosB, setPhotosB] = useState<NASAPhoto[]>([])
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasResults, setHasResults] = useState(false)

  async function handleCompare() {
    setLoading(true)
    setError(null)
    setAnalysis(null)
    setPhotosA([])
    setPhotosB([])
    setHasResults(false)

    try {
      const [pA, pB] = await Promise.all([
        fetchPhotosBySol(solA),
        fetchPhotosBySol(solB),
      ])
      setPhotosA(pA)
      setPhotosB(pB)
      setHasResults(true)

      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solA, solB, photosA: pA, photosB: pB }),
      })
      const data = await res.json()
      setAnalysis(data.analysis)
    } catch {
      setError("No se pudo cargar las fotos. Verifica la conexion.")
    } finally {
      setLoading(false)
    }
  }

  function PhotoSlot({ photo }: { photo?: NASAPhoto }) {
    const [error, setError] = useState(false)
    return (
      <div className="compare-photo">
        {photo?.img_src && !error ? (
          <img src={photo.img_src} alt={`Sol ${photo.sol} ${photo.camera}`} onError={() => setError(true)} />
        ) : (
          <span className="compare-no-img">{photo?.camera ?? "Sin foto"}</span>
        )}
      </div>
    )
  }

  return (
    <div className="compare-content">
      <div className="compare-inputs">
        <div className="compare-field">
          <div className="compare-label">Sol A</div>
          <input
            type="number"
            className="compare-input"
            value={solA}
            onChange={(e) => setSolA(e.target.value)}
          />
        </div>
        <div className="compare-field">
          <div className="compare-label">Sol B</div>
          <input
            type="number"
            className="compare-input"
            value={solB}
            onChange={(e) => setSolB(e.target.value)}
          />
        </div>
      </div>
      <button className="compare-button" onClick={handleCompare} disabled={loading}>
        {loading ? "Comparando..." : "Comparar"}
      </button>

      {error && <div className="compare-error">{error}</div>}

      {hasResults && (
        <>
          <div className="compare-side-by-side">
            <div className="compare-column">
              <div className="compare-col-header">Sol {solA} ({photosA.length} fotos)</div>
              {photosA.slice(0, 2).map((p) => <PhotoSlot key={p.id} photo={p} />)}
              {photosA.length === 0 && <PhotoSlot />}
            </div>
            <div className="compare-divider" />
            <div className="compare-column">
              <div className="compare-col-header">Sol {solB} ({photosB.length} fotos)</div>
              {photosB.slice(0, 2).map((p) => <PhotoSlot key={p.id} photo={p} />)}
              {photosB.length === 0 && <PhotoSlot />}
            </div>
          </div>

          {loading && !analysis && (
            <div className="compare-result loading-text">Claude esta analizando las diferencias...</div>
          )}
          {analysis && (
            <div className="compare-result">
              <strong>Analisis comparativo:</strong> {analysis}
            </div>
          )}
        </>
      )}
    </div>
  )
}
