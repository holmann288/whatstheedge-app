import { createClient } from './lib/supabase-server'
import { getDeduplicatedCLV } from './lib/clv'
import Header from './components/Header'
import Nav from './components/Nav'
import SignalsView from './components/SignalsView'

export default async function Home() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data: { user } } = await supabase.auth.getUser()

  const [edgesRes, clvStats] = await Promise.all([
    supabase.from('edges').select('*').gte('edge_pct', 5.5).eq('game_date', today).in('bet_type', ['spread', 'total']).order('edge_pct', { ascending: false }),
    getDeduplicatedCLV(),
  ])

  const signals = edgesRes.data || []

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono">
      <Header user={user} />
      <Nav active="/" />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <SignalsView signals={signals} user={user} clvStats={clvStats} />

        <div className="border border-dashed border-zinc-800 rounded-lg p-6 text-center text-zinc-600 text-sm">
          MLB signals launching March 26 · NFL & NCAAF coming this fall · Mobile app coming soon
        </div>
      </main>
    </div>
  )
}
