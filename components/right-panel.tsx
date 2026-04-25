"use client"

import { useState } from "react"
import { ChatTab } from "./panel-tabs/chat-tab"
import { ReporteTab } from "./panel-tabs/reporte-tab"
import { CompararTab } from "./panel-tabs/comparar-tab"

const tabs = [
  { id: "chat", label: "Chat" },
  { id: "reporte", label: "Reporte" },
  { id: "comparar", label: "Comparar" },
]

export function RightPanel() {
  const [activeTab, setActiveTab] = useState("chat")

  const renderTab = () => {
    switch (activeTab) {
      case "chat":
        return <ChatTab />
      case "reporte":
        return <ReporteTab />
      case "comparar":
        return <CompararTab />
      default:
        return <ChatTab />
    }
  }

  return (
    <aside className="right-panel">
      <div className="panel-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`panel-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="panel-content">{renderTab()}</div>
    </aside>
  )
}
