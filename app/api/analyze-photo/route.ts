import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"

export async function POST(req: Request) {
  const { imgSrc, camera, cameraFullName, sol, earthDate } = await req.json()

  if (!imgSrc) {
    return Response.json({
      analysis: `Imagen de la cámara ${cameraFullName} (${camera}) del Sol ${sol}. Esta cámara documenta el terreno marciano para análisis científico y navegación del rover.`,
      interest: "medio",
    })
  }

  try {
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: new URL(imgSrc),
            },
            {
              type: "text",
              text: `Analizá esta foto tomada por el rover Curiosity en Marte.
Cámara: ${cameraFullName} (${camera})
Sol: ${sol}
Fecha terrestre: ${earthDate}

Describí en español simple (2-3 oraciones) qué se ve: terreno, rocas, formaciones.
Indicá el nivel de interés geológico: alto, medio o bajo, y por qué.

Respondé SOLO con JSON válido:
{
  "analysis": "descripción de 2-3 oraciones",
  "interest": "alto|medio|bajo",
  "interestReason": "explicación breve del nivel"
}`,
            },
          ],
        },
      ],
    })

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return Response.json({
          analysis: `${parsed.analysis} Interés geológico ${parsed.interest}: ${parsed.interestReason}`,
          interest: (parsed.interest ?? "medio").toLowerCase(),
        })
      }
    } catch {}

    return Response.json({ analysis: result.text, interest: "medio" })
  } catch {
    return Response.json({
      analysis: `Imagen de la cámara ${cameraFullName} del Sol ${sol}. Esta cámara captura el terreno marciano para navegación y análisis científico.`,
      interest: "medio",
    })
  }
}
