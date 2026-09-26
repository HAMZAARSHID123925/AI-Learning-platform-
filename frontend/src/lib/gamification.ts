/**
 * PPAcademia — src/lib/gamification.ts
 *
 * Client-side Gamification Engine (Keys, Streak, Streak Charges, XP)
 * Inspired by Brilliant.org's active retention mechanics.
 */

export interface KeysData {
  remaining: number;      // 0, 1, or 2 (Free users get 2 daily keys)
  lastResetDate: string;  // YYYY-MM-DD
}

export interface StreakData {
  count: number;          // Current consecutive days
  lastActiveDate: string; // YYYY-MM-DD
  charges: number;        // 0, 1, or 2 (Streak shields)
  longestStreak: number;
}

export interface XPData {
  total: number;
  thisWeek: number;
  leagueTier: string;     // e.g. "Hydrogen", "Lithium", "Carbon", "Einsteinium"
  leagueRank: number;
}

const TODAY_STR = () => new Date().toISOString().split('T')[0];

export function getKeysData(): KeysData {
  if (typeof window === 'undefined') return { remaining: 2, lastResetDate: TODAY_STR() };
  try {
    const raw = localStorage.getItem('daily_keys');
    if (raw) {
      const data: KeysData = JSON.parse(raw);
      if (data.lastResetDate !== TODAY_STR()) {
        const refreshed: KeysData = { remaining: 2, lastResetDate: TODAY_STR() };
        localStorage.setItem('daily_keys', JSON.stringify(refreshed));
        return refreshed;
      }
      return data;
    }
  } catch {}

  const defaultKeys: KeysData = { remaining: 2, lastResetDate: TODAY_STR() };
  try { localStorage.setItem('daily_keys', JSON.stringify(defaultKeys)); } catch {}
  return defaultKeys;
}

export function useOneKey(): boolean {
  if (typeof window === 'undefined') return true;
  const current = getKeysData();
  if (current.remaining <= 0) return false;
  current.remaining = Math.max(0, current.remaining - 1);
  try { localStorage.setItem('daily_keys', JSON.stringify(current)); } catch {}
  return true;
}

export function getStreakData(): StreakData {
  if (typeof window === 'undefined') {
    return { count: 1, lastActiveDate: TODAY_STR(), charges: 1, longestStreak: 1 };
  }
  try {
    const raw = localStorage.getItem('streak_data');
    if (raw) return JSON.parse(raw);
  } catch {}

  const defaultStreak: StreakData = {
    count: 1,
    lastActiveDate: TODAY_STR(),
    charges: 1,
    longestStreak: 1,
  };
  try { localStorage.setItem('streak_data', JSON.stringify(defaultStreak)); } catch {}
  return defaultStreak;
}

export function getXPData(): XPData {
  if (typeof window === 'undefined') {
    return { total: 150, thisWeek: 150, leagueTier: 'Carbon', leagueRank: 7 };
  }
  try {
    const raw = localStorage.getItem('xp_data');
    if (raw) return JSON.parse(raw);
  } catch {}

  const defaultXP: XPData = {
    total: 250,
    thisWeek: 250,
    leagueTier: 'Carbon',
    leagueRank: 7,
  };
  try { localStorage.setItem('xp_data', JSON.stringify(defaultXP)); } catch {}
  return defaultXP;
}
