import type { Metadata } from 'next'
import './globals.css'
import TokyoChatbot from '@/components/TokyoChatbot'

export const metadata: Metadata = {
  title: 'your name — writing',
  description: 'essays, notes, and things worth sharing.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <TokyoChatbot />
      </body>
    </html>
  )
}
