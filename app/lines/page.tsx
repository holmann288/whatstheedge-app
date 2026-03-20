'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Header from '../components/Header'
import Nav from '../components/Nav'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SPORTS = ['All', 'NBA', 'NCAAB', 'MLB']
const BET_TYPES_ALL = ['Spreads', 'O/U', 'Moneyline']

export default function LinesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [sport, setSport] = useState('All')
  const [betType, setBetType] = useState('Spreads')
  const [user, setUser] = useState<any>(null)
  const BET_TYPES = sport === 'NCAAB' ? ['Spreads', 'O/U'] : BET_TYPES_ALL
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setUser(data.user)
    })

    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('edges')
      .select('*')
      .gte('game_date', today)
      .order('edge_pct', { ascending: false })
      .then(({ data }) => setRows(data || []))
  }, [])

  const typeMap: Record<string, string> = { 'Spreads': 'spread', 'O/U': 'total', 'Moneyline': 'moneyline' }

  const filtered = rows
    .filter(r => sport === 'All' || r.sport === sport)
    .filter(r => r.bet_type === typeMap[betType])

  const diff = (r: any) => {
    if (r.bet_type === 'moneyline') return Math.abs(r.edge_pct)
    return Math.abs(r.fair_value - r.market_value)
  }

  const diffLabel = (r: any) => {
    if (r.bet_type === 'moneyline') return `${Math.abs(r.edge_pct).toFixed(1)}%`
    return `${diff(r).toFixed(1)} pts`
  }

  const formatFair = (r: any) => {
    if (r.bet_type === 'spread') return `Fair: ${r.fair_value > 0 ? '+' : ''}${r.fair_value}`
    if (r.bet_type === 'total') return `Fair Total: ${r.fair_value}`
    if (r.bet_type === 'moneyline') return `Fair ML: ${r.fair_value > 0 ? '+' : ''}${r.fair_value}`
    return `Fair: ${r.fair_value}`
  }

  const edgeColor = (r: any) => {
    const d = diff(r)
    if (r.bet_type === 'moneyline') return d >= 10 ? 'text-green-400' : d >= 5 ? 'text-yellow-400' : 'text-zinc-400'
    return d >= 5.5 ? 'text-green-400' : d >= 3 ? 'text-yellow-400' : 'text-zinc-400'
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono">
      <Header user={user} />
      <Nav active="/lines" />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {/* Sport filter */}
        <div className="flex gap-2 flex-wrap">
          {SPORTS.map(s => (
            <button key={s} onClick={() => { setSport(s); if (s === 'NCAAB' && betType === 'Moneyline') setBetType('Spreads') }}
              className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition
                ${sport === s ? 'bg-green-400 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Bet type sub-tabs */}
        <div className="flex border-b border-zinc-800">
          {BET_TYPES.map(t => (
            <button key={t} onClick={() => setBetType(t)}
              className={`px-5 py-3 text-xs uppercase tracking-widest transition
                ${betType === t
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-zinc-500 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Showing</div>
            <div className="text-2xl font-bold text-green-400">{filtered.length}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Avg Edge</div>
            <div className="text-2xl font-bold text-green-400">
              {filtered.length ? (filtered.reduce((s, r) => s + diff(r), 0) / filtered.length).toFixed(1) : '—'} pts
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">BET Signals</div>
            <div className="text-2xl font-bold text-green-400">
              {filtered.filter(r => r.edge_pct >= 5.5).length}
            </div>
          </div>
        </div>

        {/* Lines table */}
        {filtered.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-500 text-sm text-center">
            No {betType} lines for {sport} today.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r: any) => (
              <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-5 py-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{r.sport}</span>
                    {r.edge_pct >= 5.5 && <span className="text-xs bg-green-400 text-black px-2 py-0.5 rounded font-bold">BET</span>}
                    <span className="text-sm text-zinc-300">{r.away_team} @ {r.home_team}</span>
                  </div>
                  <div className="text-white font-bold">{formatFair(r)}</div>
                  <div className="text-xs text-zinc-500">Market: {r.market_value} · {r.game_date}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className={`font-bold text-lg ${edgeColor(r)}`}>{diffLabel(r)}</div>
                  <div className="text-zinc-500 text-xs">vs market</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
