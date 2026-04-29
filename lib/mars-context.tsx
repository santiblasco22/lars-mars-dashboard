"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

export interface NASAPhoto {
  id: number
  sol: number
  rover: string
  camera: string
  camera_full_name: string
  img_src: string
  earth_date: string
}

export interface ClimatePoint {
  sol: number
  max: number
  min: number
  pressure: number
  wind: number
}

export interface Alert {
  type: "danger" | "warning" | "info"
  message: string
}

export interface GeologicalFinding {
  name: string
  coordinates: string
  sol: number
  description: string
  minerals: string[]
  badge: string
  badgeType: string
}

export interface PhotoAnalysis {
  analysis: string
  interest: string
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

interface LarsContextType {
  photos: NASAPhoto[]
  photosLoading: boolean
  usedMock: boolean
  loadedDate: string
  isExactDate: boolean
  selectedDate: string
  setSelectedDate: (date: string) => void
  clearSelectedDate: () => void
  selectedRover: string
  setSelectedRover: (rover: string) => void
  climate: ClimatePoint[]
  currentSol: number
  alerts: Alert[]
  geology: GeologicalFinding[]
  geologyLoading: boolean
  photoAnalyses: Record<number, PhotoAnalysis>
  setPhotoAnalysis: (id: number, data: PhotoAnalysis) => void
}

const LarsContext = createContext<LarsContextType>({
  photos: [],
  photosLoading: true,
  usedMock: false,
  loadedDate: todayStr(),
  isExactDate: false,
  selectedDate: "",
  setSelectedDate: () => {},
  clearSelectedDate: () => {},
  selectedRover: "all",
  setSelectedRover: () => {},
  climate: [],
  currentSol: 4500,
  alerts: [],
  geology: [],
  geologyLoading: false,
  photoAnalyses: {},
  setPhotoAnalysis: () => {},
})

export function useLars() {
  return useContext(LarsContext)
}

const MOCK_CLIMATE: ClimatePoint[] = [
  { sol: 4494, max: -18, min: -82, pressure: 751, wind: 14 },
  { sol: 4495, max: -22, min: -80, pressure: 748, wind: 16 },
  { sol: 4496, max: -25, min: -85, pressure: 745, wind: 12 },
  { sol: 4497, max: -20, min: -78, pressure: 752, wind: 18 },
  { sol: 4498, max: -19, min: -76, pressure: 749, wind: 20 },
  { sol: 4499, max: -21, min: -79, pressure: 747, wind: 15 },
  { sol: 4500, max: -23, min: -78, pressure: 748, wind: 18 },
]

function computeAlerts(climate: ClimatePoint[]): Alert[] {
  const alerts: Alert[] = []
  const last = climate[climate.length - 1]
  if (!last) return alerts
  if (last.max > -10) alerts.push({ type: "warning", message: `Temp. alta: ${last.max}°C` })
  if (last.min < -90) alerts.push({ type: "danger", message: `Mínima extrema: ${last.min}°C` })
  if (last.wind > 25) alerts.push({ type: "warning", message: `Viento: ${last.wind} m/s` })
  if (last.pressure < 700) alerts.push({ type: "danger", message: `Presión baja: ${last.pressure} Pa` })
  return alerts
}

export function LarsProvider({ children }: { children: React.ReactNode }) {
  const [photos, setPhotos] = useState<NASAPhoto[]>([])
  const [photosLoading, setPhotosLoading] = useState(true)
  const [usedMock, setUsedMock] = useState(false)
  const [loadedDate, setLoadedDate] = useState(todayStr())
  const [isExactDate, setIsExactDate] = useState(false)
  // selectedDate vacío = cargar latest_photos; con valor = buscar esa fecha exacta
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedRover, setSelectedRover] = useState("all")

  function clearSelectedDate() {
    setSelectedDate("")
  }
  const [climate] = useState<ClimatePoint[]>(MOCK_CLIMATE)
  const [geology, setGeology] = useState<GeologicalFinding[]>([])
  const [geologyLoading, setGeologyLoading] = useState(false)
  const [photoAnalyses, setPhotoAnalyses] = useState<Record<number, PhotoAnalysis>>({})

  const setPhotoAnalysis = useCallback((id: number, data: PhotoAnalysis) => {
    setPhotoAnalyses((prev) => ({ ...prev, [id]: data }))
  }, [])

  const currentSol = climate[climate.length - 1]?.sol ?? 4500
  const alerts = computeAlerts(climate)

  useEffect(() => {
    async function fetchPhotos() {
      setPhotosLoading(true)
      setPhotos([])
      setGeology([])
      try {
        const params = new URLSearchParams({ rover: selectedRover })
        if (selectedDate) params.set("earth_date", selectedDate)
        const res = await fetch(`/api/nasa-photos?${params}`)
        const data = await res.json()
        const fetched: NASAPhoto[] = data.photos ?? []
        if (fetched.length > 0) {
          setPhotos(fetched)
          setLoadedDate(data.earth_date ?? selectedDate)
          setIsExactDate(data.exact ?? false)
          setUsedMock(false)
        } else {
          setUsedMock(true)
          setIsExactDate(false)
          setLoadedDate(selectedDate || todayStr())
        }
      } catch {
        setUsedMock(true)
        setIsExactDate(false)
        setLoadedDate(selectedDate || todayStr())
      } finally {
        setPhotosLoading(false)
      }
    }
    fetchPhotos()
  }, [selectedDate, selectedRover])

  useEffect(() => {
    if (photos.length === 0 || geologyLoading || geology.length > 0) return

    async function fetchGeology() {
      setGeologyLoading(true)
      try {
        const cameras = [...new Set(photos.map((p) => p.camera))]
        const latestSol = photos[0]?.sol ?? currentSol
        const res = await fetch("/api/geology", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cameras, latestSol, climate }),
        })
        const data = await res.json()
        if (data.findings) setGeology(data.findings)
      } catch {
        // fallback en la vista
      } finally {
        setGeologyLoading(false)
      }
    }

    fetchGeology()
  }, [photos])

  return (
    <LarsContext.Provider
      value={{
        photos,
        photosLoading,
        usedMock,
        loadedDate,
        isExactDate,
        selectedDate,
        setSelectedDate,
        clearSelectedDate,
        selectedRover,
        setSelectedRover,
        climate,
        currentSol,
        alerts,
        geology,
        geologyLoading,
        photoAnalyses,
        setPhotoAnalysis,
      }}
    >
      {children}
    </LarsContext.Provider>
  )
}
