import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getDeduplicatedCLV() {
  const { data } = await supabase
    .from('scan_results')
    .select('clv, sport, game, team, market_name, side, timestamp')
    .not('clv', 'is', null)
    .gte('timestamp', '2026-03-17')
    .eq('sport', 'NBA')
    .order('timestamp', { ascending: true })

  if (!data || data.length === 0) return { avgClv: '0.00', pctPos: '0.0', n: 0 }

  const seen = new Map()
  for (const r of data) {
    const key = `${r.game || r.market_name}_${r.side || r.team}`
    if (!seen.has(key)) seen.set(key, r)
  }

  const unique = Array.from(seen.values())
  const clvs = unique.map(r => r.clv)
  const n = clvs.length
  const avg = clvs.reduce((sum, c) => sum + c, 0) / n * 100
  const pctPos = clvs.filter(c => c > 0).length / n * 100

  const avgClvNum = avg
  return { avgClv: Math.abs(avg).toFixed(2), avgClvPositive: avg >= 0, pctPos: pctPos.toFixed(1), n }
}
