import { createClient } from '../lib/supabase-server'
import { redirect } from 'next/navigation'
import Header from '../components/Header'
import Nav from '../components/Nav'
import TotalsView from '../components/TotalsView'

export default async function TotalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: totals } = await supabase
    .from('edges')
    .select('*')
    .eq('bet_type', 'total')
    .gte('game_date', new Date().toISOString().slice(0, 10))
    .order('game_date', { ascending: true })
    .order('edge_pct', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono">
      <Header user={user} />
      <Nav active="/totals" />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-2xl font-bold mb-1">Over/Under Predictions</h1>
          <p className="text-zinc-500 text-sm">
            Model fair total vs market total. Green = model disagrees by 3+ points.
          </p>
        </div>

        <TotalsView rows={totals || []} />
      </main>
    </div>
  )
}
