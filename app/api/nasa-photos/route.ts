const MARS_PHOTOS_API = "https://api.nasa.gov/mars-photos/api/v1"
const API_KEY = process.env.NASA_API_KEY ?? "DEMO_KEY"

type Rover = "perseverance" | "curiosity"

export interface NASAPhoto {
  id: number
  sol: number
  rover: string
  camera: string
  camera_full_name: string
  img_src: string
  earth_date: string
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10)
}

async function fetchByEarthDate(rover: Rover, earthDate: string): Promise<NASAPhoto[]> {
  try {
    const url = `${MARS_PHOTOS_API}/rovers/${rover}/photos?earth_date=${earthDate}&api_key=${API_KEY}`
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    return (data.photos ?? []).slice(0, 30).map((p: any) => ({
      id: p.id,
      sol: p.sol,
      rover,
      camera: p.camera.name,
      camera_full_name: p.camera.full_name,
      img_src: p.img_src,
      earth_date: p.earth_date,
    }))
  } catch {
    return []
  }
}

async function fetchBySol(rover: Rover, sol: string): Promise<NASAPhoto[]> {
  try {
    const url = `${MARS_PHOTOS_API}/rovers/${rover}/photos?sol=${sol}&api_key=${API_KEY}`
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    return (data.photos ?? []).slice(0, 30).map((p: any) => ({
      id: p.id,
      sol: p.sol,
      rover,
      camera: p.camera.name,
      camera_full_name: p.camera.full_name,
      img_src: p.img_src,
      earth_date: p.earth_date,
    }))
  } catch {
    return []
  }
}

async function fetchLatest(rover: Rover): Promise<NASAPhoto[]> {
  try {
    const url = `${MARS_PHOTOS_API}/rovers/${rover}/latest_photos?api_key=${API_KEY}`
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    return (data.latest_photos ?? []).slice(0, 20).map((p: any) => ({
      id: p.id,
      sol: p.sol,
      rover,
      camera: p.camera.name,
      camera_full_name: p.camera.full_name,
      img_src: p.img_src,
      earth_date: p.earth_date,
    }))
  } catch {
    return []
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const earthDateParam = url.searchParams.get("earth_date")
  const solParam = url.searchParams.get("sol")
  const roverParam = url.searchParams.get("rover") ?? "all"

  const rovers: Rover[] = roverParam === "all"
    ? ["perseverance", "curiosity"]
    : [roverParam as Rover]

  // Búsqueda por sol
  if (solParam) {
    const rover = rovers[0]
    const photos = await fetchBySol(rover, solParam)
    return Response.json({ photos, source: "nasa-mars-api", rover })
  }

  // Búsqueda por fecha exacta elegida por el usuario
  if (earthDateParam) {
    const results = await Promise.all(rovers.map(r => fetchByEarthDate(r, earthDateParam)))
    const seen = new Set<number>()
    const photos: NASAPhoto[] = []
    for (const p of results.flat()) {
      if (!seen.has(p.id)) { seen.add(p.id); photos.push(p) }
    }
    return Response.json({ photos, source: "nasa-mars-api", earth_date: earthDateParam, exact: true })
  }

  // Default: latest_photos de cada rover (sin adivinar fechas, 1 request por rover)
  const results = await Promise.all(rovers.map(r => fetchLatest(r)))
  const seen = new Set<number>()
  const photos: NASAPhoto[] = []
  for (const p of results.flat()) {
    if (!seen.has(p.id)) { seen.add(p.id); photos.push(p) }
  }
  const earth_date = photos[0]?.earth_date ?? toDateStr(new Date())
  return Response.json({ photos, source: "nasa-mars-api", earth_date, exact: false })
}
