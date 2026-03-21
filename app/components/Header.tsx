import Link from 'next/link'
import { signOut } from '../actions/auth'

export default function Header({ user }: { user: any }) {
  return (
    <header className="border-b border-zinc-800 px-4 sm:px-6 py-4 flex items-center justify-between">
      <div>
        <Link href="/">
          <span className="text-green-400 font-bold text-xl tracking-tight">whats</span>
          <span className="text-white font-bold text-xl tracking-tight">theedge</span>
        </Link>
        <span className="ml-3 text-zinc-500 text-xs uppercase tracking-widest">Beta</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 text-xs">
        <span className="flex items-center gap-1 text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"></span>
          Live
        </span>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 truncate max-w-32 hidden sm:block">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="text-zinc-500 text-xs hover:text-white transition">Sign Out</button>
            </form>
          </div>
        ) : (
          <Link href="/login" className="bg-green-400 text-black px-3 py-1 rounded font-bold hover:bg-green-300 transition">
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}
