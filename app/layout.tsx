import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Photo & Video Consent Form - Caroline Small School of Dance',
  description: 'Child photography and video consent form',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
