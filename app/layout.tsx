import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LARS - Agente de Exploración',
  description: 'Dashboard de exploración marciana con datos de Curiosity y Perseverance',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
