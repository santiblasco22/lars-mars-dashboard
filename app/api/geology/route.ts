import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"

export async function POST(req: Request) {
  const { cameras, latestSol, climate } = await req.json()

  const last = climate?.[climate.length - 1] ?? {}

  try {
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      prompt: `Sos LARS, el sistema de análisis geológico de la misión Mars Exploration.

El rover Curiosity está actualmente en el Sol ${latestSol}, operando en el Cráter Gale (Marte).
Cámaras activas: ${cameras?.join(", ") ?? "NAVCAM, MAST, FHAZ, RHAZ"}
Temperatura hoy: máx ${last.max ?? -23}°C / mín ${last.min ?? -78}°C
Presión: ${last.pressure ?? 748} Pa

Generá exactamente 4 hallazgos geológicos realistas y científicamente plausibles para la misión actual.
Respondé SOLO con JSON válido, sin texto adicional, en este formato exacto:

{
  "findings": [
    {
      "name": "Nombre de la zona o formación",
      "coordinates": "-4.XXX°, 137.XXX°",
      "sol": ${latestSol},
      "description": "Descripción científica en español simple (2-3 oraciones)",
      "minerals": ["mineral1", "mineral2", "mineral3"],
      "badge": "texto del badge",
      "badgeType": "danger|warning|info|success"
    }
  ]
}

Los nombres deben ser reales o plausibles dentro del Cráter Gale (Formación Murray, Vera Rubin Ridge, etc).
Los minerales deben ser geológicamente realistas para Marte (óxidos de hierro, sulfatos, arcillas, etc).`,
    })

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error("No JSON found")
      const parsed = JSON.parse(jsonMatch[0])
      return Response.json(parsed)
    } catch {
      return Response.json({ findings: [] })
    }
  } catch {
    return Response.json({ findings: [] })
  }
}
