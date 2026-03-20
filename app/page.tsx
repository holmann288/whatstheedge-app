import { createClient } from './lib/supabase-server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: { user } } = await supabase.auth.getUser()

  const [edgesRes, clvRes, briefingRes, clvBriefingRes, modelBriefingRes] = await Promise.all([
    supabase.from('edges').select('*').gte('edge_pct', 5.5).eq('game_date', today).in('bet_type', ['spread', 'total']).order('edge_pct', { ascending: false }),
    supabase.from('scan_results').select('clv').not('clv', 'is', null),
    supabase.from('briefings').select('content, created_at').eq('id', `morning_${today}`).single(),
    supabase.from('briefings').select('content, created_at').eq('id', `clv_${today}`).single(),
    supabase.from('briefings').select('content, created_at').eq('id', `model_${today}`).single(),
    supabase.from('briefings').select('content, created_at').eq('id', `model_${today}`).single()
  ])

  const signals = edgesRes.data || []
  const clvData = clvRes.data || []
  const briefing = briefingRes.data?.content || null
  const clvBriefing = clvBriefingRes.data?.content || null
  const modelBriefing = modelBriefingRes.data?.content || null

  const avgClv = clvData.length > 0
    ? (clvData.reduce((sum: number, r: any) => sum + r.clv, 0) / clvData.length * 100).toFixed(2)
    : '0.00'
  const pctPos = clvData.length > 0
    ? ((clvData.filter((r: any) => r.clv > 0).length / clvData.length) * 100).toFixed(1)
    : '0.0'

  const formatEdge = (s: any) => `${Math.abs(s.fair_value - s.market_value).toFixed(1)} pts`
  const formatSignal = (s: any) => {
    if (s.bet_type === 'spread') return `Spread ${s.fair_value > 0 ? '+' : ''}${s.fair_value}`
    if (s.bet_type === 'total') return `Total ${s.direction === 'over' ? 'Over' : 'Under'} ${s.fair_value}`
    return s.bet_type
  }

  const visibleSignals = user ? signals : signals.slice(0, 1)
  const lockedCount = signals.length - visibleSignals.length

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-green-400 font-bold text-xl tracking-tight">whats</span>
          <span className="text-white font-bold text-xl tracking-tight">theedge</span>
          <span className="ml-3 text-zinc-500 text-xs uppercase tracking-widest">Beta</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"></span>
            Live
          </span>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-zinc-500 truncate max-w-32 hidden sm:block">{user.email}</span>
              <form action={async () => { 'use server'; const { createClient } = await import('./lib/supabase-server'); const sb = await createClient(); await sb.auth.signOut(); }}>
                <button type="submit" className="text-zinc-500 text-xs hover:text-white transition">Sign Out</button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="bg-green-400 text-black px-3 py-1 rounded font-bold hover:bg-green-300 transition">
              Sign In
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Avg CLV", value: `+${avgClv}%` },
            { label: "CLV Positive", value: `${pctPos}%` },
            { label: "Active Signals", value: signals.length.toString() },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-green-400">{stat.value}</div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Today's BET Signals</h2>
          {signals.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-500 text-sm text-center">
              No signals yet today. Check back after the morning run.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleSignals.map((s: any) => (
                <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{s.sport}</span>
                      <span className="text-sm text-zinc-300">{s.away_team} @ {s.home_team}</span>
                    </div>
                    <div className="text-white font-bold text-lg">{formatSignal(s)}</div>
                    <div className="text-xs text-zinc-500">Market: {s.market_value}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-green-400 font-bold text-lg">{formatEdge(s)}</div>
                    <div className="text-xs text-zinc-500">vs market</div>
                  </div>
                </div>
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

        {user && (
          <>
            <div>
              <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Morning Briefing</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-sm text-zinc-300 leading-relaxed">
                {briefing ? <p className="whitespace-pre-wrap">{briefing}</p> : <p className="text-zinc-500">No briefing yet today. Check back after 8:00 AM.</p>}
              </div>
            </div>

            {clvBriefing && (
              <div>
                <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">CLV Analysis</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-sm text-zinc-300 leading-relaxed">
                  <p className="whitespace-pre-wrap">{clvBriefing}</p>
                </div>
              </div>
            )}

            {modelBriefing && (
              <div>
                <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Model Investigation</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-sm text-zinc-300 leading-relaxed">
                  <p className="whitespace-pre-wrap">{modelBriefing}</p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="border border-dashed border-zinc-800 rounded-lg p-6 text-center text-zinc-600 text-sm">
          MLB signals launching March 26 · NFL & NCAAF coming this fall · Mobile app coming soon
        </div>
      </main>
    </div>
  )
}
