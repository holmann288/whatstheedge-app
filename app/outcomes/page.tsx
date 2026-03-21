import { createClient } from '../lib/supabase-server'
import { redirect } from 'next/navigation'
import Header from '../components/Header'
import Nav from '../components/Nav'

export default async function OutcomesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rows } = await supabase
    .from('edges')
    .select('*')
    .not('outcome', 'is', null)
    .order('game_date', { ascending: false })
    .limit(100)

  const resolved = rows || []
  const spreads = resolved.filter((r: any) => r.bet_type === 'spread')
  const totals = resolved.filter((r: any) => r.bet_type === 'total')

  const hitRate = (data: any[]) => {
    if (!data.length) return null
    return (data.filter(r => r.outcome === 'hit').length / data.length * 100).toFixed(1)
  }

  // MAE for spreads: fair_value is away-home, actual_margin = actual_home_score - actual_away_score
  // Error = |fair_value + actual_margin| (add because opposite sign conventions)
  const computeMAE = (data: any[]) => {
    const valid = data.filter(r =>
      r.bet_type === 'spread' &&
      r.fair_value != null &&
      r.actual_home_score != null &&
      r.actual_away_score != null
    )
    if (!valid.length) return null
    const totalError = valid.reduce((sum: number, r: any) => {
      const actualMargin = r.actual_home_score - r.actual_away_score
      return sum + Math.abs(r.fair_value + actualMargin)
    }, 0)
    return (totalError / valid.length).toFixed(2)
  }

  const overallMAE = computeMAE(resolved)

  // Sport breakdown
  const nbaRows = resolved.filter((r: any) => r.sport === 'NBA')
  const ncaabRows = resolved.filter((r: any) => r.sport === 'NCAAB')
  const nbaSpreads = nbaRows.filter((r: any) => r.bet_type === 'spread')
  const ncaabSpreads = ncaabRows.filter((r: any) => r.bet_type === 'spread')

  const formatSignal = (r: any) => {
    if (r.bet_type === 'spread') return `Spread ${r.fair_value > 0 ? '+' : ''}${r.fair_value}`
    return `Total ${r.fair_value > r.market_value ? 'Over' : 'Under'} ${r.fair_value}`
  }

  const outcomeColor = (outcome: string) => {
    if (outcome === 'hit') return 'text-green-400'
    if (outcome === 'miss') return 'text-red-400'
    return 'text-zinc-500'
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono">
      <Header user={user} />
      <Nav active="/outcomes" />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total Resolved', value: resolved.length.toString() },
            { label: 'Overall Hit Rate', value: hitRate(resolved) ? `${hitRate(resolved)}%` : '—' },
            { label: 'Spread Hit Rate', value: hitRate(spreads) ? `${hitRate(spreads)}%` : '—' },
            { label: 'Total Hit Rate', value: hitRate(totals) ? `${hitRate(totals)}%` : '—' },
            { label: 'Spread MAE', value: overallMAE ? overallMAE : '—' },
          ].map(stat => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-green-400">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Sport Breakdown */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Sport Breakdown</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { sport: 'NBA', rows: nbaRows, spreads: nbaSpreads },
              { sport: 'NCAAB', rows: ncaabRows, spreads: ncaabSpreads },
            ].map(group => (
              <div key={group.sport} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
                <h3 className="text-sm font-bold text-white mb-3">{group.sport}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Resolved</span>
                    <span className="text-white">{group.rows.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Hit Rate</span>
                    <span className="text-green-400">{hitRate(group.rows) ? `${hitRate(group.rows)}%` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Spread Hit Rate</span>
                    <span className="text-green-400">{hitRate(group.spreads) ? `${hitRate(group.spreads)}%` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Spread MAE</span>
                    <span className="text-green-400">{computeMAE(group.rows) || '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Resolved Predictions</h2>
          {resolved.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-500 text-sm text-center">
              No resolved predictions yet. Check back after tonight's games.
            </div>
          ) : (
            <div className="space-y-2">
              {resolved.map((r: any) => (
                <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-5 py-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{r.sport}</span>
                      <span className="text-xs text-zinc-400">{r.game_date}</span>
                      <span className="text-sm text-zinc-300">{r.away_team} @ {r.home_team}</span>
                    </div>
                    <div className="text-white text-sm font-bold">{formatSignal(r)}</div>
                    <div className="text-xs text-zinc-500">
                      Market: {r.market_value} · Edge: {Math.abs(r.fair_value - r.market_value).toFixed(1)} pts
                      {r.actual_home_score != null && ` · Final: ${r.away_score ?? r.actual_away_score} - ${r.actual_home_score}`}
                    </div>
                  </div>
                  <div className={`font-bold text-sm uppercase ${outcomeColor(r.outcome)}`}>
                    {r.outcome === 'hit' ? '✓ HIT' : r.outcome === 'miss' ? '✗ MISS' : '— PUSH'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
