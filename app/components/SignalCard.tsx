'use client'
import { useState } from 'react'

export default function SignalCard({ s }: { s: any }) {
  const [expanded, setExpanded] = useState(false)

  const home = s.home_team
  const away = s.away_team
  const mkt = s.market_value
  const fair = s.fair_value

  const vegasSays = () => {
    if (s.bet_type === 'spread') {
      if (mkt < 0) return `${home} wins by ${Math.abs(mkt)} points`
      return `${away} wins by ${Math.abs(mkt)} points`
    }
    if (s.bet_type === 'total') {
      const dir = fair > mkt ? 'OVER' : 'UNDER'
      return `Combined score goes ${dir} ${mkt} points`
    }
    return `${mkt}`
  }

  const modelSays = () => {
    if (s.bet_type === 'spread') {
      if (fair < 0) return `${home} wins by ${Math.abs(fair)} points`
      if (fair > 0) return `${away} wins by ${Math.abs(fair)} points`
      return `A toss-up`
    }
    if (s.bet_type === 'total') {
      const dir = fair > mkt ? 'OVER' : 'UNDER'
      return `Combined score goes ${dir} ${fair} points`
    }
    return `${fair}`
  }

  const youWinIf = () => {
    if (s.bet_type === 'spread') {
      if (mkt < 0) {
        return `${away} loses by fewer than ${Math.abs(mkt)} points, or wins outright`
      }
      return `${away} wins by more than ${Math.abs(mkt)} points`
    }
    if (s.bet_type === 'total') {
      const dir = fair > mkt ? 'over' : 'under'
      if (dir === 'over') return `${away} and ${home} combine for more than ${mkt} total points`
      return `${away} and ${home} combine for fewer than ${mkt} total points`
    }
    return null
  }

  const edge = Math.abs(fair - mkt).toFixed(1)
  const winCondition = youWinIf()

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{s.sport}</span>
          <span className="text-xs bg-green-400 text-black px-2 py-0.5 rounded font-bold">BET</span>
          <span className="text-sm text-zinc-300">{away} @ {home}</span>
        </div>

      </div>

      {/* Three info rows */}
      <div className="px-4 pb-3 space-y-2">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-800 rounded-lg p-2 space-y-0.5">
            <div className="text-zinc-500 text-xs uppercase tracking-widest">Vegas thinks</div>
            <div className="text-white text-xs font-medium leading-snug">{vegasSays()}</div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-2 space-y-0.5">
            <div className="text-zinc-500 text-xs uppercase tracking-widest">Our model thinks</div>
            <div className="text-green-400 text-xs font-medium leading-snug">{modelSays()}</div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-2 space-y-0.5">
            <div className="text-zinc-500 text-xs uppercase tracking-widest">You win if</div>
            <div className="text-white text-xs font-medium leading-snug">{winCondition}</div>
          </div>
        </div>

        {/* Edge indicator */}
        <div className="flex items-center justify-between">
          <span className="text-zinc-600 text-xs">Model disagrees with Vegas by {edge} points</span>
          <button onClick={() => setExpanded(!expanded)}
            className="text-zinc-500 text-xs hover:text-white transition flex items-center gap-1">
            {expanded ? 'Hide details' : 'Show details'}
            <span className={`transition-transform inline-block ${expanded ? 'rotate-180' : ''}`}>▼</span>
          </button>
        </div>
      </div>

      {/* Expanded detail for sharp bettors */}
      {expanded && (
        <div className="border-t border-zinc-800 px-5 py-4 bg-zinc-950 space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Vegas Line</div>
              <div className="text-white font-bold text-lg">{mkt}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Fair Value</div>
              <div className="text-green-400 font-bold text-lg">{fair}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Edge</div>
              <div className="text-green-400 font-bold text-lg">{edge} pts</div>
            </div>
          </div>
          <div className="text-xs text-zinc-500">
            {s.bet_type === 'spread'
              ? `Our Monte Carlo model ran 10,000 simulations of this game and projects a spread of ${fair} vs Vegas ${mkt}.`
              : `Our model projects a combined total of ${fair} points vs Vegas ${mkt}.`}
          </div>
        </div>
      )}
    </div>
  )
}
