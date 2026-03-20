'use client'
import { useState } from 'react'

export default function SignalCard({ s }: { s: any }) {
  const [expanded, setExpanded] = useState(false)

  const formatSpread = (v: number) => v > 0 ? `+${v}` : `${v}`

  const winCondition = (s: any) => {
    const home = s.home_team?.split(' ').slice(-1)[0]
    const away = s.away_team?.split(' ').slice(-1)[0]
    const mkt = s.market_value

    if (s.bet_type === 'spread') {
      if (mkt < 0) {
        return `Win if ${away} loses by fewer than ${Math.abs(mkt)} points, or wins outright`
      } else {
        return `Win if ${away} wins by more than ${Math.abs(mkt)} points`
      }
    }
    if (s.bet_type === 'total') {
      const dir = s.fair_value > mkt ? 'over' : 'under'
      return dir === 'over'
        ? `Win if ${away} + ${home} combine for more than ${mkt} total points`
        : `Win if ${away} + ${home} combine for fewer than ${mkt} total points`
    }
    return null
  }

  const edge = Math.abs(s.fair_value - s.market_value).toFixed(1)
  const condition = winCondition(s)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Main card — always visible */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{s.sport}</span>
              <span className="text-xs bg-green-400 text-black px-2 py-0.5 rounded font-bold">BET</span>
              <span className="text-sm text-zinc-300">{s.away_team} @ {s.home_team}</span>
            </div>
            {condition && (
              <div className="text-white font-bold text-sm leading-snug">{condition}</div>
            )}
            <div className="text-xs text-zinc-500">{s.game_date}</div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex flex-col items-end gap-1 shrink-0"
          >
            <div className="text-green-400 font-bold text-lg">{edge} pts</div>
            <div className="text-zinc-500 text-xs">edge vs Vegas</div>
            <div className={`text-zinc-500 text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</div>
          </button>
        </div>
      </div>

      {/* Expanded detail — sharp bettor view */}
      {expanded && (
        <div className="border-t border-zinc-800 px-5 py-4 bg-zinc-950 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Vegas Says</div>
              <div className="text-white font-bold text-lg">
                {s.bet_type === 'spread' ? formatSpread(s.market_value) : s.market_value}
              </div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Our Model</div>
              <div className="text-green-400 font-bold text-lg">
                {s.bet_type === 'spread' ? formatSpread(s.fair_value) : s.fair_value}
              </div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Edge</div>
              <div className="text-green-400 font-bold text-lg">{edge} pts</div>
            </div>
          </div>
          <div className="text-xs text-zinc-400 leading-relaxed">
            {s.bet_type === 'spread'
              ? `Our model projects a spread of ${formatSpread(s.fair_value)} vs Vegas ${formatSpread(s.market_value)}. The ${Math.abs(s.fair_value - s.market_value).toFixed(1)} point gap represents the model's disagreement with the market.`
              : `Our model projects a total of ${s.fair_value} vs Vegas ${s.market_value}. The model sees ${s.fair_value > s.market_value ? 'more' : 'fewer'} points than Vegas by ${edge}.`
            }
          </div>
        </div>
      )}
    </div>
  )
}
