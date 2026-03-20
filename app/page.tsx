import { supabase } from './lib/supabase'

export default async function Home() {
  const today = new Date().toISOString().split('T')[0]

  const { data: edges } = await supabase
    .from('edges')
    .select('*')
    .gte('edge_pct', 5.5)
    .eq('game_date', today)
    .in('bet_type', ['spread', 'total'])
    .order('edge_pct', { ascending: false })

  const signals = edges || []

  const formatEdge = (s: any) => {
    if (s.bet_type === 'spread') {
      const diff = Math.abs(s.fair_value - s.market_value)
      return `${diff.toFixed(1)} pts`
    }
    if (s.bet_type === 'total') {
      const diff = Math.abs(s.fair_value - s.market_value)
      return `${diff.toFixed(1)} pts`
    }
    return `${s.edge_pct}%`
  }

  const formatSignal = (s: any) => {
    if (s.bet_type === 'spread') {
      const val = s.fair_value
      return `Spread ${val > 0 ? '+' : ''}${val}`
    }
    if (s.bet_type === 'total') {
      return `Total ${s.direction === 'over' ? 'Over' : 'Under'} ${s.fair_value}`
    }
    return s.bet_type
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-green-400 font-bold text-xl tracking-tight">whats</span>
          <span className="text-white font-bold text-xl tracking-tight">theedge</span>
          <span className="ml-3 text-zinc-500 text-xs uppercase tracking-widest">Beta</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"></span>
            Live
          </span>
          <span>{today}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Avg CLV", value: "+1.68%", positive: true },
            { label: "CLV Positive", value: "65%", positive: true },
            { label: "Active Signals", value: signals.length.toString(), positive: true },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.positive ? "text-green-400" : "text-red-400"}`}>
                {stat.value}
              </div>
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
              {signals.map((s: any) => (
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
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Morning Briefing</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-3 text-sm text-zinc-300 leading-relaxed">
            <p>Model MAE holding at 10.65 — within healthy range. CLV tracker showing positive results across 65% of resolved bets.</p>
            <p className="text-zinc-500 text-xs">Generated 8:00 AM · Next update in 4h</p>
          </div>
        </div>

        <div className="border border-dashed border-zinc-800 rounded-lg p-6 text-center text-zinc-600 text-sm">
          MLB signals launching March 26 · NFL & NCAAF coming this fall · Mobile app coming soon
        </div>
      </main>
    </div>
  )
}
