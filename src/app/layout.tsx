import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "CynoGuard Console",
  description: "Cybersecurity platform for monitoring and protecting digital assets.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}