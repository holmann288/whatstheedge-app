import { createClient } from '../lib/supabase-server'
import { redirect } from 'next/navigation'
import Header from '../components/Header'
import Nav from '../components/Nav'
import { getDeduplicatedCLV } from '../lib/clv'

export default async function CLVPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rows } = await supabase
    .from('scan_results')
    .select('clv, sport, game, team, market_name, side, recommendation, outcome, timestamp, edge')
    .not('clv', 'is', null)
    .gte('timestamp', '2026-03-17')
    .order('timestamp', { ascending: true })

  const all = rows || []

  // Deduplicate
  const seen = new Map()
  for (const r of all) {
    const key = `${r.game || r.market_name}_${r.side || r.team}`
    if (!seen.has(key)) seen.set(key, r)
  }
  const unique = Array.from(seen.values())

  const metrics = (data: any[]) => {
    if (!data.length) return null
    const clvs = data.map((r: any) => r.clv)
    const avg = clvs.reduce((s: number, c: number) => s + c, 0) / clvs.length * 100
    const pos = clvs.filter((c: number) => c > 0).length / clvs.length * 100
    const sorted = [...clvs].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)] * 100
    return { n: data.length, avg: avg.toFixed(2), pos: pos.toFixed(1), median: median.toFixed(2) }
  }

  const overall = metrics(unique)
  const nba = metrics(unique.filter((r: any) => r.sport === 'NBA'))
  const ncaab = metrics(unique.filter((r: any) => r.sport === 'NCAAB'))

  const buckets = [
    { label: '<2%', data: unique.filter((r: any) => r.clv * 100 < 2) },
    { label: '2-5%', data: unique.filter((r: any) => r.clv * 100 >= 2 && r.clv * 100 < 5) },
    { label: '5-10%', data: unique.filter((r: any) => r.clv * 100 >= 5 && r.clv * 100 < 10) },
    { label: '10%+', data: unique.filter((r: any) => r.clv * 100 >= 10) },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono">
      <Header user={user} />
      <Nav active="/clv" />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Overall CLV (Deduplicated)</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Unique Bets', value: overall?.n.toString() ?? '0' },
              { label: 'Avg CLV', value: overall ? `+${overall.avg}%` : '—' },
              { label: 'Median CLV', value: overall ? `${overall.median}%` : '—' },
              { label: 'Pct Positive', value: overall ? `${overall.pos}%` : '—' },
            ].map(s => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{s.label}</div>
                <div className="text-xl font-bold text-green-400">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">By Sport</h2>
          <div className="grid grid-cols-2 gap-4">
            {[{ label: 'NBA', m: nba }, { label: 'NCAAB', m: ncaab }].map(({ label, m }) => (
              <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2">
                <div className="text-zinc-400 text-sm font-bold">{label}</div>
                {m ? (
                  <>
                    <div className="text-xs text-zinc-500">n={m.n} · avg={m.avg}% · median={m.median}% · pos={m.pos}%</div>
                  </>
                ) : <div className="text-zinc-600 text-xs">No data</div>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">NBA Edge Buckets</h2>
          <div className="grid grid-cols-4 gap-4">
            {buckets.map(({ label, data }) => {
              const m = metrics(data.filter((r: any) => r.sport === 'NBA'))
              return (
                <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{label}</div>
                  {m ? (
                    <>
                      <div className="text-xl font-bold text-green-400">{m.avg}%</div>
                      <div className="text-zinc-600 text-xs mt-1">n={m.n} · {m.pos}% pos</div>
                    </>
                  ) : <div className="text-zinc-600 text-xs">No data</div>}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
