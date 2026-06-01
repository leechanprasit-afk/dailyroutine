// localStorage helpers — all data persists between sessions

import { RoutineStatus, RoutineItem, LunchMenuItem, DEFAULT_ROUTINES, DEFAULT_LUNCH_MENU } from './data';

const KEYS = {
  dailyStatus: 'fwl_daily_status',
  weeklyHistory: 'fwl_weekly_history',
  routines: 'fwl_routines',
  lunchMenu: 'fwl_lunch_menu',
  lastDate: 'fwl_last_date',
};

function todayKey() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

// Daily status: { routineId: RoutineStatus }
export function getDailyStatus(): Record<string, RoutineStatus> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(KEYS.dailyStatus);
  const lastDate = localStorage.getItem(KEYS.lastDate);
  const today = todayKey();

  // Reset if it's a new day
  if (lastDate !== today) {
    localStorage.setItem(KEYS.lastDate, today);
    localStorage.setItem(KEYS.dailyStatus, JSON.stringify({}));
    return {};
  }

  return stored ? JSON.parse(stored) : {};
}

export function setRoutineStatus(id: string, status: RoutineStatus) {
  if (typeof window === 'undefined') return;
  const current = getDailyStatus();
  current[id] = status;
  localStorage.setItem(KEYS.dailyStatus, JSON.stringify(current));
}

// Weekly history: { 'YYYY-MM-DD': { total: number, done: number } }
export function getWeeklyHistory(): Record<string, { total: number; done: number }> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(KEYS.weeklyHistory);
  return stored ? JSON.parse(stored) : {};
}

export function saveWeeklySnapshot(total: number, done: number) {
  if (typeof window === 'undefined') return;
  const history = getWeeklyHistory();
  history[todayKey()] = { total, done };
  localStorage.setItem(KEYS.weeklyHistory, JSON.stringify(history));
}

// Routine list (customizable)
export function getRoutines(): RoutineItem[] {
  if (typeof window === 'undefined') return DEFAULT_ROUTINES;
  const stored = localStorage.getItem(KEYS.routines);
  return stored ? JSON.parse(stored) : DEFAULT_ROUTINES;
}

export function saveRoutines(routines: RoutineItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.routines, JSON.stringify(routines));
}

// Lunch menu
export function getLunchMenu(): LunchMenuItem[] {
  if (typeof window === 'undefined') return DEFAULT_LUNCH_MENU;
  const stored = localStorage.getItem(KEYS.lunchMenu);
  return stored ? JSON.parse(stored) : DEFAULT_LUNCH_MENU;
}

export function saveLunchMenu(menu: LunchMenuItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.lunchMenu, JSON.stringify(menu));
}

// Returns last 7 days as array (oldest first)
export function getLast7Days(): Array<{ date: string; label: string; pct: number }> {
  const history = getWeeklyHistory();
  const days: Array<{ date: string; label: string; pct: number }> = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const entry = history[key];
    const pct = entry && entry.total > 0 ? Math.round((entry.done / entry.total) * 100) : 0;
    days.push({ date: key, label, pct });
  }

  return days;
}
