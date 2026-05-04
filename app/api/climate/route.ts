// Curiosity landing: 2012-08-06T05:17:00Z, Ls ≈ 151.6°
const LANDING_MS = new Date("2012-08-06T05:17:00Z").getTime()
const SOL_MS = 88775.244 * 1000 // 1 Martian sol in ms
const MARS_YEAR_SOLS = 668.5991
const LS_AT_LANDING = 151.6

// Deterministic noise seeded by sol — same sol always gives same values
function noise(sol: number, seed: number): number {
  const x = Math.sin(sol * 127.1 + seed * 311.7) * 43758.5453
  return (x - Math.floor(x)) - 0.5 // range -0.5..0.5
}

function solToLs(sol: number): number {
  return ((LS_AT_LANDING + (sol / MARS_YEAR_SOLS) * 360) % 360 + 360) % 360
}

function lsToClimate(sol: number, ls: number) {
  // Seasonal temp model for Gale Crater (−4.6°, 137.4°) based on REMS archive
  // Northern Summer (Ls 90) = warmest; Northern Winter (Ls 270) = coldest
  const tempBias = -20 + 14 * Math.sin(((ls - 90) * Math.PI) / 180)
  const max = Math.round(tempBias + 4 + noise(sol, 1) * 6)
  const min = Math.round(tempBias - 58 + noise(sol, 2) * 8)

  // Pressure: min ~700 Pa at Ls 145 (southern summer sublimation), max ~900 Pa at Ls 330
  const pressure = Math.round(800 - 100 * Math.cos(((ls - 240) * Math.PI) / 180) + noise(sol, 3) * 12)

  // Wind: 10–22 m/s typical for Gale Crater
  const wind = Math.round(14 + 5 * Math.sin((ls * Math.PI) / 60) + noise(sol, 4) * 4)
  const windDirs = ["N", "NE", "NE", "NW", "W", "NW", "N"]
  const windDir = windDirs[Math.abs(Math.floor(noise(sol, 5) * 7)) % 7]

  // Atmospheric opacity — mostly Sunny, occasionally Cloudy near Ls 0 (dust season)
  const dustRisk = Math.sin(((ls - 180) * Math.PI) / 180)
  const opacity = dustRisk > 0.6 && noise(sol, 6) > 0.2 ? "Cloudy" : "Sunny"

  // Sunrise / sunset at Gale Crater (lat −4.6°)
  // Day length ≈ 12h + 1.5h·sin(Ls − 90)
  const dayHours = 12 + 1.5 * Math.sin(((ls - 90) * Math.PI) / 180)
  const sunriseH = 12 - dayHours / 2
  const sunsetH = 12 + dayHours / 2
  const fmt = (h: number) => {
    const hh = Math.floor(h)
    const mm = Math.round((h - hh) * 60)
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
  }

  return { sol, max, min, pressure, wind: Math.max(8, wind), windDir, opacity, sunrise: fmt(sunriseH), sunset: fmt(sunsetH), ls: Math.round(ls * 10) / 10 }
}

export function getCurrentSol(): number {
  return Math.floor((Date.now() - LANDING_MS) / SOL_MS)
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const solParam = url.searchParams.get("sol")
  const currentSol = solParam ? parseInt(solParam) : getCurrentSol()

  const climate = Array.from({ length: 7 }, (_, i) => {
    const sol = currentSol - 6 + i
    const ls = solToLs(sol)
    return lsToClimate(sol, ls)
  })

  return Response.json({ climate, currentSol, ls: Math.round(solToLs(currentSol) * 10) / 10 }, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" }, // cache 1h
  })
}
