import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import AuthProvider from './components/AuthProvider'

const geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "What's the Edge",
  description: 'Sports analytics and betting signals',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geistMono.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
