import { createClient } from './lib/supabase-server'
import { getDeduplicatedCLV } from './lib/clv'
import Link from 'next/link'
import Header from './components/Header'
import Nav from './components/Nav'
import SignalCard from './components/SignalCard'

export default async function Home() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data: { user } } = await supabase.auth.getUser()

  const [edgesRes, clvStats] = await Promise.all([
    supabase.from('edges').select('*').gte('edge_pct', 5.5).eq('game_date', today).in('bet_type', ['spread', 'total']).order('edge_pct', { ascending: false }),
    getDeduplicatedCLV(),
  ])

  const signals = edgesRes.data || []
  const { avgClv, avgClvPositive, pctPos, n } = clvStats

  const visibleSignals = user ? signals : signals.slice(0, 1)
  const lockedCount = signals.length - visibleSignals.length

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono">
      <Header user={user} />
      {user && <Nav active="/" />}

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">NBA Avg CLV</div>
            <div className={`text-2xl font-bold ${avgClvPositive ? "text-green-400" : "text-red-400"}`}>{avgClvPositive ? "+" : "-"}{avgClv}%</div>
            <div className="text-zinc-600 text-xs mt-1">{n} unique bets</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">CLV Positive</div>
            <div className="text-2xl font-bold text-green-400">{pctPos}%</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Active Signals</div>
            <div className="text-2xl font-bold text-green-400">{signals.length}</div>
          </div>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Today's Signals</h2>
          {signals.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-500 text-sm text-center">
              No signals yet today. Check back after the morning run.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleSignals.map((s: any) => (
                <SignalCard key={s.id} s={s} />
              ))}
              {!user && lockedCount > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center space-y-4">
                  <div className="text-zinc-400 text-sm">{lockedCount} more signal{lockedCount > 1 ? 's' : ''} today</div>
                  <div className="text-zinc-600 text-xs">Sign in to unlock all signals, CLV analysis, and morning briefings</div>
                  <Link href="/login" className="inline-block bg-green-400 text-black px-6 py-2 rounded font-bold text-sm hover:bg-green-300 transition">
                    Sign In to Unlock
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border border-dashed border-zinc-800 rounded-lg p-6 text-center text-zinc-600 text-sm">
          MLB signals launching March 26 · NFL & NCAAF coming this fall · Mobile app coming soon
        </div>
      </main>
    </div>
  )
}
