import { createClient } from './lib/supabase-server'
import { getDeduplicatedCLV } from './lib/clv'
import Link from 'next/link'
import Header from './components/Header'
import Nav from './components/Nav'

export default async function Home() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data: { user } } = await supabase.auth.getUser()

  const [edgesRes, clvStats, briefingRes, clvBriefingRes, modelBriefingRes] = await Promise.all([
    supabase.from('edges').select('*').gte('edge_pct', 5.5).eq('game_date', today).in('bet_type', ['spread', 'total']).order('edge_pct', { ascending: false }),
    getDeduplicatedCLV(),
    supabase.from('briefings').select('content, created_at').eq('id', `morning_${today}`).single(),
    supabase.from('briefings').select('content, created_at').eq('id', `clv_${today}`).single(),
    supabase.from('briefings').select('content, created_at').eq('id', `model_${today}`).single()
  ])

  const signals = edgesRes.data || []
  const briefing = briefingRes.data?.content || null
  const clvBriefing = clvBriefingRes.data?.content || null
  const modelBriefing = modelBriefingRes.data?.content || null
  const { avgClv, pctPos, n } = clvStats

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
      <Header user={user} />
      {user && <Nav active="/" />}

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Avg CLV</div>
            <div className="text-2xl font-bold text-green-400">+{avgClv}%</div>
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
            {briefing && (
              <div>
                <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Morning Briefing</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-sm text-zinc-300 leading-relaxed">
                  <p className="whitespace-pre-wrap">{briefing}</p>
                </div>
              </div>
            )}
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
