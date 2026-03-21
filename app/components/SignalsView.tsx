'use client';
import { useState } from 'react';
import Link from 'next/link';
import SportFilter, { filterRows, classifyGame, type FilterKey } from './SportFilter';
import SignalCard from './SignalCard';

interface SignalsViewProps {
  signals: any[];
  user: any;
  clvStats: {
    avgClv: string;
    avgClvPositive?: boolean;
    pctPos: string;
    n: number;
  };
}

export default function SignalsView({ signals, user, clvStats }: SignalsViewProps) {
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const { avgClv, avgClvPositive, pctPos, n } = clvStats;

  const filtered = filterRows(signals, filter);
  const visibleSignals = user ? filtered : filtered.slice(0, 1);
  const lockedCount = filtered.length - visibleSignals.length;

  // Compute counts for badge display
  const counts: Record<FilterKey, number> = { ALL: 0, NBA: 0, NCAAT: 0, NIT: 0, MLB: 0 };
  for (const s of signals) {
    const key = classifyGame(s.sport, s.game_date, s.home_team, s.away_team);
    counts[key]++;
    counts['ALL']++;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">NBA Avg CLV</div>
          <div className={`text-2xl font-bold ${avgClvPositive ? "text-green-400" : "text-red-400"}`}>{avgClvPositive ? "+" : "-"}{avgClv}%</div>
          <div className="text-zinc-600 text-xs mt-1">{n} unique bets</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">NBA CLV Positive</div>
          <div className="text-2xl font-bold text-green-400">{pctPos}%</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Active Signals</div>
          <div className="text-2xl font-bold text-green-400">{filtered.length}</div>
        </div>
      </div>

      <div>
        <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Today&apos;s Signals</h2>
        <SportFilter value={filter} onChange={setFilter} counts={counts} />
        {filtered.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-500 text-sm text-center">
            No signals yet today. Check back after the morning run.
          </div>
        ) : (
          <div className="space-y-3">
            {visibleSignals.map((s: any) => (
              <SignalCard key={s.id} s={s} />
            ))}
            {!user && lockedCount > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center space-y-4">
                <div className="text-zinc-400 text-sm">{lockedCount} more signal{lockedCount > 1 ? 's' : ''} today</div>
                <div className="text-zinc-600 text-xs">Sign in to unlock all signals, CLV analysis, and morning briefings</div>
                <Link href="/login" className="inline-block bg-green-400 text-black px-6 py-2 rounded font-bold text-sm hover:bg-green-300 transition">
                  Sign In to Unlock
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
