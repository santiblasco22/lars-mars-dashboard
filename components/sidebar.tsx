interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

const navItems = [
  {
    id: "vista-general",
    label: "Vista general",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "superficie",
    label: "Superficie",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 15l4-4 4 4 6-6 4 4" />
      </svg>
    ),
  },
  {
    id: "clima",
    label: "Clima",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    id: "geologia",
    label: "Geología",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 19h20L12 2z" />
        <path d="M12 2v17" />
        <path d="M7 12h10" />
      </svg>
    ),
  },
]

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <nav className="nav-items">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? "active" : ""}`}
            onClick={() => onViewChange(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-bottom-title">Estado de rovers</div>
        <div className="rover-status">
          <div className="rover-item">
            <span className="status-dot" />
            <span>Curiosity</span>
            <span className="rover-status-text">activo</span>
          </div>
          <div className="rover-item">
            <span className="status-dot" />
            <span>Perseverance</span>
            <span className="rover-status-text">activo</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
