// New endpoint: api.nasa.gov/mars-photos is down — using mars.nasa.gov raw image gallery
const RAW_API = "https://mars.nasa.gov/api/v1/raw_image_items"
const PER_PAGE = 100

// Curiosity landed 2012-08-06; Martian sol ≈ 88775s vs Earth 86400s
const CURIOSITY_LANDING_MS = new Date("2012-08-06").getTime()
const SOL_MS = 88775.24 * 1000

export interface NASAPhoto {
  id: number
  sol: number
  rover: string
  camera: string
  camera_full_name: string
  img_src: string
  earth_date: string
}

// Known average photos per sol across the full MSL archive (1.45M photos / ~4880 sols)
const AVG_PHOTOS_PER_SOL = 298

const INSTRUMENT_SHORT: Record<string, string> = {
  CHEMCAM_RMI: "CHEMCAM",
  FHAZ_LEFT_B: "FHAZ",
  FHAZ_RIGHT_B: "FHAZ",
  RHAZ_LEFT_B: "RHAZ",
  RHAZ_RIGHT_B: "RHAZ",
  NAV_LEFT_B: "NAVCAM",
  NAV_RIGHT_B: "NAVCAM",
  MAST_LEFT: "MAST",
  MAST_RIGHT: "MAST",
  MAHLI: "MAHLI",
  MARDI: "MARDI",
  FRONT_HAZCAM_LEFT_A: "FHAZ",
  FRONT_HAZCAM_RIGHT_A: "FHAZ",
  REAR_HAZCAM_LEFT: "RHAZ",
  REAR_HAZCAM_RIGHT: "RHAZ",
  NAVCAM_LEFT: "NAVCAM",
  NAVCAM_RIGHT: "NAVCAM",
  MCZ_LEFT: "MCZ",
  MCZ_RIGHT: "MCZ",
}

interface RawItem {
  id: number
  sol: number
  instrument: string
  https_url: string
  date_taken: string
  title: string
  mission: string
  is_thumbnail: boolean
}

function mapPhoto(item: RawItem): NASAPhoto {
  const rover = item.mission === "msl" ? "curiosity" : "perseverance"
  const camera = INSTRUMENT_SHORT[item.instrument] ?? item.instrument
  const camera_full_name = item.title.replace(/^Sol \d+:\s*/, "")
  const earth_date = (item.date_taken ?? "").slice(0, 10)
  return { id: item.id, sol: item.sol, rover, camera, camera_full_name, img_src: item.https_url, earth_date }
}

async function fetchPage(page: number): Promise<RawItem[]> {
  try {
    const res = await fetch(
      `${RAW_API}/?order=sol+desc&per_page=${PER_PAGE}&page=${page}`,
      { cache: "no-store" }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.items ?? []).filter((i: RawItem) => !i.is_thumbnail && i.https_url)
  } catch {
    return []
  }
}

function dedupe(items: RawItem[]): RawItem[] {
  const seen = new Set<number>()
  return items.filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true })
}

// Estimate which page contains a given earth_date, based on sol offset from latest
function dateToPage(earthDate: string, latestSol: number): number {
  const targetMs = new Date(earthDate).getTime()
  const targetSol = Math.floor((targetMs - CURIOSITY_LANDING_MS) / SOL_MS)
  const solDiff = Math.max(0, latestSol - targetSol)
  const photoDiff = solDiff * AVG_PHOTOS_PER_SOL
  return Math.floor(photoDiff / PER_PAGE)
}

// Convert a Curiosity sol number to an approximate Earth date string
function solToEarthDate(sol: number): string {
  const ms = CURIOSITY_LANDING_MS + sol * SOL_MS
  return new Date(ms).toISOString().slice(0, 10)
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const solParam = url.searchParams.get("sol")
  const earthDateParam = solParam ? solToEarthDate(parseInt(solParam)) : url.searchParams.get("earth_date")

  if (earthDateParam) {
    // Fetch the latest batch first to learn the current sol, then estimate the target page
    const firstPage = await fetchPage(0)
    const latestSol = firstPage[0]?.sol ?? 4880

    const targetPage = dateToPage(earthDateParam, latestSol)
    // Fetch 3 consecutive pages around the estimate for coverage
    const pages = [
      Math.max(0, targetPage - 1),
      targetPage,
      targetPage + 1,
    ]
    const batches = await Promise.all(pages.map(p => fetchPage(p)))
    const items = dedupe(batches.flat())

    if (items.length === 0) {
      // Fallback: return latest
      const fallback = dedupe(firstPage)
      const photos = fallback.map(mapPhoto)
      return Response.json({ photos, earth_date: photos[0]?.earth_date ?? earthDateParam, exact: false })
    }

    // Filter to photos closest to the requested date (within ±3 days)
    const targetDate = new Date(earthDateParam)
    const close = items.filter(i => {
      const d = new Date(i.date_taken)
      return Math.abs(d.getTime() - targetDate.getTime()) <= 3 * 24 * 3600 * 1000
    })

    const finalItems = close.length > 0 ? close : items
    const photos = dedupe(finalItems).map(mapPhoto)
    const loadedDate = photos[0]?.earth_date ?? earthDateParam
    const isExact = loadedDate === earthDateParam

    return Response.json({ photos, earth_date: loadedDate, exact: isExact })
  }

  // Latest photos: fetch 4 pages spread across different camera types
  const batches = await Promise.all([0, 5, 10, 20].map(p => fetchPage(p)))
  const items = dedupe(batches.flat())
  const photos = items.map(mapPhoto)
  const earth_date = photos[0]?.earth_date ?? new Date().toISOString().slice(0, 10)

  return Response.json({ photos, earth_date, exact: false })
}
