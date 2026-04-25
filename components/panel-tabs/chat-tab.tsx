"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, isTextUIPart } from "ai"
import { useEffect, useRef, useState, useMemo } from "react"
import { useLars } from "@/lib/mars-context"

const suggestions = [
  "Que encontro Curiosity hoy?",
  "Explicame el hallazgo geologico mas importante",
  "Cuando hubo agua en Marte?",
]

export function ChatTab() {
  const { photos, climate, currentSol } = useLars()
  const last = climate[climate.length - 1]
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const context = useMemo(() => ({
    photoCount: photos.length,
    cameras: [...new Set(photos.map((p) => p.camera))],
    currentSol,
    tempMax: last?.max,
    tempMin: last?.min,
    pressure: last?.pressure,
    wind: last?.wind,
  }), [photos.length, currentSol, last])

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { context } }),
    [context]
  )

  const { messages, status, sendMessage } = useChat({ transport })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function getMessageText(msg: any): string {
    if (!msg.parts) return ""
    return msg.parts.filter(isTextUIPart).map((p: any) => p.text).join("")
  }

  function handleSend() {
    if (!input.trim() || status !== "ready") return
    sendMessage({ text: input.trim() })
    setInput("")
  }

  function handleSuggestion(text: string) {
    sendMessage({ text })
  }

  const isLoading = status === "streaming" || status === "submitted"

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="message agent">
            Hola, soy LARS. Tengo acceso a los datos actuales de la mision: Sol {currentSol}, temperatura {last?.max ?? -23}C/{last?.min ?? -78}C. En que te puedo ayudar?
          </div>
        )}
        {messages.map((message) => {
          const text = getMessageText(message)
          if (!text) return null
          return (
            <div key={message.id} className={`message ${message.role === "user" ? "user" : "agent"}`}>
              {text}
            </div>
          )
        })}
        {isLoading && (
          <div className="message agent loading-text">LARS esta escribiendo...</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-suggestions">
        {suggestions.map((s) => (
          <button key={s} className="suggestion-chip" onClick={() => handleSuggestion(s)} disabled={isLoading}>
            {s}
          </button>
        ))}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend() }}
          disabled={isLoading}
        />
        <button className="send-button" onClick={handleSend} disabled={isLoading}>
          Enviar
        </button>
      </div>
    </div>
  )
}
