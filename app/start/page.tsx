import { createClient } from '../lib/supabase-server'
import { redirect } from 'next/navigation'
import Header from '../components/Header'
import Nav from '../components/Nav'

export default async function StartPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const sections = [
    {
      title: "What is What's the Edge?",
      content: "What's the Edge is a sports analytics platform that uses statistical modeling to identify disagreements between our model and the Vegas betting line. When our model significantly disagrees with Vegas, that disagreement is your signal."
    },
    {
      title: "How the model works",
      content: "We run 10,000 Monte Carlo simulations per game using power ratings, offensive and defensive efficiency adjusted for strength of schedule, pace, and historical matchup data. The result is a fair value line — what we think the spread or total should be. When that differs from Vegas by 5.5+ points, we flag it as a BET signal."
    },
    {
      title: "How to read a signal card",
      body: [
        { label: "Vegas thinks", desc: "The current Vegas spread or total for this game." },
        { label: "Our model thinks", desc: "What our model projects the spread or total should be." },
        { label: "You win if", desc: "The plain English condition for this bet to win." },
        { label: "Show details", desc: "Tap to see the raw numbers — fair value, Vegas line, and edge size." },
      ]
    },
    {
      title: "What BET means",
      content: "BET means our model disagrees with Vegas by 5.5 or more points on a spread or total. This is the threshold where the disagreement is meaningful, not noise. Smaller disagreements are visible on the Fair Value tab but not flagged as signals."
    },
    {
      title: "What CLV means",
      content: "CLV stands for Closing Line Value. It measures whether our signals beat the final Vegas line before the game starts. If we say a team is +7 and Vegas closes at +9, we captured 2 points of CLV. Consistently positive CLV is the strongest indicator of a real edge — it means the market is moving in our direction after we signal."
    },
    {
      title: "When signals update",
      content: "The model runs every night at 2am CT. Signals for today's games are ready by the time you wake up. The CLV agent and model investigator run at 8am and 8:10am CT with a morning briefing summarizing system health. Check the Briefings tab each morning for the full report."
    },
    {
      title: "What sports are covered",
      body: [
        { label: "NBA", desc: "Full coverage. Spreads and totals. Primary signal source." },
        { label: "NCAAB", desc: "Fair value lines available. Signals suspended pending CLV validation." },
        { label: "MLB", desc: "Launching March 26." },
        { label: "NFL / NCAAF", desc: "Coming this fall." },
      ]
    },
    {
      title: "Honest disclaimer",
      content: "This model is early-stage. We publish our real numbers, not marketing numbers. Check the CLV tab for the live track record updated daily."
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono">
      <Header user={user} />
      <Nav active="/start" />

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Start Here</h1>
          <p className="text-zinc-500 text-sm">Everything you need to know before placing your first bet with our signals.</p>
        </div>

        {sections.map((s: any, i: number) => (
          <div key={i} className="space-y-4">
            <h2 className="text-green-400 text-xs uppercase tracking-widest font-bold">{s.title}</h2>
            {s.content && (
              <p className="text-zinc-300 text-sm leading-relaxed">{s.content}</p>
            )}
            {s.body && (
              <div className="space-y-3">
                {s.body.map((item: any, j: number) => (
                  <div key={j} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex gap-4">
                    <div className="text-green-400 font-bold text-xs uppercase tracking-widest w-32 shrink-0 pt-0.5">{item.label}</div>
                    <div className="text-zinc-300 text-sm">{item.desc}</div>
                  </div>
                ))}
              </div>
            )}
            {i < sections.length - 1 && <div className="border-b border-zinc-800" />}
          </div>
        ))}

        <div className="border-t border-zinc-800 pt-8 space-y-3">
          <h2 className="text-green-400 text-xs uppercase tracking-widest font-bold">Finding your way around</h2>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Use the tabs at the top to navigate. <span className="text-white font-bold">Signals</span> shows today's BET signals. <span className="text-white font-bold">Fair Value</span> shows all model lines by sport. <span className="text-white font-bold">Model Tracker</span> shows our hit rate on resolved predictions. <span className="text-white font-bold">CLV</span> tracks closing line value over time. <span className="text-white font-bold">Briefings</span> has the morning agent report generated daily at 8am CT.
          </p>
        </div>
      </main>
    </div>
  )
}
