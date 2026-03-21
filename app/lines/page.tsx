'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Header from '../components/Header'
import SignalCard from '../components/SignalCard'
import Nav from '../components/Nav'
import { useRouter } from 'next/navigation'

const supabase = createBrowserClient(
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
  const [authChecked, setAuthChecked] = useState(false)
  const BET_TYPES = sport === 'NCAAB' ? ['Spreads', 'O/U'] : BET_TYPES_ALL
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else { setUser(data.user); setAuthChecked(true) }
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

  const plainEnglish = (r: any) => {
    const home = r.home_team?.split(' ').slice(-1)[0]
    const away = r.away_team?.split(' ').slice(-1)[0]
    const mkt = r.market_value
    const fair = r.fair_value

    if (r.bet_type === 'spread') {
      const favored = mkt < 0 ? home : away
      const dog = mkt < 0 ? away : home
      const line = Math.abs(mkt)
      const direction = r.direction === 'home' ? home : away
      if (mkt < 0) {
        return `Win if ${dog} loses by fewer than ${line} points, or wins outright. Model says this game is much closer than Vegas thinks.`
      } else {
        return `Win if ${away} wins by more than ${line} points. Model sees ${away} as stronger than Vegas implies.`
      }
    }

    if (r.bet_type === 'total') {
      const direction = fair > mkt ? 'over' : 'under'
      const line = mkt
      if (direction === 'over') {
        return `Win if ${away} + ${home} combine for more than ${line} total points. Model projects a higher-scoring game than Vegas expects.`
      } else {
        return `Win if ${away} + ${home} combine for fewer than ${line} total points. Model projects a lower-scoring game than Vegas expects.`
      }
    }

    return null
  }

  const edgeColor = (r: any) => {
    const d = diff(r)
    if (r.bet_type === 'moneyline') return d >= 10 ? 'text-green-400' : d >= 5 ? 'text-yellow-400' : 'text-zinc-400'
    return d >= 5.5 ? 'text-green-400' : d >= 3 ? 'text-yellow-400' : 'text-zinc-400'
  }

  if (!authChecked) return <div className="min-h-screen bg-zinc-950" />

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
              {filtered.length ? (filtered.reduce((s, r) => s + diff(r), 0) / filtered.length).toFixed(1) : '—'}{betType === 'Moneyline' ? '%' : ' pts'}
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
        {betType === 'Moneyline' ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-16 text-center space-y-3">
            <div className="text-2xl">🚧</div>
            <div className="text-white font-bold text-sm">Moneyline Fair Values Coming Soon</div>
            <div className="text-zinc-500 text-xs">Model calibration in progress. Use Spreads and O/U for signals.</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-500 text-sm text-center">
            No {betType} lines for {sport} today.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r: any) => (
                <SignalCard key={r.id} s={r} />
              ))}
          </div>
        )}
      </main>
    </div>
  )
}
