'use client'
import { useState } from 'react'
import SportFilter, { filterRows, type FilterKey } from './SportFilter'

export default function TotalsView({ rows }: { rows: any[] }) {
  const [filter, setFilter] = useState<FilterKey>('ALL')
  const filtered = filterRows(rows, filter)

  const avgEdge = filtered.length
    ? (filtered.reduce((sum: number, r: any) => sum + Math.abs(r.fair_value - r.market_value), 0) / filtered.length).toFixed(1)
    : '0'
  const strongSignals = filtered.filter((r: any) => Math.abs(r.edge_pct) >= 3).length

  const edgeColor = (edge: number) => {
    const abs = Math.abs(edge)
    if (abs >= 3) return 'text-green-400'
    if (abs >= 1.5) return 'text-yellow-400'
    return 'text-zinc-500'
  }

  return (
    <>
      <SportFilter value={filter} onChange={setFilter} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Total Games', value: filtered.length.toString() },
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
        {filtered.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-500 text-sm text-center">
            No over/under predictions for this filter. Try ALL.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r: any) => {
              const edge = r.fair_value - r.market_value
              const absEdge = Math.abs(edge)
              const direction = edge > 0 ? 'OVER' : 'UNDER'

              return (
                <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
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

                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-right shrink-0">
                    <div>
                      <div className="text-zinc-500 text-[11px] sm:text-[10px] uppercase tracking-widest">Fair</div>
                      <div className="text-sm font-bold text-white">{r.fair_value}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-[11px] sm:text-[10px] uppercase tracking-widest">Market</div>
                      <div className="text-sm font-bold text-white">{r.market_value}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-[11px] sm:text-[10px] uppercase tracking-widest">Edge</div>
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
    </>
  )
}
