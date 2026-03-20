import { createClient } from '../lib/supabase-server'
import { redirect } from 'next/navigation'
import Header from '../components/Header'
import Nav from '../components/Nav'

export default async function LinesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: rows } = await supabase
    .from('edges')
    .select('*')
    .gte('game_date', today)
    .order('edge_pct', { ascending: false })

  const all = rows || []
  const spreads = all.filter((r: any) => r.bet_type === 'spread')
  const totals = all.filter((r: any) => r.bet_type === 'total')

  const SportFilter = ({ label, count }: { label: string, count: number }) => (
    <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{label} ({count})</span>
  )

  const EdgeRow = ({ r }: { r: any }) => {
    const diff = Math.abs(r.fair_value - r.market_value)
    const isSpread = r.bet_type === 'spread'
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-5 py-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{r.sport}</span>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{r.bet_type}</span>
            <span className="text-sm text-zinc-300">{r.away_team} @ {r.home_team}</span>
          </div>
          <div className="text-white font-bold">
            {isSpread
              ? `Fair Spread: ${r.fair_value > 0 ? '+' : ''}${r.fair_value}`
              : `Fair Total: ${r.fair_value}`}
          </div>
          <div className="text-xs text-zinc-500">Market: {r.market_value} · {r.game_date}</div>
        </div>
        <div className="text-right space-y-1">
          <div className={`font-bold text-lg ${diff >= 5.5 ? 'text-green-400' : diff >= 3 ? 'text-yellow-400' : 'text-zinc-400'}`}>
            {diff.toFixed(1)} pts
          </div>
          <div className="text-xs text-zinc-500">vs market</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono">
      <Header user={user} />
      <Nav active="/lines" />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Total Lines</div>
            <div className="text-2xl font-bold text-green-400">{all.length}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Spreads</div>
            <div className="text-2xl font-bold text-green-400">{spreads.length}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Totals</div>
            <div className="text-2xl font-bold text-green-400">{totals.length}</div>
          </div>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Spreads</h2>
          {spreads.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-500 text-sm text-center">No spread data today.</div>
          ) : (
            <div className="space-y-2">
              {spreads.map((r: any) => <EdgeRow key={r.id} r={r} />)}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Totals</h2>
          {totals.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-500 text-sm text-center">No totals data today.</div>
          ) : (
            <div className="space-y-2">
              {totals.map((r: any) => <EdgeRow key={r.id} r={r} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
