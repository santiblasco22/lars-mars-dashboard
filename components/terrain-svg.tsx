interface TerrainSvgProps {
  variant?: number
}

export function TerrainSvg({ variant = 1 }: TerrainSvgProps) {
  const paths = [
    "M0 40 L10 35 L25 42 L40 30 L55 38 L70 28 L85 35 L100 32",
    "M0 38 L15 32 L30 40 L45 25 L60 35 L75 30 L90 38 L100 30",
    "M0 35 L12 40 L28 30 L42 38 L58 28 L72 35 L88 32 L100 38",
    "M0 42 L18 35 L32 42 L48 30 L62 40 L78 32 L92 38 L100 35",
  ]

  const path = paths[(variant - 1) % paths.length]

  return (
    <svg viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d={path} />
      <circle cx="20" cy="20" r="3" />
      <circle cx="70" cy="15" r="2" />
    </svg>
  )
}
