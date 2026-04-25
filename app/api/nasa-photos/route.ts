const MARS_PHOTOS_API = "https://api.nasa.gov/mars-photos/api/v1"
const IMAGE_LIBRARY_API = "https://images-api.nasa.gov/search"
const API_KEY = process.env.NASA_API_KEY ?? "DEMO_KEY"

interface NASAPhoto {
  id: number
  sol: number
  camera: string
  camera_full_name: string
  img_src: string
  earth_date: string
}

const CAMERA_MAP: Record<string, string> = {
  NAVCAM: "Navigation Camera",
  MAST: "Mast Camera",
  FHAZ: "Front Hazard Avoidance Camera",
  RHAZ: "Rear Hazard Avoidance Camera",
  CHEMCAM: "Chemistry and Camera Complex",
  MAHLI: "Mars Hand Lens Imager",
}

// Búsquedas por cámara en la Image Library
const CAMERA_QUERIES: Array<{ camera: string; query: string; sol: number }> = [
  { camera: "NAVCAM", query: "curiosity navcam mars surface rocks", sol: 3956 },
  { camera: "MAST",   query: "curiosity mastcam mars landscape geology", sol: 3957 },
  { camera: "FHAZ",   query: "curiosity front hazard camera mars terrain", sol: 3958 },
  { camera: "RHAZ",   query: "curiosity rear hazard camera mars ground", sol: 3959 },
  { camera: "NAVCAM", query: "curiosity rover mars panorama crater gale", sol: 3960 },
  { camera: "MAST",   query: "curiosity rover mars mount sharp strata", sol: 3961 },
  { camera: "FHAZ",   query: "mars rover surface rocks close sediment", sol: 3962 },
  { camera: "RHAZ",   query: "curiosity mars rover tracks wheels ground", sol: 3963 },
]

async function fetchFromMarsPhotosAPI(sol?: string): Promise<NASAPhoto[] | null> {
  const urls = sol
    ? [`${MARS_PHOTOS_API}/rovers/curiosity/photos?sol=${sol}&api_key=${API_KEY}`]
    : [
        `${MARS_PHOTOS_API}/rovers/curiosity/latest_photos?api_key=${API_KEY}`,
        `${MARS_PHOTOS_API}/rovers/curiosity/photos?sol=3956&api_key=${API_KEY}`,
        `${MARS_PHOTOS_API}/rovers/curiosity/photos?sol=3800&api_key=${API_KEY}`,
      ]

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) continue
      const data = await res.json()
      const raw = data.latest_photos ?? data.photos ?? []
      if (raw.length === 0) continue
      return raw.slice(0, 20).map((p: any) => ({
        id: p.id,
        sol: p.sol,
        camera: p.camera.name,
        camera_full_name: p.camera.full_name,
        img_src: p.img_src,
        earth_date: p.earth_date,
      }))
    } catch {
      continue
    }
  }
  return null
}

async function fetchFromImageLibrary(): Promise<NASAPhoto[]> {
  const results: NASAPhoto[] = []

  await Promise.all(
    CAMERA_QUERIES.map(async ({ camera, query, sol }, idx) => {
      try {
        const url = `${IMAGE_LIBRARY_API}?q=${encodeURIComponent(query)}&media_type=image&page_size=2`
        const res = await fetch(url, { next: { revalidate: 3600 } })
        if (!res.ok) return
        const data = await res.json()
        const items = data.collection?.items ?? []

        for (const item of items.slice(0, 2)) {
          const href = item.links?.[0]?.href
          const dateCreated = item.data?.[0]?.date_created?.slice(0, 10) ?? "2022-11-01"
          if (href) {
            results.push({
              id: 1000 + idx * 10 + results.length,
              sol,
              camera,
              camera_full_name: CAMERA_MAP[camera] ?? camera,
              img_src: href,
              earth_date: dateCreated,
            })
          }
        }
      } catch {
        // skip this camera
      }
    })
  )

  // Si no se obtuvieron suficientes, completar con datos vacíos
  if (results.length === 0) {
    return CAMERA_QUERIES.map(({ camera, sol }, idx) => ({
      id: 2000 + idx,
      sol,
      camera,
      camera_full_name: CAMERA_MAP[camera] ?? camera,
      img_src: "",
      earth_date: "2022-11-01",
    }))
  }

  return results
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const sol = url.searchParams.get("sol") ?? undefined

  // 1. Intentar Mars Photos API (real data con metadatos de sol)
  const marsPhotos = await fetchFromMarsPhotosAPI(sol)
  if (marsPhotos && marsPhotos.length > 0) {
    return Response.json({ photos: marsPhotos, source: "nasa-mars-api" })
  }

  // 2. Si no hay sol específico, usar NASA Image Library (imágenes reales, sin key)
  if (!sol) {
    const libraryPhotos = await fetchFromImageLibrary()
    return Response.json({ photos: libraryPhotos, source: "nasa-image-library" })
  }

  return Response.json({ photos: [], source: "empty" })
}
