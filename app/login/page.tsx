'use client'
import { useState } from 'react'
import { signIn, signUp } from '../actions/auth'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError('')
    const result = isSignUp ? await signUp(formData) : await signIn(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <span className="text-green-400 font-bold text-2xl tracking-tight">whats</span>
          <span className="text-white font-bold text-2xl tracking-tight">theedge</span>
        </div>

        <div className="space-y-4">
          <button type="button" onClick={handleGoogle}
            className="w-full bg-white text-black rounded-lg py-3 text-sm font-medium hover:bg-zinc-100 transition">
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-800"/>
            <span className="text-zinc-600 text-xs">or</span>
            <div className="flex-1 h-px bg-zinc-800"/>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <input name="email" type="email" placeholder="Email" required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-400"/>
            <input name="password" type="password" placeholder="Password" required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-400"/>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-green-400 text-black rounded-lg py-3 text-sm font-bold hover:bg-green-300 transition disabled:opacity-50">
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="text-zinc-500 text-xs text-center">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-green-400 hover:underline">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
