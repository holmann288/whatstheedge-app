import { createClient } from '@/app/lib/supabase-server'
import { redirect } from 'next/navigation'
import Header from '../components/Header'
import Nav from '../components/Nav'

const ADMIN_EMAILS = ['holmann288@gmail.com']

interface ModelRow {
  data_version: string
  game_date: string
  fair_value_spread: number
  actual_margin: number
  extra_features: { sport?: string } | null
}

interface EdgeRow {
  sport: string
  bet_type: string
  outcome: string
  clv: number | null
  game_date: string
}

function computeMetrics(rows: ModelRow[]) {
  if (!rows.length) return { sample: 0, mae: 0, directionPct: 0, avgBias: 0 }

  const errors = rows.map(r => Math.abs(r.fair_value_spread + r.actual_margin))
  const mae = errors.reduce((a, b) => a + b, 0) / errors.length

  const correctDir = rows.filter(r =>
    (r.fair_value_spread < 0 && r.actual_margin > 0) ||
    (r.fair_value_spread > 0 && r.actual_margin < 0)
  ).length
  const directionPct = (correctDir / rows.length) * 100

  const biases = rows.map(r => r.fair_value_spread + r.actual_margin)
  const avgBias = biases.reduce((a, b) => a + b, 0) / biases.length

  return { sample: rows.length, mae, directionPct, avgBias }
}

function getSport(row: ModelRow): string {
  return row.extra_features?.sport || 'NBA'
}

export default async function V1V2Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (!ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-mono flex items-center justify-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-zinc-500 text-sm">This page is restricted to admin users.</p>
        </div>
      </div>
    )
  }

  const { data: modelRows } = await supabase
    .from('model_features')
    .select('data_version, game_date, fair_value_spread, actual_margin, extra_features')

  const { data: edgeRows } = await supabase
    .from('edges')
    .select('sport, bet_type, outcome, clv, game_date')
    .not('outcome', 'is', null)

  const allModels = (modelRows || []) as ModelRow[]
  const allEdges = (edgeRows || []) as EdgeRow[]

  const v1All = allModels.filter(r => r.data_version === 'v1_legacy')
  const v2All = allModels.filter(r => r.data_version === 'v2_clean')
  const v1Resolved = v1All.filter(r => r.actual_margin != null)
  const v2Resolved = v2All.filter(r => r.actual_margin != null)

  const v1Metrics = computeMetrics(v1Resolved)
  const v2Metrics = computeMetrics(v2Resolved)

  // Sport breakdowns
  const v1NBA = v1Resolved.filter(r => getSport(r) === 'NBA')
  const v1NCAAB = v1Resolved.filter(r => getSport(r) === 'NCAAB')
  const v2NBA = v2Resolved.filter(r => getSport(r) === 'NBA')
  const v2NCAAB = v2Resolved.filter(r => getSport(r) === 'NCAAB')

  const v1NBAMetrics = computeMetrics(v1NBA)
  const v1NCAABMetrics = computeMetrics(v1NCAAB)
  const v2NBAMetrics = computeMetrics(v2NBA)
  const v2NCAABMetrics = computeMetrics(v2NCAAB)

  // Guardrails
  const nbaThreshold = 50
  const ncaabThreshold = 40
  const v2NBACount = v2NBA.length
  const v2NCAABCount = v2NCAAB.length

  const metricsTable = (label: string, v1: ReturnType<typeof computeMetrics>, v2: ReturnType<typeof computeMetrics>) => (
    <div>
      {label && <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-3">{label}</h3>}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-5 py-3 text-zinc-500 text-xs uppercase tracking-widest">Metric</th>
              <th className="text-right px-5 py-3 text-zinc-500 text-xs uppercase tracking-widest">V1 (Legacy)</th>
              <th className="text-right px-5 py-3 text-zinc-500 text-xs uppercase tracking-widest">V2 (Clean)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-800">
              <td className="px-5 py-3 text-zinc-300">Sample</td>
              <td className="px-5 py-3 text-right text-white">{v1.sample}</td>
              <td className="px-5 py-3 text-right text-white">{v2.sample}</td>
            </tr>
            <tr className="border-b border-zinc-800">
              <td className="px-5 py-3 text-zinc-300">MAE</td>
              <td className="px-5 py-3 text-right text-white">{v1.sample ? v1.mae.toFixed(2) : '—'}</td>
              <td className="px-5 py-3 text-right text-green-400">{v2.sample ? v2.mae.toFixed(2) : '—'}</td>
            </tr>
            <tr className="border-b border-zinc-800">
              <td className="px-5 py-3 text-zinc-300">Spread Direction %</td>
              <td className="px-5 py-3 text-right text-white">{v1.sample ? `${v1.directionPct.toFixed(1)}%` : '—'}</td>
              <td className="px-5 py-3 text-right text-green-400">{v2.sample ? `${v2.directionPct.toFixed(1)}%` : '—'}</td>
            </tr>
            <tr>
              <td className="px-5 py-3 text-zinc-300">Avg Bias</td>
              <td className="px-5 py-3 text-right text-white">{v1.sample ? v1.avgBias.toFixed(2) : '—'}</td>
              <td className="px-5 py-3 text-right text-green-400">{v2.sample ? v2.avgBias.toFixed(2) : '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono">
      <Header user={user} />
      <Nav active="/v1v2" />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">V1 vs V2 Model Comparison</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Internal — admin only</p>
        </div>

        {/* Sample size cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'V1 Total', value: v1All.length },
            { label: 'V1 Resolved', value: v1Resolved.length },
            { label: 'V2 Total', value: v2All.length },
            { label: 'V2 Resolved', value: v2Resolved.length },
          ].map(stat => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-green-400">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Main comparison table */}
        {metricsTable('', v1Metrics, v2Metrics)}

        {/* Guardrails */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Guardrails — V2 Sample Progress</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
            {[
              { sport: 'NBA', count: v2NBACount, threshold: nbaThreshold },
              { sport: 'NCAAB', count: v2NCAABCount, threshold: ncaabThreshold },
            ].map(g => {
              const pct = Math.min((g.count / g.threshold) * 100, 100)
              const reached = g.count >= g.threshold
              return (
                <div key={g.sport}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-300">{g.sport}</span>
                    <span className="text-zinc-500">{g.count} / {g.threshold} resolved</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${reached ? 'bg-green-400' : 'bg-zinc-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {reached && (
                    <div className="mt-1 text-xs text-green-400 font-bold">Statistically meaningful sample reached</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sport breakdown */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Sport Breakdown</h2>
          <div className="space-y-6">
            {metricsTable('NBA', v1NBAMetrics, v2NBAMetrics)}
            {metricsTable('NCAAB', v1NCAABMetrics, v2NCAABMetrics)}
          </div>
        </div>
      </main>
    </div>
  )
}
