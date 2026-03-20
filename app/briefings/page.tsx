import { createClient } from '../lib/supabase-server'
import { redirect } from 'next/navigation'
import Header from '../components/Header'
import Nav from '../components/Nav'

export default async function BriefingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: briefings } = await supabase
    .from('briefings')
    .select('id, content, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  const all = briefings || []

  const typeLabel = (id: string) => {
    if (id.startsWith('morning_')) return { label: 'Morning Briefing', color: 'text-green-400' }
    if (id.startsWith('clv_')) return { label: 'CLV Analysis', color: 'text-blue-400' }
    if (id.startsWith('model_')) return { label: 'Model Investigation', color: 'text-yellow-400' }
    return { label: id, color: 'text-zinc-400' }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono">
      <Header user={user} />
      <Nav active="/briefings" />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <h2 className="text-xs uppercase tracking-widest text-zinc-500">Agent Briefings</h2>
        {all.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-500 text-sm text-center">
            No briefings yet. Check back after 8:00 AM.
          </div>
        ) : (
          all.map((b: any) => {
            const { label, color } = typeLabel(b.id)
            const date = b.id.split('_').slice(1).join('-') || b.created_at?.split('T')[0]
            return (
              <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-widest ${color}`}>{label}</span>
                  <span className="text-zinc-600 text-xs">{date}</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{b.content}</p>
              </div>
            )
          })
        )}
      </main>
    </div>
  )
}
