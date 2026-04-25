import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"

export async function POST(req: Request) {
  const { currentSol, photoCount, cameras, climate, geology } = await req.json()

  const last = climate?.[climate.length - 1] ?? {}
  const topGeology = (geology ?? []).slice(0, 3).map((g: any) => g.name).join(", ")

  try {
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      prompt: `Sos LARS, el sistema de inteligencia artificial de la misión Mars Exploration. Generá un reporte diario en español para el Sol ${currentSol} del rover Curiosity.

Datos disponibles:
- Fotos capturadas hoy: ${photoCount ?? 0}
- Cámaras activas: ${cameras?.join(", ") ?? "NAVCAM, MAST, FHAZ, RHAZ"}
- Temperatura: máx ${last.max ?? -23}°C / mín ${last.min ?? -78}°C
- Presión: ${last.pressure ?? 748} Pa
- Viento: ${last.wind ?? 18} m/s
- Zonas geológicas destacadas: ${topGeology || "en análisis"}

Generá un reporte con estas 4 secciones exactas (sin markdown, texto plano):

RESUMEN DEL DÍA
[2-3 oraciones resumiendo las actividades del sol]

HALLAZGOS DESTACADOS
- [hallazgo 1]
- [hallazgo 2]
- [hallazgo 3]
- [hallazgo 4]

ESTADO DE LOS ROVERS
[2 oraciones sobre Curiosity y Perseverance]

RECOMENDACIONES
[2-3 oraciones con próximos pasos sugeridos]`,
    })

    const text = result.text
    const sections = parseReport(text)
    return Response.json({ sections })
  } catch {
    return Response.json({ sections: null })
  }
}

function parseReport(text: string) {
  const sections: Record<string, string> = {}
  const lines = text.split("\n")
  let current = ""
  let buffer: string[] = []

  const headings = ["RESUMEN DEL DÍA", "HALLAZGOS DESTACADOS", "ESTADO DE LOS ROVERS", "RECOMENDACIONES"]

  for (const line of lines) {
    const heading = headings.find((h) => line.trim().toUpperCase().includes(h))
    if (heading) {
      if (current) sections[current] = buffer.join("\n").trim()
      current = heading
      buffer = []
    } else if (current) {
      buffer.push(line)
    }
  }
  if (current) sections[current] = buffer.join("\n").trim()
  return sections
}
