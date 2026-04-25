import { anthropic } from "@ai-sdk/anthropic"
import { streamText, convertToModelMessages } from "ai"

export async function POST(req: Request) {
  const body = await req.json()
  const { messages = [], context } = body

  const ctx = context ?? {}
  const systemPrompt = `Eres LARS, el asistente de inteligencia artificial de la misión Mars Exploration.
Respondés en español simple y claro, como si hablaras con cualquier persona, no solo científicos.
Usás comparaciones con la Tierra para hacer los datos de Marte más comprensibles.
Sos conciso: respondés en 2-4 oraciones salvo que te pidan más detalle.

Datos actuales de la sesión:
- Fotos cargadas: ${ctx.photoCount ?? "N/A"} fotos del rover Curiosity
- Cámaras activas: ${ctx.cameras?.join(", ") ?? "NAVCAM, MAST, FHAZ, RHAZ"}
- Sol actual: ${ctx.currentSol ?? 4500} (un "sol" es un día marciano, dura 24h 37min)
- Temperatura hoy: máx ${ctx.tempMax ?? -23}°C / mín ${ctx.tempMin ?? -78}°C
- Presión atmosférica: ${ctx.pressure ?? 748} Pa
- Viento: ${ctx.wind ?? 18} m/s

Cuando alguien pregunta por fotos, clima, geología u operaciones de los rovers, usá estos datos.`

  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse()
}
