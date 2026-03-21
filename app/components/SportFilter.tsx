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

// NIT teams (2026) — any NCAAB game with either team in this list is NIT, not NCAA Tournament
const NIT_TEAMS = new Set([
  'dayton', 'uncw', 'unc wilmington', 'nevada', 'liberty', 'wake forest',
  'illinois st', 'illinois state', 'auburn', 'seattle', 'tulsa', 'unlv',
  'new mexico', 'george washington', 'gw', 'oklahoma st', 'oklahoma state',
  'wichita st', 'wichita state', 'cal', 'california', 'saint josephs',
  "saint joseph's", 'cal baptist',
]);

function isNitTeam(team: string): boolean {
  const t = team.toLowerCase().trim();
  // Check exact match or substring containment
  for (const nit of NIT_TEAMS) {
    if (t === nit || t.includes(nit) || nit.includes(t.split(' ').slice(0, 2).join(' '))) return true;
  }
  return false;
}

// Classify a game row into a filter key
export function classifyGame(sport: string, gameDate: string, homeTeam?: string, awayTeam?: string): FilterKey {
  if (sport !== 'NCAAB') return sport as FilterKey;
  try {
    const parts = gameDate.slice(0, 10).split('-');
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const inWindow = (month === 3 && day >= 14) || (month === 4 && day <= 8);
    if (!inWindow) return 'NIT';
    // Inside March Madness window: check NIT team list
    if (homeTeam && isNitTeam(homeTeam)) return 'NIT';
    if (awayTeam && isNitTeam(awayTeam)) return 'NIT';
    return 'NCAAT';
  } catch {
    return 'NIT';
  }
}

// Filter a list of rows by the selected filter
export function filterRows<T extends { sport: string; game_date: string; home_team?: string; away_team?: string }>(
  rows: T[],
  filter: FilterKey
): T[] {
  if (filter === 'ALL') return rows;
  return rows.filter(r => classifyGame(r.sport, r.game_date, r.home_team, r.away_team) === filter);
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
