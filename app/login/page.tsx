'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setMagicSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <span className="text-green-400 font-bold text-2xl tracking-tight">whats</span>
          <span className="text-white font-bold text-2xl tracking-tight">theedge</span>
        </div>

        <p className="text-zinc-400 text-sm">Sign in to access signals, model predictions, and CLV analysis.</p>

        <div className="space-y-4">
          {/* Google OAuth — primary */}
          <button type="button" onClick={handleGoogle}
            className="w-full bg-white text-black rounded-lg py-3 text-sm font-medium hover:bg-zinc-100 transition flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-800"/>
            <span className="text-zinc-600 text-xs">or</span>
            <div className="flex-1 h-px bg-zinc-800"/>
          </div>

          {/* Magic link — fallback */}
          {magicSent ? (
            <div className="bg-zinc-900 border border-green-400/30 rounded-lg p-4 text-center space-y-2">
              <p className="text-green-400 text-sm font-bold">Check your email</p>
              <p className="text-zinc-400 text-xs">We sent a sign-in link to <span className="text-white">{email}</span></p>
              <button type="button" onClick={() => setMagicSent(false)} className="text-zinc-500 text-xs hover:text-white transition mt-2">
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-400"/>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-zinc-800 text-white rounded-lg py-3 text-sm font-medium hover:bg-zinc-700 transition disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>
          )}

          <p className="text-zinc-600 text-xs text-center pt-2">
            No password needed — we&apos;ll email you a sign-in link.
          </p>
        </div>
      </div>
    </div>
  )
}
