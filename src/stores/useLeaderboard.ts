import type { GameId } from '../types';

export interface LeaderboardEntry {
  playerName: string;
  score: number;
  gameId: GameId;
  date: string;
}

const STORAGE_KEY = 'jamtalk-leaderboard';
const MAX_ENTRIES_PER_GAME = 10;

function loadAll(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(entries: LeaderboardEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

export function saveScore(entry: LeaderboardEntry): number {
  const all = loadAll();
  all.push(entry);

  // Keep only top MAX_ENTRIES_PER_GAME per game
  const grouped = new Map<string, LeaderboardEntry[]>();
  for (const e of all) {
    const list = grouped.get(e.gameId) || [];
    list.push(e);
    grouped.set(e.gameId, list);
  }

  const trimmed: LeaderboardEntry[] = [];
  for (const [, list] of grouped) {
    list.sort((a, b) => b.score - a.score);
    trimmed.push(...list.slice(0, MAX_ENTRIES_PER_GAME));
  }

  saveAll(trimmed);

  // Return rank of the new entry
  return getRank(entry.gameId, entry.score);
}

export function getTopScores(gameId: GameId, limit = MAX_ENTRIES_PER_GAME): LeaderboardEntry[] {
  const all = loadAll();
  return all
    .filter(e => e.gameId === gameId)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getRank(gameId: GameId, score: number): number {
  const all = loadAll();
  const gameScores = all
    .filter(e => e.gameId === gameId)
    .map(e => e.score)
    .sort((a, b) => b - a);

  const rank = gameScores.findIndex(s => score >= s);
  return rank === -1 ? gameScores.length + 1 : rank + 1;
}
