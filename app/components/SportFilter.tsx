'use client';
import { useState } from 'react';

// Filter options with labels
const FILTERS = [
  { key: 'ALL', label: 'ALL' },
  { key: 'NBA', label: 'NBA' },
  { key: 'NCAAT', label: 'NCAA Tournament' },
  { key: 'NIT', label: 'NIT' },
  { key: 'MLB', label: 'MLB' },
] as const;

type FilterKey = typeof FILTERS[number]['key'];

// Classify a game row into a filter key
// Parses date string directly (no Date object) to avoid timezone issues
export function classifyGame(sport: string, gameDate: string): FilterKey {
  if (sport !== 'NCAAB') return sport as FilterKey;
  try {
    const parts = gameDate.slice(0, 10).split('-');
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if ((month === 3 && day >= 14) || (month === 4 && day <= 8)) return 'NCAAT';
    return 'NIT';
  } catch {
    return 'NIT';
  }
}

// Filter a list of rows by the selected filter
export function filterRows<T extends { sport: string; game_date: string }>(
  rows: T[],
  filter: FilterKey
): T[] {
  if (filter === 'ALL') return rows;
  return rows.filter(r => classifyGame(r.sport, r.game_date) === filter);
}

interface Props {
  value: FilterKey;
  onChange: (f: FilterKey) => void;
  counts?: Record<FilterKey, number>; // optional badge counts
}

export default function SportFilter({ value, onChange, counts }: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-zinc-800 mb-4">
      {FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`px-3 py-2 text-xs whitespace-nowrap transition ${
            value === f.key
              ? 'text-green-400 border-b-2 border-green-400 font-bold'
              : 'text-zinc-500 hover:text-white'
          }`}
        >
          {f.label}
          {counts && counts[f.key] > 0 && (
            <span className="ml-1 text-zinc-600">({counts[f.key]})</span>
          )}
        </button>
      ))}
    </div>
  );
}

export type { FilterKey };
