import { createClient } from '../lib/supabase-server'
import { redirect } from 'next/navigation'
import Header from '../components/Header'
import Nav from '../components/Nav'

export default async function TotalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: totals } = await supabase
    .from('edges')
    .select('*')
    .eq('bet_type', 'total')
    .gte('game_date', new Date().toISOString().slice(0, 10))
    .order('game_date', { ascending: true })
    .order('edge_pct', { ascending: false })

  const rows = totals || []

  const totalGames = rows.length
  const avgEdge = rows.length
    ? (rows.reduce((sum: number, r: any) => sum + Math.abs(r.fair_value - r.market_value), 0) / rows.length).toFixed(1)
    : '0'
  const strongSignals = rows.filter((r: any) => Math.abs(r.edge_pct) >= 3).length

  const edgeColor = (edge: number) => {
    const abs = Math.abs(edge)
    if (abs >= 3) return 'text-green-400'
    if (abs >= 1.5) return 'text-yellow-400'
    return 'text-zinc-500'
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono">
      <Header user={user} />
      <Nav active="/totals" />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-2xl font-bold mb-1">Over/Under Predictions</h1>
          <p className="text-zinc-500 text-sm">
            Model fair total vs market total. Green = model disagrees by 3+ points.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Games', value: totalGames.toString() },
            { label: 'Avg Edge', value: `${avgEdge} pts` },
            { label: 'Strong Signals', value: strongSignals.toString() },
          ].map(stat => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-green-400">{stat.value}</div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Upcoming Totals</h2>
          {rows.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-500 text-sm text-center">
              No over/under predictions available. Check back when new games are posted.
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map((r: any) => {
                const edge = r.fair_value - r.market_value
                const absEdge = Math.abs(edge)
                const direction = edge > 0 ? 'OVER' : 'UNDER'

                return (
                  <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                            {r.sport}
                          </span>
                          <span className="text-xs text-zinc-500">{r.game_date}</span>
                        </div>
                        <div className="text-sm text-zinc-300">
                          {r.away_team} @ {r.home_team}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right shrink-0">
                      <div>
                        <div className="text-zinc-500 text-[10px] uppercase tracking-widest">Fair</div>
                        <div className="text-sm font-bold text-white">{r.fair_value}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 text-[10px] uppercase tracking-widest">Market</div>
                        <div className="text-sm font-bold text-white">{r.market_value}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 text-[10px] uppercase tracking-widest">Edge</div>
                        <div className={`text-sm font-bold ${edgeColor(absEdge)}`}>
                          {absEdge.toFixed(1)}
                        </div>
                      </div>
                      <div className={`text-xs font-bold px-2 py-1 rounded ${
                        direction === 'OVER'
                          ? 'text-green-400 bg-green-400/10'
                          : 'text-red-400 bg-red-400/10'
                      }`}>
                        {direction}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
