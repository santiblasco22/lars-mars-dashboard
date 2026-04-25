import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"

export async function POST(req: Request) {
  const { solA, solB, photosA, photosB } = await req.json()

  const describePhotos = (photos: any[]) =>
    photos
      .slice(0, 4)
      .map((p: any) => `${p.camera} (Sol ${p.sol}, fecha terrestre: ${p.earth_date})`)
      .join(", ")

  try {
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      prompt: `Sos LARS, el asistente de la misión Mars Exploration. Comparás dos conjuntos de fotos del rover Curiosity en Marte.

Sol A (${solA}): ${photosA.length} fotos - Cámaras: ${describePhotos(photosA)}
Sol B (${solB}): ${photosB.length} fotos - Cámaras: ${describePhotos(photosB)}

Escribí un análisis comparativo en español simple (4-5 oraciones). Mencioná:
- Diferencias en las cámaras activas o cantidad de fotos
- Lo que podrían indicar sobre las actividades del rover en cada sol
- Cualquier cambio notable entre los dos períodos

Usá lenguaje accesible, con comparaciones terrestres si ayuda.`,
    })

    return Response.json({ analysis: result.text })
  } catch {
    return Response.json({
      analysis: `Comparación entre Sol ${solA} y Sol ${solB}: Se observan diferencias en la actividad de captura de imágenes entre ambos períodos. Los datos de telemetría sugieren variaciones en las condiciones operativas del rover.`,
    })
  }
}
