import Link from 'next/link'

const tabs = [
  { label: 'Signals', href: '/' },
  { label: 'Fair Value', href: '/lines' },
  { label: 'Model Tracker', href: '/outcomes' },
  { label: 'CLV', href: '/clv' },
  { label: 'Briefings', href: '/briefings' },
]

export default function Nav({ active }: { active: string }) {
  return (
    <div className="border-b border-zinc-800 px-6 flex gap-1 overflow-x-auto">
      {tabs.map(tab => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-4 py-3 text-xs uppercase tracking-widest whitespace-nowrap transition
            ${active === tab.href
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-zinc-500 hover:text-white'
            }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
