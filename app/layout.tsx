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
          <footer className="border-t border-zinc-800 mt-16 py-6 px-6 text-center">
            <p className="text-zinc-600 text-xs leading-relaxed">
              If you or someone you know has a gambling problem, call or text the National Problem Gambling Helpline: <span className="text-zinc-500">1-800-522-4700</span> (available 24/7). 
              What's the Edge provides analytical information only and does not facilitate or encourage gambling. Must be 21+ and in a jurisdiction where sports betting is legal.
            </p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
