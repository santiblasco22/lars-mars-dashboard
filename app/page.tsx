"use client"

import { useState } from "react"
import { LarsProvider } from "@/lib/mars-context"
import { Topbar } from "@/components/topbar"
import { Sidebar } from "@/components/sidebar"
import { RightPanel } from "@/components/right-panel"
import { VistaGeneral } from "@/components/views/vista-general"
import { Superficie } from "@/components/views/superficie"
import { Clima } from "@/components/views/clima"
import { Geologia } from "@/components/views/geologia"

export default function MarsExplorer() {
  const [activeView, setActiveView] = useState("vista-general")

  const renderView = () => {
    switch (activeView) {
      case "vista-general":
        return <VistaGeneral />
      case "superficie":
        return <Superficie />
      case "clima":
        return <Clima />
      case "geologia":
        return <Geologia />
      default:
        return <VistaGeneral />
    }
  }

  return (
    <LarsProvider>
      <div className="app-container">
        <Topbar />
        <div className="main-layout">
          <Sidebar activeView={activeView} onViewChange={setActiveView} />
          <div className="content-area">
            <main className="main-content">
              <div className="view" key={activeView}>
                {renderView()}
              </div>
            </main>
            <RightPanel />
          </div>
        </div>
      </div>
    </LarsProvider>
  )
}
